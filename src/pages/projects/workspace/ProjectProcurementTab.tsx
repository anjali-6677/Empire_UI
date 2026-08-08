import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, FileText, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../../utils/format';

interface ProjectProcurementTabProps {
  project: Project;
}

export const ProjectProcurementTab: React.FC<ProjectProcurementTabProps> = ({ project }) => {
  const { state } = useERPStore();
  const indents = (state.materialIndents || []).filter(
    (i) => i.projectId === project.id || i.projectCode === project.projectCode
  );

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case 'pending_approval':
      case 'submitted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> Pending Approval</span>;
      case 'sent_back':
      case 'returned_for_revision':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"><AlertTriangle className="h-3 w-3" /> Revision Req</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570] flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" /> Material Requisitions
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">Project Material Indents</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Track site material indents, quantities requested against BOQ baselines, and approval status.
          </p>
        </div>

        <Link
          to={`/procurement/indents/new?projectId=${project.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-md transition-all text-xs"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Create Material Indent
        </Link>
      </div>

      {/* Indents List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {indents.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No Material Indents Created Yet</div>
            <p className="text-slate-500 max-w-sm mx-auto text-xs">
              Site engineers can create material indents selecting items directly from the locked BOQ.
            </p>
            <Link
              to={`/procurement/indents/new?projectId=${project.id}`}
              className="inline-block px-4 py-2 bg-slate-900 text-white font-bold rounded-xl mt-2"
            >
              + Create First Indent
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Indent No</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Est. Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {indents.map((indent) => (
                <tr key={indent.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {indent.indentNumber || indent.documentNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-semibold">
                    {indent.requestedByEmployeeName || indent.createdBy || 'Site Engineer'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {indent.requiredByDate || indent.requestDate || 'Immediate'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      indent.priority === 'urgent' || indent.priority === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {indent.priority || 'Normal'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {indent.itemCount || indent.items?.length || indent.lines?.length || 0}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {formatIndianCurrency(indent.totalEstimatedValue || 0)}
                  </td>
                  <td className="py-3.5 px-4">{getStatusPill(indent.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/procurement/indents/${indent.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px]"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#AB9570]" /> View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
