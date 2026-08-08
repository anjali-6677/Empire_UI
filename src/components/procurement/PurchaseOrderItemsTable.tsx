import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

export interface POItemRow {
  boqLineId?: string;
  materialName: string;
  categoryName?: string;
  unit: string;
  approvedQty: number;
  previouslyConvertedQty: number;
  remainingQty: number;
  poQty: number;
  unitRate: number;
  taxPercent: number;
  lineSubtotal: number;
  lineTaxAmount: number;
  lineTotal: number;
}

interface PurchaseOrderItemsTableProps {
  items: POItemRow[];
  onItemQtyChange: (index: number, qty: number) => void;
  onItemRateChange: (index: number, rate: number) => void;
  isDirectPO: boolean;
}

export const PurchaseOrderItemsTable: React.FC<PurchaseOrderItemsTableProps> = ({
  items,
  onItemQtyChange,
  onItemRateChange,
  isDirectPO,
}) => {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-[#AB9570]" /> Material Indent Line Items & Conversion Quantities
          </h4>
          <p className="text-[11px] text-slate-500">
            Specify order quantities. Quantities cannot exceed each item’s remaining approved indent quantity.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Item Description</th>
              <th className="py-3 px-4 text-center">Unit</th>
              <th className="py-3 px-4 text-right">Approved Qty</th>
              <th className="py-3 px-4 text-right">Previously Converted</th>
              <th className="py-3 px-4 text-right">Available Qty</th>
              <th className="py-3 px-4 text-right w-36">PO Order Qty</th>
              <th className="py-3 px-4 text-right">Unit Rate (₹)</th>
              <th className="py-3 px-4 text-right">Tax (%)</th>
              <th className="py-3 px-4 text-right">Line Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {items.map((item, idx) => {
              const isOver = item.poQty > item.remainingQty;

              return (
                <tr key={idx} className={isOver ? 'bg-rose-50/60' : 'hover:bg-slate-50/70 transition-colors'}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{item.materialName}</div>
                    {item.categoryName && <div className="text-[10px] text-slate-400 font-mono">{item.categoryName}</div>}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600">{item.unit}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">{item.approvedQty}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">{item.previouslyConvertedQty}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{item.remainingQty}</td>

                  {/* Editable Order Quantity */}
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      min={0}
                      max={item.remainingQty}
                      step="any"
                      value={item.poQty}
                      onChange={(e) => onItemQtyChange(idx, parseFloat(e.target.value) || 0)}
                      className={`w-28 text-right font-mono font-black py-1.5 px-2 bg-white border rounded-xl text-xs ${
                        isOver
                          ? 'border-rose-500 text-rose-600 bg-rose-50 ring-2 ring-rose-200'
                          : 'border-slate-300 focus:border-[#AB9570] focus:outline-hidden'
                      }`}
                    />
                    {isOver && (
                      <div className="text-[10px] text-rose-600 font-bold mt-0.5 flex items-center justify-end gap-1">
                        <AlertCircle className="h-3 w-3" /> Exceeds Available ({item.remainingQty})
                      </div>
                    )}
                  </td>

                  {/* Unit Rate */}
                  <td className="py-3 px-4 text-right font-mono">
                    {isDirectPO ? (
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={item.unitRate}
                        onChange={(e) => onItemRateChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right font-mono font-bold py-1 px-2 bg-white border border-slate-300 rounded-lg text-xs focus:border-[#AB9570]"
                      />
                    ) : (
                      <span className="font-bold text-slate-900">₹{formatIndianCurrency(item.unitRate)}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-500">{item.taxPercent}%</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                    ₹{formatIndianCurrency(item.lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
