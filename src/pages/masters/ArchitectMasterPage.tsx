/**
 * Architect Master Page
 * Location: src/pages/masters/ArchitectMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { ArchitectMaster } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  Compass,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

export const ArchitectMasterPage: React.FC = () => {
  const { state, createArchitect, updateArchitect, toggleArchitectStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArch, setEditingArch] = useState<ArchitectMaster | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const architects = state.architects || [];
  const projects = state.projects || [];

  const filteredArchitects = architects.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.contactPerson && a.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.city && a.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeCount = architects.filter((a) => a.status === 'Active').length;

  const handleOpenModal = (arch?: ArchitectMaster) => {
    setErrorMessage(null);
    if (arch) {
      setEditingArch(arch);
      setCode(arch.code);
      setName(arch.name);
      setContactPerson(arch.contactPerson || '');
      setEmail(arch.email || '');
      setPhone(arch.phone || '');
      setCity(arch.city || '');
      setAddress(arch.address || '');
    } else {
      setEditingArch(null);
      setCode(`ARC-${String(architects.length + 1).padStart(3, '0')}`);
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setCity('Mumbai');
      setAddress('');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim()) {
      setErrorMessage('Architect Code and Firm Name are required.');
      return;
    }

    if (editingArch) {
      const res = updateArchitect(editingArch.id, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update architect.');
        return;
      }
    } else {
      const res = createArchitect({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create architect.');
        return;
      }
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-[#B39A6A]" />
            Architect & Design Master
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage principal architectural firms, interior designers, & design consultants.
          </p>
        </div>
        <PrimaryActionButton
          label="Add Architect Firm"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Registered Design Firms</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{architects.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Design Partners</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, firm name, contact, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Architect Code</th>
                <th className="py-3 px-4">Firm Name</th>
                <th className="py-3 px-4">Principal Contact</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-center">Assigned Projects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredArchitects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No architectural firms found.
                  </td>
                </tr>
              ) : (
                filteredArchitects.map((a) => {
                  const assignedCount = projects.filter(
                    (prj) => prj.architectId === a.id || prj.architectName?.toLowerCase() === a.name.toLowerCase()
                  ).length;

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Architect Firm',
                      icon: Edit,
                      onClick: () => handleOpenModal(a),
                    },
                    {
                      id: 'toggle_status',
                      label: a.status === 'Active' ? 'Deactivate Architect' : 'Activate Architect',
                      icon: a.status === 'Active' ? XCircle : CheckCircle,
                      variant: a.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => toggleArchitectStatus(a.id),
                    },
                  ];

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{a.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{a.name}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{a.contactPerson || '-'}</td>
                      <td className="py-3 px-4 text-xs">
                        {a.email && (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {a.email}
                          </div>
                        )}
                        {a.phone && (
                          <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px] mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {a.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">{a.city || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold inline-flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {assignedCount} projects
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            a.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${a.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Architect */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingArch ? 'Edit Architect Firm' : 'Create Architect Firm'}
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Architect Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ARC-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Architect / Studio Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hafeez Contractor & Associates"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Designer / Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Ar. Hafeez Contractor"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="studio@architects.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98211 44556"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Studio Address</label>
                <textarea
                  rows={2}
                  placeholder="Design studio location, street address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingArch ? 'Save Firm' : 'Create Architect Firm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectMasterPage;
