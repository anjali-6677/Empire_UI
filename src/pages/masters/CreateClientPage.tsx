/**
 * Create & Edit Client Master Page
 * Location: src/pages/masters/CreateClientPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Client } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import { CreatableCombobox } from '../../components/ui/CreatableCombobox';
import { Building2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();
  const { state, addItem, updateItem } = useERPStore();

  const isEditMode = Boolean(clientId);
  const clients = state.clients || [];
  const existingClient = clients.find((c) => c.id === clientId);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [type, setType] = useState('Corporate');
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultTypes = [
    'Corporate / Enterprise',
    'Real Estate Developer',
    'Individual Owner',
    'Government / PSU',
    'Architect / PMC Firm',
  ];

  const allTypes = Array.from(new Set([...defaultTypes, ...customTypes, type])).map((t) => ({
    id: t,
    label: t,
  }));

  useEffect(() => {
    if (isEditMode && existingClient) {
      setCode(existingClient.code);
      setName(existingClient.name);
      setCompanyName(existingClient.companyName || existingClient.name);
      setType(existingClient.type || 'Corporate / Enterprise');
      setGstin(existingClient.gstin);
      setCity(existingClient.city);
      setStateName(existingClient.state || '');
      setAddress(existingClient.address || '');
      setContactPerson(existingClient.contactPerson);
      setPhone(existingClient.phone);
      setEmail(existingClient.email);
      setPaymentTermsDays(existingClient.paymentTermsDays || 30);
    } else {
      setCode(`CLI-${String(clients.length + 1).padStart(3, '0')}`);
    }
  }, [isEditMode, existingClient, clients.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim() || !contactPerson.trim()) {
      setErrorMessage('Client code, legal name, and primary contact are required.');
      return;
    }

    // Code uniqueness check
    const isDuplicate = clients.some(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.id !== clientId
    );

    if (isDuplicate) {
      setErrorMessage(`Client code '${code}' already exists. Code must be unique.`);
      return;
    }

    if (isEditMode && clientId) {
      updateItem('clients', clientId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        companyName: companyName.trim() || name.trim(),
        type,
        gstin: gstin.trim(),
        city: city.trim(),
        state: stateName.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        paymentTermsDays,
      });
    } else {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        companyName: companyName.trim() || name.trim(),
        type,
        gstin: gstin.trim(),
        city: city.trim(),
        state: stateName.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        paymentTermsDays,
        isActive: true,
        status: 'active',
      };
      addItem('clients', newClient);
    }

    navigate('/masters/clients');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => navigate('/masters/clients')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#B39A6A]" />
            {isEditMode ? `Edit Client: ${existingClient?.name || ''}` : 'Add Client'}
          </h1>
          <p className="text-sm text-slate-600">
            Manage client details, contacts, billing information and payment terms.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Client Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. CLI-RELIANCE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <CreatableCombobox
              label="Client Classification"
              value={type}
              options={allTypes}
              getOptionId={(opt) => opt.id}
              getOptionLabel={(opt) => opt.label}
              searchPlaceholder="Search or create classification..."
              canCreate={true}
              createLabel={(q) => `Create "${q}"`}
              onChange={(val) => setType(val)}
              onCreate={(query) => {
                setCustomTypes((prev) => [...prev, query]);
                setType(query);
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Client Legal Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Reliance Industries Limited"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
            <input
              type="text"
              placeholder="e.g. 27AAACR1234H1Z1"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Credit Days</label>
            <input
              type="number"
              min={0}
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Representative *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Mehta"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98211 44332"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. v.mehta@ril.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Billing Address</label>
          <textarea
            rows={2}
            placeholder="Official billing address for tax invoices"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={() => navigate('/masters/clients')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="gap-2">
            <Save className="h-4 w-4" /> Save Client
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientPage;
