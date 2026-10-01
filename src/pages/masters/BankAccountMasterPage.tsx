/**
 * Bank Account Master Page
 * Location: src/pages/masters/BankAccountMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { BankAccount } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  Landmark,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export const BankAccountMasterPage: React.FC = () => {
  const { state, createBankAccount, updateBankAccount, toggleBankAccountStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);

  // Form states
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [branch, setBranch] = useState('');
  const [accountType, setAccountType] = useState<'Current' | 'Savings' | 'Escrow' | 'Overdraft' | 'Credit' | 'OD/CC'>('Current');
  const [companyEntityId, setCompanyEntityId] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bankAccounts = state.bankAccounts || [];
  const companyEntities = state.companyEntities || [];

  const filteredAccounts = bankAccounts.filter((b) => {
    const matchesSearch =
      b.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.accountNumber.includes(searchQuery) ||
      b.ifsc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.companyEntityName && b.companyEntityName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalBalance = bankAccounts.reduce((acc, b) => acc + (b.openingBalance || 0), 0);
  const activeCount = bankAccounts.filter((b) => b.status === 'Active').length;

  const handleOpenModal = (bank?: BankAccount) => {
    setErrorMessage(null);
    if (bank) {
      setEditingBank(bank);
      setAccountName(bank.accountName);
      setBankName(bank.bankName);
      setAccountNumber(bank.accountNumber);
      setIfsc(bank.ifsc);
      setBranch(bank.branch || '');
      setAccountType(bank.accountType || 'Current');
      setCompanyEntityId(bank.companyEntityId || '');
      setOpeningBalance(bank.openingBalance || 0);
    } else {
      setEditingBank(null);
      setAccountName('');
      setBankName('');
      setAccountNumber('');
      setIfsc('');
      setBranch('');
      setAccountType('Current');
      setCompanyEntityId(companyEntities[0]?.id || '');
      setOpeningBalance(0);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const compObj = companyEntities.find((c) => c.id === companyEntityId);

    if (editingBank) {
      const res = updateBankAccount(editingBank.id, {
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        branch: branch.trim(),
        accountType,
        companyEntityId,
        companyEntityName: compObj?.legalName || compObj?.tradeName,
        openingBalance,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update bank account.');
        return;
      }
    } else {
      const res = createBankAccount({
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        branch: branch.trim(),
        accountType,
        companyEntityId,
        companyEntityName: compObj?.legalName || compObj?.tradeName,
        openingBalance,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create bank account.');
        return;
      }
    }
    setShowModal(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Landmark className="h-6 w-6 text-[#B39A6A]" />
            Bank Accounts
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage corporate bank accounts for vendor AP payments and client receipts.
          </p>
        </div>
        <PrimaryActionButton
          label="Add Bank Account"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Accounts</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{bankAccounts.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Accounts</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Opening Liquidity</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(totalBalance)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search account name, bank, IFSC, company..."
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
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Bank Name & Branch</th>
                <th className="py-3 px-4">Account No. (Masked)</th>
                <th className="py-3 px-4">IFSC Code</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 text-right">Opening Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No bank accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((b) => {
                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Bank Account',
                      icon: Edit,
                      onClick: () => handleOpenModal(b),
                    },
                    {
                      id: 'toggle_status',
                      label: b.status === 'Active' ? 'Deactivate Account' : 'Activate Account',
                      icon: b.status === 'Active' ? XCircle : CheckCircle,
                      variant: b.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => toggleBankAccountStatus(b.id),
                    },
                  ];

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {b.accountName}
                        <span className="block text-[11px] text-slate-500 font-normal">{b.accountType} Account</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{b.bankName}</div>
                        <div className="text-xs text-slate-500">{b.branch || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 font-bold">{b.maskedAccountNumber}</td>
                      <td className="py-3 px-4 font-mono text-xs text-amber-800 font-semibold">{b.ifsc}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {b.companyEntityName || 'Flutebyte Technologies'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-slate-900">
                        {formatCurrency(b.openingBalance || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            b.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${b.accountName}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Bank Account */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingBank ? 'Edit Bank Account' : 'Create Bank Account'}
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Current Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Escrow">Escrow Account</option>
                    <option value="OD/CC">OD / Overdraft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12345678904921"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Worli, Mumbai"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Business Entity</label>
                <select
                  value={companyEntityId}
                  onChange={(e) => setCompanyEntityId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">(Select Entity)</option>
                  {companyEntities.map((c) => (
                    <option key={c.id} value={c.id}>{c.legalName} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingBank ? 'Save Account' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountMasterPage;
