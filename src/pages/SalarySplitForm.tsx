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

export const SalarySplitForm: React.FC = () => {
  const navigate = useNavigate();
  const { sites } = useSites();
  const { addRecord } = useWorkflow();

  const [employee, setEmployee] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [netSalary, setNetSalary] = useState<number>(0);
  const [rows, setRows] = useState<AllocationRow[]>([{ id: 'r1', siteId: '', type: 'percentage', value: 100 }]);
  const [error, setError] = useState('');

  const allocatedTotal = rows.reduce((sum, r) => {
    if (r.type === 'amount') return sum + (Number(r.value) || 0);
    return sum + (netSalary * ((Number(r.value) || 0) / 100));
  }, 0);

  const allocatedPercent = rows.reduce((sum, r) => {
    if (r.type === 'percentage') return sum + (Number(r.value) || 0);
    if (netSalary > 0 && r.type === 'amount') return sum + ((Number(r.value)/netSalary) * 100);
    return sum;
  }, 0);

  const remainingAmt = netSalary - allocatedTotal;
  const remainingPct = 100 - allocatedPercent;

  const valid = employee && batchNo && netSalary > 0 && 
                Math.abs(remainingAmt) < 0.01 && 
                Math.abs(remainingPct) < 0.01 && 
                rows.every(r => r.siteId && r.value > 0);

  const handleSave = () => {
    if (!valid) {
      if (Math.abs(remainingPct) > 0.01) {
        setError('Allocation MUST equal exactly 100% of the Net Salary.');
      } else {
        setError('Please fill all required fields correctly. No negative values.');
      }
      return;
    }
    
    addRecord('salaryDisbursements', {
      subject: `Salary Disb. - ${employee}`,
      referenceNo: batchNo,
      amount: netSalary,
      status: 'allocated'
    });
    
    navigate('/finance/salary');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans select-none">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 border rounded hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Salary Disbursal & Project Split</h1>
          <p className="text-xs text-gray-500 font-medium">Allocate employee net salary across deployed project sites tightly enforcing 100% distribution.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-3 gap-6 pb-6 border-b border-gray-150">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Employee Name</label>
            <input type="text" value={employee} onChange={e => setEmployee(e.target.value)} className="w-full border rounded p-2 text-sm font-bold focus:border-brand-500 outline-none" placeholder="EMP Name" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Salary Batch</label>
            <input type="text" value={batchNo} onChange={e => setBatchNo(e.target.value)} className="w-full border rounded p-2 text-sm font-bold focus:border-brand-500 outline-none" placeholder="SAL-BATCH-08" />
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 relative overflow-hidden group">
             <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500 rounded-bl-full opacity-10" />
             <label className="block text-[10px] uppercase font-bold text-indigo-800 mb-1">Net Salary Fixed Total</label>
             <input type="number" min="0" value={netSalary || ''} onChange={e => setNetSalary(Number(e.target.value))} className="w-full bg-transparent border-b border-indigo-300 font-extrabold text-2xl text-indigo-900 focus:border-indigo-500 outline-none placeholder:text-indigo-300/50" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Project Site Splits</h3>
            <button onClick={() => setRows([...rows, {id: `r${Date.now()}`, siteId:'', type:'percentage', value:0}])} className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-600 hover:text-brand-800">
               <Plus className="h-3 w-3" /> Add Split Row
            </button>
          </div>

          <table className="w-full text-left">
             <thead className="text-[10px] uppercase text-gray-400 border-b">
               <tr><th className="py-2 w-1/2">Allocated Project Site</th><th className="py-2 w-[15%]">Mode</th><th className="py-2 w-[25%]">Distribution</th><th className="py-2 w-[10%] text-right">Remove</th></tr>
             </thead>
             <tbody className="text-xs divide-y">
               {rows.map((row, idx) => (
                 <tr key={row.id}>
                   <td className="py-3 pr-4">
                     <select className="w-full border p-2 rounded font-bold text-gray-800" value={row.siteId} onChange={e => {
                       const r = [...rows]; r[idx].siteId = e.target.value; setRows(r);
                     }}>
                       <option value="">-- Active Project Site --</option>
                       {sites.map(s => <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>)}
                     </select>
                   </td>
                   <td className="py-3 pr-4">
                      <select className="w-full border p-2 rounded font-bold text-gray-800" value={row.type} onChange={e => {
                       const r = [...rows]; r[idx].type = e.target.value as any; r[idx].value = 0; setRows(r);
                     }}>
                        <option value="percentage">Percent (%)</option>
                        <option value="amount">Amount</option>
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
                     <button onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded" disabled={rows.length === 1}>
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          
          <div className="flex border-t pt-4 font-mono text-sm items-center justify-end gap-6 text-gray-800 bg-gray-50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg border-t-gray-200">
             <div className="text-right border-r pr-6 border-gray-300">
               <span className="text-[10px] text-gray-400 block font-sans uppercase font-bold">Allocated Checksum</span>
               <span className="font-extrabold text-gray-900">{allocatedPercent.toFixed(1)}% ({safeFormatCurrency(allocatedTotal)})</span>
             </div>
             <div className="text-right">
               <span className="text-[10px] uppercase block font-sans font-bold text-gray-400">Remaining</span>
               <span className={`font-extrabold flex items-center gap-2 ${Math.abs(remainingPct) < 0.01 ? 'text-emerald-600' : remainingPct < 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                 {remainingPct.toFixed(1)}% <span className="text-xs opacity-75">({safeFormatCurrency(remainingAmt)})</span>
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
         <div className="text-rose-600 text-[10px] font-bold flex items-center gap-1 max-w-sm leading-tight">
           {error && <><AlertCircle className="h-3 w-3 shrink-0" /> {error}</>}
         </div>
         <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow-sm font-bold uppercase text-xs tracking-wider transition-colors shrink-0">
            <Save className="h-4 w-4" /> Commit Salary Split
         </button>
      </div>
    </div>
  );
};
