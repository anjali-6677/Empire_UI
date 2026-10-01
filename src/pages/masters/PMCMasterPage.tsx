/**
 * PMC (Project Management Consultant) Master Page
 * Location: src/pages/masters/PMCMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { PMCMaster } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  Briefcase,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

export const PMCMasterPage: React.FC = () => {
  const { state, createPMC, updatePMC, togglePMCStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPMC, setEditingPMC] = useState<PMCMaster | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pmcs = state.pmcs || [];
  const projects = state.projects || [];

  const filteredPMCs = pmcs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.contactPerson && p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeCount = pmcs.filter((p) => p.status === 'Active').length;

  const handleOpenModal = (pmc?: PMCMaster) => {
    setErrorMessage(null);
    if (pmc) {
      setEditingPMC(pmc);
      setCode(pmc.code);
      setName(pmc.name);
      setContactPerson(pmc.contactPerson || '');
      setEmail(pmc.email || '');
      setPhone(pmc.phone || '');
      setCity(pmc.city || '');
      setAddress(pmc.address || '');
    } else {
      setEditingPMC(null);
      setCode(`PMC-${String(pmcs.length + 1).padStart(3, '0')}`);
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
      setErrorMessage('PMC Code and Firm Name are required.');
      return;
    }

    if (editingPMC) {
      const res = updatePMC(editingPMC.id, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update PMC.');
        return;
      }
    } else {
      const res = createPMC({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create PMC.');
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
            <Briefcase className="h-6 w-6 text-[#B39A6A]" />
            PMC Master (Project Management Consultants)
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage external project management consultancy firms & site audit contacts.
          </p>
        </div>
        <PrimaryActionButton
          label="Add New PMC"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Registered PMCs</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{pmcs.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Consultant Firms</div>
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
                <th className="py-3 px-4">PMC Code</th>
                <th className="py-3 px-4">PMC Firm Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-center">Assigned Projects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredPMCs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No PMC consultant firms found.
                  </td>
                </tr>
              ) : (
                filteredPMCs.map((p) => {
                  const assignedCount = projects.filter(
                    (prj) => prj.pmcId === p.id || prj.pmcName?.toLowerCase() === p.name.toLowerCase()
                  ).length;

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit PMC Firm',
                      icon: Edit,
                      onClick: () => handleOpenModal(p),
                    },
                    {
                      id: 'toggle_status',
                      label: p.status === 'Active' ? 'Deactivate PMC' : 'Activate PMC',
                      icon: p.status === 'Active' ? XCircle : CheckCircle,
                      variant: p.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => togglePMCStatus(p.id),
                    },
                  ];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{p.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{p.contactPerson || '-'}</td>
                      <td className="py-3 px-4 text-xs">
                        {p.email && (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {p.email}
                          </div>
                        )}
                        {p.phone && (
                          <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px] mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {p.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">{p.city || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold inline-flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {assignedCount} projects
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${p.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit PMC */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingPMC ? 'Edit PMC Firm' : 'Create PMC Firm'}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PMC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PMC-001"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">PMC Firm Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cushman & Wakefield PMC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Rajesh Sharma (Lead Consultant)"
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
                    placeholder="contact@pmcfirm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
                <textarea
                  rows={2}
                  placeholder="Office address, tech park name..."
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
                  {editingPMC ? 'Save PMC' : 'Create PMC'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMCMasterPage;
