import React from 'react';
import { FileText, Download, Lock } from 'lucide-react';
import { Project } from '../../../domain/types';

interface ProjectDocumentsTabProps {
  project: Project;
}

export const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ project }) => {
  const docs = [
    { id: '1', title: 'Accepted Commercial BOQ Baseline', ref: (project as any).sourceQuotationNumber || 'QUO-ACCEPTED', date: project.createdAt?.split('T')[0] || '2026-07-28', category: 'Commercial Baseline', type: 'PDF' },
    { id: '2', title: 'Client Purchase Order Sign-off', ref: (project as any).clientPODetails?.poNumber || 'PO-ACCEPT-01', date: project.createdAt?.split('T')[0] || '2026-07-28', category: 'Legal & Contract', type: 'PDF' },
    { id: '3', title: 'Architectural & Interior Fitout Layouts', ref: 'DWG-FITOUT-R0', date: project.createdAt?.split('T')[0] || '2026-07-28', category: 'Drawings', type: 'ZIP' },
    { id: '4', title: 'Payment Terms & Milestone Schedule', ref: 'SCH-COMMERCIAL-01', date: project.createdAt?.split('T')[0] || '2026-07-28', category: 'Commercial Baseline', type: 'PDF' },
  ];

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#AB9570]" /> Project Document Repository
        </h3>

        <div className="divide-y divide-slate-100">
          {docs.map((doc) => (
            <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg font-mono text-[10px] font-bold">
                  {doc.type}
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    {doc.title}
                    {doc.category === 'Commercial Baseline' && (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" /> Locked Baseline
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Ref: {doc.ref} | Date: {doc.date}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Downloading ${doc.title}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
