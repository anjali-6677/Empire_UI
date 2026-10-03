import React, { useState } from 'react';
import { Package, AlertCircle, History, ChevronDown, ChevronUp, Calendar, Store, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';
import { useERPStore } from '../../store/ERPStoreContext';
import { getHistoricalProductPurchaseRates } from '../../domain/selectors';

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
  const { state } = useERPStore();
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState<number | null>(null);

  const toggleHistory = (index: number) => {
    setExpandedHistoryIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-[#AB9570]" /> Material Indent Line Items & Conversion Quantities
          </h4>
          <p className="text-[11px] text-slate-500">
            Specify order quantities and review historical purchase rates per item. Quantities cannot exceed available approved indent limits.
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
              const isHistoryOpen = expandedHistoryIndex === idx;

              // Fetch historical rate records for this product
              const rateRecords = getHistoricalProductPurchaseRates(state, item.boqLineId, item.materialName);
              const topHistory = rateRecords.slice(0, 5);
              const lastPurchase = topHistory[0];

              // Price difference calculations
              let diffPercent: number | null = null;
              let diffAmount: number | null = null;
              if (lastPurchase && lastPurchase.basicRate > 0) {
                diffAmount = item.unitRate - lastPurchase.basicRate;
                diffPercent = (diffAmount / lastPurchase.basicRate) * 100;
              }

              return (
                <React.Fragment key={idx}>
                  <tr className={isOver ? 'bg-rose-50/60' : 'hover:bg-slate-50/70 transition-colors'}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{item.materialName}</div>
                          {item.categoryName && <div className="text-[10px] text-slate-400 font-mono">{item.categoryName}</div>}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleHistory(idx)}
                          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                            isHistoryOpen
                              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                          title="Click to view historical purchase rates"
                        >
                          <History className="h-3 w-3 text-[#AB9570]" />
                          <span>Rates ({rateRecords.length})</span>
                          {isHistoryOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>

                      {/* Summary indicator */}
                      {lastPurchase && !isHistoryOpen && (
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>Last: {formatIndianCurrency(lastPurchase.basicRate)}</span>
                          {diffAmount !== null && diffAmount !== 0 && (
                            <span
                              className={`flex items-center gap-0.5 font-bold ${
                                diffAmount > 0 ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {diffAmount > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {diffAmount > 0 ? '+' : ''}{formatIndianCurrency(diffAmount)} ({diffPercent?.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      )}
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
                        <span className="font-bold text-slate-900">{formatIndianCurrency(item.unitRate)}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-500">{item.taxPercent}%</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {formatIndianCurrency(item.lineTotal)}
                    </td>
                  </tr>

                  {/* Expandable Historical Rates Drawer */}
                  {isHistoryOpen && (
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <td colSpan={9} className="p-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4 text-[#AB9570]" />
                              <span className="font-bold text-slate-900 text-xs">
                                Historical Purchase Rates for <span className="text-[#AB9570]">{item.materialName}</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Advisory benchmark derived from issued POs</span>
                          </div>

                          {topHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[11px]">
                                <thead>
                                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                                    <th className="py-1.5 px-2">Date</th>
                                    <th className="py-1.5 px-2">PO #</th>
                                    <th className="py-1.5 px-2">Vendor</th>
                                    <th className="py-1.5 px-2">Project</th>
                                    <th className="py-1.5 px-2 text-right">Qty</th>
                                    <th className="py-1.5 px-2 text-right">Basic Rate (₹)</th>
                                    <th className="py-1.5 px-2 text-right">Landed Rate (₹)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                  {topHistory.map((rec, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50">
                                      <td className="py-1.5 px-2 font-mono text-slate-600 flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-slate-400" /> {rec.poDate}
                                      </td>
                                      <td className="py-1.5 px-2 font-mono font-bold text-slate-700">{rec.poNumber}</td>
                                      <td className="py-1.5 px-2 font-semibold text-slate-900 flex items-center gap-1">
                                        <Store className="h-3 w-3 text-slate-400" /> {rec.vendorName}
                                      </td>
                                      <td className="py-1.5 px-2 text-slate-500 truncate max-w-xs">{rec.projectName || 'Central ERP Project'}</td>
                                      <td className="py-1.5 px-2 text-right font-mono">{rec.qty} {rec.unit}</td>
                                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800">{formatIndianCurrency(rec.basicRate)}</td>
                                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700">{formatIndianCurrency(rec.landedRate)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="py-3 text-center text-slate-400 text-xs italic">
                              No previous purchase history available for this material.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
