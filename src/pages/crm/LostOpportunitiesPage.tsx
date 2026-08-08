import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Eye } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';

export const LostOpportunitiesPage: React.FC = () => {
  const { state } = useERPStore();

  const lostEnquiries = (state.enquiries || []).filter((e) => e.status === 'lost');
  const estimates = state.estimates || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 flex items-center gap-1">
            <XCircle className="h-4 w-4" /> Commercial Pipeline Lost Analysis
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lost Opportunities Register</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Enquiry No</th>
              <th className="py-3 px-4">Client Name</th>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Lost Reason</th>
              <th className="py-3 px-4 text-right">Quotation Value</th>
              <th className="py-3 px-4 text-right w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {lostEnquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No lost opportunities recorded.
                </td>
              </tr>
            ) : (
              lostEnquiries.map((enq) => {
                const est = estimates.find((e) => e.id === enq.currentEstimateId || e.enquiryId === enq.id);
                return (
                  <tr key={enq.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/crm/enquiries/${enq.id}`} className="hover:text-[#AB9570]">
                        {enq.enquiryNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{enq.clientName}</td>
                    <td className="py-3 px-4 text-slate-600">{enq.projectRequirement}</td>
                    <td className="py-3 px-4 text-rose-700 font-semibold">
                      {est?.clientDecision?.lostReason || 'Budget constraints'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatIndianCurrency(est?.finalQuotationValue || enq.expectedBudget)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/crm/enquiries/${enq.id}`}
                        className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
