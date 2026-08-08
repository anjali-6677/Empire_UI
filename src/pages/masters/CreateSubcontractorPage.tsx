/**
 * Create & Edit Subcontractor Master Page
 * Location: src/pages/masters/CreateSubcontractorPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Subcontractor } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import { CreatableCombobox } from '../../components/ui/CreatableCombobox';
import { Users, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export const CreateSubcontractorPage: React.FC = () => {
  const navigate = useNavigate();
  const { subcontractorId } = useParams<{ subcontractorId?: string }>();
  const { state, addItem, updateItem } = useERPStore();

  const isEditMode = Boolean(subcontractorId);
  const subcontractors = state.subcontractors || [];
  const existingSubcontractor = subcontractors.find((s) => s.id === subcontractorId);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('Civil & Masonry');
  const [customTrades, setCustomTrades] = useState<string[]>([]);
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [labourCapacity, setLabourCapacity] = useState<number>(30);
  const [rateType, setRateType] = useState<string>('Item Rate');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultTrades = [
    'Civil & Masonry',
    'Electrical Works',
    'Plumbing & Public Health',
    'HVAC & Ducting',
    'Carpentry & Joinery',
    'Painting & Polishing',
    'Structural Steel Work',
    'Tile & Marble Laying',
  ];

  const allTrades = Array.from(new Set([...defaultTrades, ...customTrades, trade])).map((t) => ({
    id: t,
    label: t,
  }));

  useEffect(() => {
    if (isEditMode && existingSubcontractor) {
      setCode(existingSubcontractor.code);
      setName(existingSubcontractor.name);
      setTrade(existingSubcontractor.trade || existingSubcontractor.tradeCategory || 'Civil & Masonry');
      setGstin(existingSubcontractor.gstin || '');
      setPan(existingSubcontractor.pan || '');
      setCity(existingSubcontractor.city || '');
      setStateName(existingSubcontractor.state || '');
      setContactPerson(existingSubcontractor.contactPerson);
      setPhone(existingSubcontractor.phone);
      setEmail(existingSubcontractor.email || '');
      setLabourCapacity(existingSubcontractor.labourCapacity || 30);
      setRateType(existingSubcontractor.rateType || 'Item Rate');
    } else {
      setCode(`SUB-${String(subcontractors.length + 1).padStart(3, '0')}`);
    }
  }, [isEditMode, existingSubcontractor, subcontractors.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim() || !contactPerson.trim()) {
      setErrorMessage('Subcontractor code, agency name, and primary contact are required.');
      return;
    }

    // Code uniqueness check
    const isDuplicate = subcontractors.some(
      (s) => s.code.toLowerCase() === code.trim().toLowerCase() && s.id !== subcontractorId
    );

    if (isDuplicate) {
      setErrorMessage(`Subcontractor code '${code}' already exists. Code must be unique.`);
      return;
    }

    if (isEditMode && subcontractorId) {
      updateItem('subcontractors', subcontractorId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        trade,
        gstin: gstin.trim(),
        pan: pan.trim(),
        city: city.trim(),
        state: stateName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        labourCapacity,
        rateType,
      });
    } else {
      const newSub: Subcontractor = {
        id: `sub-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        trade,
        tradeCategory: trade,
        gstin: gstin.trim(),
        pan: pan.trim(),
        city: city.trim(),
        state: stateName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        labourCapacity,
        rateType,
        status: 'empanelled',
        rating: '4.7 ★',
      };
      addItem('subcontractors', newSub);
    }

    navigate('/masters/subcontractors');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => navigate('/masters/subcontractors')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#B39A6A]" />
            {isEditMode ? `Edit Subcontractor: ${existingSubcontractor?.name || ''}` : 'Add Subcontractor'}
          </h1>
          <p className="text-sm text-slate-600">
            Manage subcontractor trades, contacts, rates and documents.
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subcontractor Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SUB-CIV-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <CreatableCombobox
              label="Trade Specialization"
              value={trade}
              options={allTrades}
              getOptionId={(opt) => opt.id}
              getOptionLabel={(opt) => opt.label}
              searchPlaceholder="Search or create trade specialization..."
              canCreate={true}
              createLabel={(q) => `Create Trade "${q}"`}
              onChange={(val) => setTrade(val)}
              onCreate={(query) => {
                setCustomTrades((prev) => [...prev, query]);
                setTrade(query);
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Contractor / Agency Legal Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Apex Civil Contractors LLP"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Labour Force Capacity</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 35 Workers"
              value={labourCapacity}
              onChange={(e) => setLabourCapacity(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rate Structure Preference</label>
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="Item Rate">Item Rate / Unit BOQ</option>
              <option value="Lump-sum">Lump-sum Package</option>
              <option value="Area-based">Area-based (Sq.Ft)</option>
              <option value="Daily Wages">Daily Wages / Manpower</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
            <input
              type="text"
              placeholder="e.g. ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Contact Person *</label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Kumar"
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
              placeholder="e.g. +91 98990 88776"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. info@apexcivil.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Base Location</label>
            <input
              type="text"
              placeholder="e.g. Pune"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number (if registered)</label>
            <input
              type="text"
              placeholder="e.g. 27ABCDE1234F1Z9"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none uppercase"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={() => navigate('/masters/subcontractors')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="gap-2">
            <Save className="h-4 w-4" /> Save Subcontractor
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubcontractorPage;
