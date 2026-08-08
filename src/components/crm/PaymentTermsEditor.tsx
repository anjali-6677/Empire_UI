import React from 'react';
import { CreditCard, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PaymentStage } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';

interface PaymentTermsEditorProps {
  paymentTerms: PaymentStage[];
  onChange: (terms: PaymentStage[]) => void;
  quotationValue: number;
  readOnly?: boolean;
}

export const PaymentTermsEditor: React.FC<PaymentTermsEditorProps> = ({
  paymentTerms,
  onChange,
  quotationValue,
  readOnly = false,
}) => {
  const totalPercentage = paymentTerms.reduce((sum, t) => sum + (t.percentage || 0), 0);
  const isValid100 = Math.abs(totalPercentage - 100) < 0.01;

  const handleApplyTemplate = (type: 'standard' | 'milestone' | 'even') => {
    let newTerms: PaymentStage[] = [];
    if (type === 'standard') {
      newTerms = [
        { id: 'pay-1', stageName: 'Advance Mobilization', description: 'Upon signing LOI / agreement', percentage: 10, amount: quotationValue * 0.1, dueCondition: 'Signing of contract' },
        { id: 'pay-2', stageName: 'Material Delivery & Joinery', description: 'Upon site arrival of plywood & veneers', percentage: 40, amount: quotationValue * 0.4, dueCondition: 'Material delivery at site' },
        { id: 'pay-3', stageName: 'Mid-Project Fitting & Finishing', description: 'Upon completion of panelling and electrical piping', percentage: 40, amount: quotationValue * 0.4, dueCondition: '70% work completion' },
        { id: 'pay-4', stageName: 'Final Handover & Snagging', description: 'Upon final inspection and sign-off', percentage: 10, amount: quotationValue * 0.1, dueCondition: 'Final project completion' },
      ];
    } else if (type === 'milestone') {
      newTerms = [
        { id: 'pay-1', stageName: 'Booking Advance', description: 'Confirmation advance', percentage: 20, amount: quotationValue * 0.2, dueCondition: 'Order booking' },
        { id: 'pay-2', stageName: 'Carpentry & Millwork', description: 'Structure readiness', percentage: 30, amount: quotationValue * 0.3, dueCondition: 'Carpentry completion' },
        { id: 'pay-3', stageName: 'Finishing & Painting', description: 'Polishing & fixture fitments', percentage: 30, amount: quotationValue * 0.3, dueCondition: 'Finishing phase' },
        { id: 'pay-4', stageName: 'Final Acceptance', description: 'Handover certificate', percentage: 20, amount: quotationValue * 0.2, dueCondition: 'Handover signoff' },
      ];
    } else {
      newTerms = [
        { id: 'pay-1', stageName: 'Stage 1 Advance', description: 'Initial advance', percentage: 25, amount: quotationValue * 0.25, dueCondition: 'Start of work' },
        { id: 'pay-2', stageName: 'Stage 2 Progress', description: 'Mid progress', percentage: 25, amount: quotationValue * 0.25, dueCondition: '30% completion' },
        { id: 'pay-3', stageName: 'Stage 3 Progress', description: 'Late progress', percentage: 25, amount: quotationValue * 0.25, dueCondition: '70% completion' },
        { id: 'pay-4', stageName: 'Stage 4 Final', description: 'Handover', percentage: 25, amount: quotationValue * 0.25, dueCondition: 'Handover' },
      ];
    }
    onChange(newTerms);
  };

  const handleUpdateStage = (idx: number, field: keyof PaymentStage, val: any) => {
    const updated = [...paymentTerms];
    const item = { ...updated[idx], [field]: val };
    if (field === 'percentage') {
      const pct = parseFloat(val) || 0;
      item.percentage = pct;
      item.amount = (quotationValue * pct) / 100;
    }
    updated[idx] = item;
    onChange(updated);
  };

  const handleAddStage = () => {
    const newStage: PaymentStage = {
      id: `pay-${Date.now()}`,
      stageName: 'Custom Milestone',
      description: 'Stage description',
      percentage: 10,
      amount: quotationValue * 0.1,
      dueCondition: 'Upon milestone completion',
    };
    onChange([...paymentTerms, newStage]);
  };

  const handleDeleteStage = (idx: number) => {
    onChange(paymentTerms.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Step 5: Commercial Payment Schedule</div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-amber-400" /> Milestone Billing & Payment Stage Terms
          </h3>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate('standard')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-[11px] font-bold"
            >
              Template 10-40-40-10
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('milestone')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-[11px] font-bold"
            >
              Template 20-30-30-20
            </button>
          </div>
        )}
      </div>

      {/* Total 100% Validation Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between font-bold text-xs ${
          isValid100
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {isValid100 ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <div>
            <div>Payment Schedule Total: {totalPercentage.toFixed(1)}%</div>
            {!isValid100 && (
              <div className="text-[11px] font-normal text-rose-700">
                Payment milestone percentages must equal exactly 100% before sending to client.
              </div>
            )}
          </div>
        </div>

        <div className="font-mono font-black text-sm">
          {formatIndianCurrency((quotationValue * totalPercentage) / 100)}
        </div>
      </div>

      {/* Stages Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900">Milestone Breakdown</h4>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddStage}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" /> Add Payment Milestone
            </button>
          )}
        </div>

        <div className="space-y-2">
          {paymentTerms.map((stage, idx) => (
            <div
              key={stage.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500">Stage Milestone Name</label>
                <input
                  type="text"
                  value={stage.stageName}
                  disabled={readOnly}
                  onChange={(e) => handleUpdateStage(idx, 'stageName', e.target.value)}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500">Trigger Condition / Description</label>
                <input
                  type="text"
                  value={stage.dueCondition}
                  disabled={readOnly}
                  onChange={(e) => handleUpdateStage(idx, 'dueCondition', e.target.value)}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500">Share (%)</label>
                <input
                  type="number"
                  value={stage.percentage}
                  disabled={readOnly}
                  onChange={(e) => handleUpdateStage(idx, 'percentage', e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-amber-600 text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500">Amount (₹)</label>
                <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-900 text-right">
                  {formatIndianCurrency(stage.amount)}
                </div>
              </div>

              {!readOnly && (
                <div className="sm:col-span-1 text-right">
                  <button type="button" onClick={() => handleDeleteStage(idx)} className="p-1.5 text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
