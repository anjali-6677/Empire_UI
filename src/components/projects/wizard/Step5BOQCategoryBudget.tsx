import React, { useState } from 'react';
import { FileSpreadsheet, Upload, PieChart, CheckCircle2 } from 'lucide-react';
import { CategoryBudgetRow } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';

export interface Step5Data {
  boqFileName: string;
  categoryBudgets: CategoryBudgetRow[];
  totalBOQValue: number;
}

interface Step5BOQCategoryBudgetProps {
  data: Step5Data;
  onChange: (field: keyof Step5Data, value: any) => void;
  budgetBaseline: number;
}

const DEFAULT_CATEGORIES = [
  { name: 'Joinery & Woodwork', pct: 0.35 },
  { name: 'Electrical & Lighting', pct: 0.15 },
  { name: 'Plumbing & Sanitation', pct: 0.08 },
  { name: 'HVAC & Air Conditioning', pct: 0.12 },
  { name: 'Civil & Flooring', pct: 0.12 },
  { name: 'Metal & Glass Work', pct: 0.08 },
  { name: 'Paint & Surface Finishes', pct: 0.05 },
  { name: 'Loose Furniture & Decor', pct: 0.05 },
];

export const Step5BOQCategoryBudget: React.FC<Step5BOQCategoryBudgetProps> = ({
  data,
  onChange,
  budgetBaseline,
}) => {
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsSimulatingUpload(true);
      setTimeout(() => {
        const baseVal = budgetBaseline > 0 ? budgetBaseline : 5000000;
        const generatedBudgets: CategoryBudgetRow[] = DEFAULT_CATEGORIES.map((cat, idx) => {
          const allocated = Math.round(baseVal * cat.pct);
          return {
            categoryId: `cat-${idx + 1}`,
            categoryName: cat.name,
            allocatedBudget: allocated,
            committedCost: 0,
            actualCost: 0,
            allowOverrun: false,
          };
        });

        onChange('boqFileName', file.name);
        onChange('categoryBudgets', generatedBudgets);
        onChange('totalBOQValue', baseVal);
        setIsSimulatingUpload(false);
      }, 500);
    }
  };

  const updateCategoryBudget = (idx: number, val: number) => {
    const updated = [...data.categoryBudgets];
    updated[idx] = {
      ...updated[idx],
      allocatedBudget: val,
    };
    onChange('categoryBudgets', updated);
    const newTotal = updated.reduce((sum, r) => sum + (r.allocatedBudget || 0), 0);
    onChange('totalBOQValue', newTotal);
  };

  const categoryTotal = data.categoryBudgets.reduce((sum, r) => sum + (r.allocatedBudget || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-amber-500" /> Step 5: BOQ Upload & Category Budget Breakdown
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Upload project BOQ spreadsheet or configure category budget allocations to prevent procurement cost overruns.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50 hover:border-amber-400 transition-colors relative">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <Upload className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        {isSimulatingUpload ? (
          <p className="text-xs text-amber-700 font-bold animate-pulse">
            Parsing BOQ Excel lines & calculating trade categories...
          </p>
        ) : data.boqFileName ? (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-800 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{data.boqFileName}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Parsed BOQ Total Value:{' '}
              <span className="font-mono font-bold text-slate-900">
                {formatIndianCurrency(data.totalBOQValue || budgetBaseline)}
              </span>
            </p>
          </div>
        ) : (
          <div>
            <p className="font-bold text-slate-800 text-xs">Click or drag BOQ Excel File (.xlsx) here</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Uploading auto-populates trade category budgets based on item specifications.
            </p>
          </div>
        )}
      </div>

      {/* Category Budget Breakdown Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="h-4 w-4 text-amber-500" /> Category Cost Breakdown Table
          </label>
          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Total Allocated: {formatIndianCurrency(categoryTotal)}
          </span>
        </div>

        {data.categoryBudgets.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
            Upload a BOQ Excel file or click upload above to generate category allocations.
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Trade / Work Category</th>
                  <th className="py-2.5 px-3 text-right">Allocation (INR)</th>
                  <th className="py-2.5 px-3 text-center">Baseline Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {data.categoryBudgets.map((cat, idx) => {
                  const alloc = cat.allocatedBudget || 0;
                  const sharePct = categoryTotal > 0 ? ((alloc / categoryTotal) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-800">{cat.categoryName}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={cat.allocatedBudget || ''}
                          onChange={(e) => updateCategoryBudget(idx, parseFloat(e.target.value) || 0)}
                          className="w-32 p-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-right text-slate-900 focus:border-amber-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600 font-bold">
                        {sharePct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
