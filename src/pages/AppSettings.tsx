import * as React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Settings, CheckCircle2, Building, DollarSign, Hash } from 'lucide-react';

export const AppSettings: React.FC = () => {
  const [toast, setToast] = React.useState<string | null>(null);

  const [companyName, setCompanyName] = React.useState('Flutebyte Technologies Contracting Pvt Ltd');
  const [gstin, setGstin] = React.useState('29AAACE1234A1Z5');
  const [currency, setCurrency] = React.useState('INR (₹)');
  const [dateFormat, setDateFormat] = React.useState('YYYY-MM-DD');
  const [boardSignoffLimit, setBoardSignoffLimit] = React.useState('500000');
  const [poPrefix, setPoPrefix] = React.useState('PO-2026-');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('System settings and configuration preferences saved successfully');
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-emerald-600 text-white px-4 py-2 rounded shadow-lg font-bold text-xs flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span>Administration</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 font-bold">Settings</span>
      </nav>

      {/* Header */}
      <div className="border-b border-gray-150 pb-4">
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-600" />
          ERP Core Preferences & System Configuration
        </h1>
        <p className="text-[10.5px] text-gray-400 font-medium">Company profiles, tax settings, currency formats, notification policies and document numbering.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Company Profile */}
        <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
            <Building className="h-4 w-4 text-brand-600" /> Company Profile & Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px]">Company Entity Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-gray-250 rounded p-2 text-xs font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px]">Corporate GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full border border-gray-250 rounded p-2 text-xs font-medium text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Currency & Locale */}
        <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-600" /> Currency, Locale & Date Format
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px]">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-gray-250 rounded p-2 text-xs font-medium text-gray-800 bg-white"
              >
                <option value="INR (₹)">Indian Rupee - INR (₹)</option>
                <option value="USD ($)">US Dollar - USD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px]">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full border border-gray-250 rounded p-2 text-xs font-medium text-gray-800 bg-white"
              >
                <option value="YYYY-MM-DD">ISO Standard (YYYY-MM-DD)</option>
                <option value="DD-MM-YYYY">Indian Standard (DD-MM-YYYY)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Approval Defaults & Document Numbering */}
        <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
            <Hash className="h-4 w-4 text-brand-600" /> Document Numbering & Board Approval Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px]">Board Signoff Threshold (₹)</label>
              <input
                type="text"
                value={boardSignoffLimit}
                onChange={(e) => setBoardSignoffLimit(e.target.value)}
                className="w-full border border-gray-250 rounded p-2 text-xs font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px]">PO Number Prefix</label>
              <input
                type="text"
                value={poPrefix}
                onChange={(e) => setPoPrefix(e.target.value)}
                className="w-full border border-gray-250 rounded p-2 text-xs font-medium text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer"
          >
            Save Core Settings
          </button>
        </div>
      </form>
    </div>
  );
};
