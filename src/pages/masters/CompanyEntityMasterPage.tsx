/**
 * Company / Business Entity Master Page
 * Location: src/pages/masters/CompanyEntityMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CompanyEntity } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Landmark,
  Briefcase,
} from 'lucide-react';

export const CompanyEntityMasterPage: React.FC = () => {
  const { state, createCompanyEntity, updateCompanyEntity, toggleCompanyStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingComp, setEditingComp] = useState<CompanyEntity | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [cin, setCin] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [stateName, setStateName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const companies = state.companyEntities || [];
  const bankAccounts = state.bankAccounts || [];
  const projects = state.projects || [];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.pan && c.pan.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeCount = companies.filter((c) => c.status === 'Active').length;

  const handleOpenModal = (comp?: CompanyEntity) => {
    setErrorMessage(null);
    if (comp) {
      setEditingComp(comp);
      setCode(comp.code);
      setLegalName(comp.legalName);
      setTradeName(comp.tradeName || '');
      setGstin(comp.gstin || '');
      setPan(comp.pan || '');
      setCin(comp.cin || '');
      setRegisteredAddress(comp.registeredAddress || '');
      setStateName(comp.state || '');
      setStateCode(comp.stateCode || '');
    } else {
      setEditingComp(null);
      setCode(`CMP-${String(companies.length + 1).padStart(3, '0')}`);
      setLegalName('');
      setTradeName('');
      setGstin('');
      setPan('');
      setCin('');
      setRegisteredAddress('');
      setStateName('Maharashtra');
      setStateCode('27');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !legalName.trim()) {
      setErrorMessage('Entity Code and Legal Registered Name are required.');
      return;
    }

    if (editingComp) {
      const res = updateCompanyEntity(editingComp.id, {
        code: code.trim().toUpperCase(),
        legalName: legalName.trim(),
        tradeName: tradeName.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        cin: cin.trim().toUpperCase(),
        registeredAddress: registeredAddress.trim(),
        state: stateName.trim(),
        stateCode: stateCode.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update company entity.');
        return;
      }
    } else {
      const res = createCompanyEntity({
        code: code.trim().toUpperCase(),
        legalName: legalName.trim(),
        tradeName: tradeName.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        cin: cin.trim().toUpperCase(),
        registeredAddress: registeredAddress.trim(),
        state: stateName.trim(),
        stateCode: stateCode.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create company entity.');
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
            <Building2 className="h-6 w-6 text-[#B39A6A]" />
            Company / Business Entity Master
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage corporate entities, GSTIN registrations, and legal contracting entities.
          </p>
        </div>
        <PrimaryActionButton
          label="Add Corporate Entity"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Legal Entities</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{companies.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Entities</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Linked Bank Accounts</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{bankAccounts.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, legal name, GSTIN, PAN..."
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
                <th className="py-3 px-4">Entity Code</th>
                <th className="py-3 px-4">Legal Registered Name</th>
                <th className="py-3 px-4">Trade Name</th>
                <th className="py-3 px-4">GSTIN & State</th>
                <th className="py-3 px-4">PAN / CIN</th>
                <th className="py-3 px-4 text-center">Linked Banks</th>
                <th className="py-3 px-4 text-center">Projects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                    No corporate business entities found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const linkedBanks = bankAccounts.filter(
                    (b) => b.companyEntityId === c.id || b.companyEntityName === c.legalName
                  ).length;
                  const assignedPrjs = projects.filter(
                    (p) => p.companyEntityId === c.id
                  ).length;

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Corporate Entity',
                      icon: Edit,
                      onClick: () => handleOpenModal(c),
                    },
                    {
                      id: 'toggle_status',
                      label: c.status === 'Active' ? 'Deactivate Entity' : 'Activate Entity',
                      icon: c.status === 'Active' ? XCircle : CheckCircle,
                      variant: c.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => toggleCompanyStatus(c.id),
                    },
                  ];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.legalName}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{c.tradeName || '-'}</td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <div className="font-bold text-slate-800">{c.gstin || '-'}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{c.state} ({c.stateCode || '-'})</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-700">
                        <div>PAN: {c.pan || '-'}</div>
                        {c.cin && <div className="text-[11px] text-slate-500">CIN: {c.cin}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold inline-flex items-center gap-1">
                          <Landmark className="h-3 w-3" />
                          {linkedBanks} banks
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold inline-flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {assignedPrjs} prj
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            c.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${c.legalName}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Entity */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingComp ? 'Edit Business Entity' : 'Create Business Entity'}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Entity Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CMP-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Name (Brand Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Flutebyte Interiors"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Registered Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flutebyte Technologies Pvt. Ltd."
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1ZH"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CIN Number</label>
                  <input
                    type="text"
                    placeholder="U74999MH2021PTC123456"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST State Code</label>
                  <input
                    type="text"
                    placeholder="27"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
                <textarea
                  rows={2}
                  placeholder="Registered office address..."
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingComp ? 'Save Entity' : 'Create Entity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyEntityMasterPage;
