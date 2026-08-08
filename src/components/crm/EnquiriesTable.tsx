import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Calculator, CheckCircle2, XCircle } from 'lucide-react';
import { Enquiry, Estimate } from '../../domain/types';
import { EnquiryStatusBadge } from './EnquiryStatusBadge';
import { formatIndianCurrency } from '../../utils/format';

interface EnquiriesTableProps {
  enquiries: Enquiry[];
  estimates: Estimate[];
  onRecordDecision?: (enquiry: Enquiry) => void;
  onCancelEnquiry?: (enquiryId: string) => void;
}

export const EnquiriesTable: React.FC<EnquiriesTableProps> = ({
  enquiries,
  estimates,
  onRecordDecision,
  onCancelEnquiry,
}) => {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (enquiries.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
        <Calculator className="h-10 w-10 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">No Enquiries Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No customer enquiries match your search criteria. Click "Add New Enquiry" to create a new record.
        </p>
        <Link
          to="/crm/enquiries/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm"
        >
          Add New Enquiry
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Enquiry No</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Estimator</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Est. Value</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {enquiries.map((enq) => {
              const latestEstimate = estimates.find((e) => e.id === enq.currentEstimateId || e.enquiryId === enq.id);
              const estValue = latestEstimate ? latestEstimate.finalQuotationValue : enq.expectedBudget;

              return (
                <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <Link to={`/crm/enquiries/${enq.id}`} className="hover:text-amber-600 hover:underline">
                      {enq.enquiryNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{enq.clientName}</td>
                  <td className="py-3 px-4 max-w-[200px] truncate text-slate-700">{enq.projectRequirement}</td>
                  <td className="py-3 px-4 text-slate-600">{enq.location}</td>
                  <td className="py-3 px-4 text-slate-600">{enq.assignedEstimatorName || 'Unassigned'}</td>
                  <td className="py-3 px-4">
                    <EnquiryStatusBadge status={enq.status} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatIndianCurrency(estValue)}
                  </td>
                  <td className="py-3 px-4 text-right relative">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/crm/enquiries/${enq.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] rounded transition-colors"
                      >
                        View
                      </Link>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === enq.id ? null : enq.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === enq.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/crm/enquiries/${enq.id}`);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400" /> View Details
                            </button>

                            {(enq.status === 'new' || enq.status === 'estimating') && (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`/crm/estimates/builder/${enq.id}`);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-amber-600 font-bold"
                              >
                                <Calculator className="h-3.5 w-3.5" /> Prepare Estimate
                              </button>
                            )}

                            {enq.status === 'sent_to_client' && (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  if (onRecordDecision) onRecordDecision(enq);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-emerald-600 font-bold"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Record Client Decision
                              </button>
                            )}

                            {enq.status !== 'won' && enq.status !== 'lost' && enq.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  if (onCancelEnquiry) onCancelEnquiry(enq.id);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-medium border-t border-slate-100"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Mark as Cancelled
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
