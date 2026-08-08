import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { GitBranch, History, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EstimateVersionsPage: React.FC = () => {
  const { state, updateItem, logAudit } = useERPStore();
  const navigate = useNavigate();
  const [selectedEstId, setSelectedEstId] = useState<string>(state.estimates[0]?.id || '');

  const selectedEst: any = state.estimates.find((e) => e.id === selectedEstId) || state.estimates[0];

  const versions: any[] = selectedEst?.versions || [];

  const handleCreateRevisionVersion = () => {
    if (!selectedEst) return;
    const latestVersion = versions[versions.length - 1] || {};
    const newVersionNumber = versions.length + 1;

    const newVersion: any = {
      ...latestVersion,
      id: `est-ver-${Date.now()}`,
      versionNumber: newVersionNumber,
      status: 'costing',
      revisionComments: `Revision V${newVersionNumber} initiated based on client feedback.`,
      createdAt: new Date().toISOString(),
      createdBy: 'Priya Nair',
    };

    const updatedVersions = [...versions, newVersion];
    updateItem('estimates', selectedEst.id, {
      versions: updatedVersions,
      currentVersionId: newVersion.id,
      status: 'revision_requested',
      updatedAt: new Date().toISOString(),
    } as any);

    logAudit({
      documentType: 'estimate',
      documentId: selectedEst.id,
      documentNumber: selectedEst.quotationNumber || selectedEst.id,
      action: 'REVISED',
      performedBy: 'Priya Nair',
      previousStatus: latestVersion.status || 'draft',
      newStatus: 'revision_requested',
      details: `Created Version ${newVersionNumber} preserving Version ${latestVersion.versionNumber || 1} snapshot.`,
    });
  };

  return (
    <div className="p-6 space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-amber-600" />
            Estimate Versions & Revision History
          </h1>
          <p className="text-slate-600 mt-0.5">
            Preserve immutable historical estimate snapshots (V1, V2) upon revision requests and compare version variance side-by-side.
          </p>
        </div>
        {selectedEst && (
          <button
            onClick={handleCreateRevisionVersion}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <RotateCcw className="h-4 w-4" /> Create Revision Version (V{versions.length + 1})
          </button>
        )}
      </div>

      {/* Select Estimate */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
        <label className="font-semibold text-slate-700">Select Proposal / Estimate:</label>
        <select
          value={selectedEstId}
          onChange={(e) => setSelectedEstId(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none flex-1 max-w-md font-medium"
        >
          {state.estimates.map((est) => (
            <option key={est.id} value={est.id}>
              {est.quotationNumber} — {est.clientName || 'Commercial Client'}
            </option>
          ))}
        </select>
      </div>

      {selectedEst && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Versions List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-amber-600" /> Version Snapshots ({versions.length})
            </h3>
            {versions.map((ver: any) => (
              <div
                key={ver.id || Math.random()}
                className={`p-4 rounded-xl border transition ${
                  ver.id === selectedEst.currentVersionId ? 'bg-amber-50/60 border-amber-300 shadow-sm' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900 text-sm">Version {ver.versionNumber || 1}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border">
                    {ver.status || 'Draft'}
                  </span>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Landed Cost:</span>
                    <span className="font-medium text-slate-900">₹{(ver.totalLandedCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selling Value:</span>
                    <span className="font-bold text-amber-700">₹{(ver.totalSellingValue || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin:</span>
                    <span className="font-medium text-emerald-600">{ver.overallMarginPercentage || 0}%</span>
                  </div>
                </div>
                {ver.revisionComments && (
                  <p className="text-amber-800 bg-amber-100/50 p-2 rounded mt-3 border border-amber-200/50">
                    <span className="font-semibold block">Revision Note:</span> {ver.revisionComments}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Version Details & Line Rates */}
          <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Active Estimate Version Details</h3>
                <p className="text-slate-500">{selectedEst.quotationNumber} — Current Version V{versions.length}</p>
              </div>
              <button
                onClick={() => navigate('/crm/tender-decisions')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
              >
                Record Tender Decision
              </button>
            </div>

            <div className="space-y-3">
              {(versions[versions.length - 1]?.lines || []).map((line: any) => (
                <div key={line.id || Math.random()} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>#{line.lineNo}. {line.itemDescription}</span>
                    <span className="text-amber-700 font-bold">₹{(line.sellingLineTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Category: {line.categoryName || 'General'}</span>
                    <span>Landed Rate: ₹{line.landedCostPerUnit || 0}/{line.unitSymbol || 'sqft'} | Selling Rate: ₹{line.sellingRate || 0}/{line.unitSymbol || 'sqft'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateVersionsPage;
