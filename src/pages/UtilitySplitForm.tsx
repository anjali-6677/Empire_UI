import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, AlertCircle, Save } from 'lucide-react';
import { useSites } from '../context/SitesContext';
import { useWorkflow } from '../context/WorkflowContext';
import { safeFormatCurrency } from '../utils/formatStatus';

interface AllocationRow {
  id: string;
  siteId: string;
  type: 'amount' | 'percentage';
  value: number;
}

export const UtilitySplitForm: React.FC = () => {
  const navigate = useNavigate();
  const { sites } = useSites();
  const { addRecord } = useWorkflow();

  const [provider, setProvider] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billTotal, setBillTotal] = useState<number>(0);
  const [rows, setRows] = useState<AllocationRow[]>([{ id: 'r1', siteId: '', type: 'amount', value: 0 }]);
  const [error, setError] = useState('');

  const allocatedTotal = rows.reduce((sum, r) => {
    if (r.type === 'amount') return sum + (Number(r.value) || 0);
    return sum + (billTotal * ((Number(r.value) || 0) / 100));
  }, 0);

  const remaining = billTotal - allocatedTotal;

  const valid = provider && billNo && billTotal > 0 && Math.abs(remaining) < 0.01 && rows.every(r => r.siteId && r.value > 0);

  const handleQuickFill = () => {
    setProvider('Bangalore Electricity Supply Co (BESCOM)');
    setBillNo('UTIL-2026-088');
    setBillTotal(150000);
    if (sites.length >= 3) {
      setRows([
        { id: 'r1', siteId: sites[0].id, type: 'amount', value: 60000 },
        { id: 'r2', siteId: sites[1].id, type: 'percentage', value: 40 },
        { id: 'r3', siteId: sites[2].id, type: 'amount', value: 30000 }
      ]);
    }
    setError('');
  };

  const handleSave = () => {
    if (!valid) {
      if (Math.abs(remaining) > 0.01) {
        setError(`Allocated total (${safeFormatCurrency(allocatedTotal)}) must exactly equal Bill Total (${safeFormatCurrency(billTotal)}). Remaining: ${safeFormatCurrency(remaining)}`);
      } else {
        setError('Please select a target site for each row and ensure values are greater than zero.');
      }
      return;
    }
    
    // Add primary utility bill record
    addRecord('utilityBills', {
      subject: `Utility Bill - ${provider}`,
      referenceNo: billNo,
      amount: billTotal,
      billTotal,
      status: 'allocated'
    });

    navigate('/finance/utility-bills');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 border rounded hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Utility Bill Splitting & Allocation</h1>
            <p className="text-xs text-gray-500 font-medium">Distribute centralized utility costs across multiple operational sites.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleQuickFill}
          className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 rounded text-xs font-bold transition-colors cursor-pointer"
        >
          ⚡ Load Guided Test Data
        </button>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-3 gap-6 pb-6 border-b border-gray-150">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Utility Provider</label>
            <input type="text" value={provider} onChange={e => setProvider(e.target.value)} className="w-full border rounded p-2 text-sm font-bold focus:border-brand-500 outline-none" placeholder="e.g. BESCOM" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Source Bill Ref</label>
            <input type="text" value={billNo} onChange={e => setBillNo(e.target.value)} className="w-full border rounded p-2 text-sm font-bold focus:border-brand-500 outline-none" placeholder="BLL-109283" />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 relative overflow-hidden group">
             <div className="absolute top-0 right-0 h-10 w-10 bg-emerald-500 rounded-bl-full opacity-10" />
             <label className="block text-[10px] uppercase font-bold text-emerald-800 mb-1">Total Bill Amount</label>
             <input type="number" min="0" value={billTotal || ''} onChange={e => setBillTotal(Number(e.target.value))} className="w-full bg-transparent border-b border-emerald-300 font-extrabold text-2xl text-emerald-900 focus:border-emerald-500 outline-none placeholder:text-emerald-300/50" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Site Allocations</h3>
            <button onClick={() => setRows([...rows, {id: `r${Date.now()}`, siteId:'', type:'amount', value:0}])} className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-600 hover:text-brand-800 cursor-pointer">
               <Plus className="h-3 w-3" /> Add Site Row
            </button>
          </div>

          <table className="w-full text-left">
             <thead className="text-[10px] uppercase text-gray-400 border-b">
               <tr>
                 <th className="py-2 w-1/2">Target Project Site</th>
                 <th className="py-2 w-[15%]">Allocation Type</th>
                 <th className="py-2 w-[25%]">Value</th>
                 <th className="py-2 w-[10%] text-right">Remove</th>
               </tr>
             </thead>
             <tbody className="text-xs divide-y">
               {rows.map((row, idx) => (
                 <tr key={row.id}>
                   <td className="py-3 pr-4">
                     <select className="w-full border p-2 rounded font-bold text-gray-800" value={row.siteId} onChange={e => {
                       const r = [...rows]; r[idx].siteId = e.target.value; setRows(r);
                     }}>
                       <option value="">-- Select Target Site --</option>
                       {sites.map(s => <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>)}
                     </select>
                   </td>
                   <td className="py-3 pr-4">
                      <select className="w-full border p-2 rounded font-bold text-gray-800" value={row.type} onChange={e => {
                       const r = [...rows]; r[idx].type = e.target.value as any; r[idx].value = 0; setRows(r);
                     }}>
                        <option value="amount">Fixed Amount</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                   </td>
                   <td className="py-3 pr-4">
                     <div className="relative">
                       {row.type === 'amount' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>}
                       <input type="number" min="0" value={row.value || ''} onChange={e => {
                         const val = Math.max(0, Number(e.target.value));
                         const r = [...rows]; r[idx].value = val; setRows(r);
                       }} className={`w-full border p-2 rounded font-mono font-bold text-sm ${row.type === 'amount' ? 'pl-7' : 'pr-7'}`} />
                       {row.type === 'percentage' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>}
                     </div>
                   </td>
                   <td className="py-3 text-right">
                     <button onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer" disabled={rows.length === 1}>
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          
          <div className="flex border-t pt-4 font-mono text-sm items-center justify-end gap-6 text-gray-800">
             <div className="text-right">
               <span className="text-[10px] text-gray-400 block font-sans uppercase">Total Allocated</span>
               <span className="font-extrabold text-gray-900">{safeFormatCurrency(allocatedTotal)}</span>
             </div>
             <div className="text-right pr-4">
               <span className="text-[10px] uppercase block font-sans font-bold text-gray-400">Remaining Unallocated</span>
               <span className={`font-extrabold ${Math.abs(remaining) < 0.01 ? 'text-emerald-600' : remaining < 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                 {safeFormatCurrency(remaining)}
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
         <div className="text-rose-600 text-[10px] font-bold flex items-center gap-1 max-w-sm">
           {error && <><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}</>}
         </div>
         <button onClick={handleSave} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded shadow-sm font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer">
            <Save className="h-4 w-4" /> Complete Split Allocation
         </button>
      </div>
    </div>
  );
};
