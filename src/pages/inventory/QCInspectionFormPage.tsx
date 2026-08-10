import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialEntryToken, MaterialReceivingCheck, QCParameterResult } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { DEFAULT_QC_TEMPLATES } from '../../data/defaultQCTemplates';
import {
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Search,
  Truck,
} from 'lucide-react';

export const QCInspectionFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, completeQCInspection, isAwaitingQC } = useERPStore();

  const tokenIdParam = searchParams.get('tokenId') || searchParams.get('tokenNumber');
  const [tokenInput, setTokenInput] = useState<string>(tokenIdParam || '');

  const tokens = state.materialEntryTokens || [];
  const checks = state.materialReceivingChecks || [];
  const templates = state.qcChecklistTemplates?.length ? state.qcChecklistTemplates : DEFAULT_QC_TEMPLATES;

  // Selected state
  const [matchedToken, setMatchedToken] = useState<MaterialEntryToken | null>(null);
  const [matchedCheck, setMatchedCheck] = useState<MaterialReceivingCheck | null>(null);
  const [gatingBlockedToken, setGatingBlockedToken] = useState<MaterialEntryToken | null>(null);

  const [inspectorName, setInspectorName] = useState<string>('Rajesh Sharma (QC Engineer)');
  const [inspectionDate, setInspectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [overallRemarks] = useState<string>('');
  const [itemsState, setItemsState] = useState<any[]>([]);

  const handleSearchToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setGatingBlockedToken(null);
    setMatchedToken(null);
    setMatchedCheck(null);

    const tok = tokens.find(
      (t) =>
        t.tokenNumber.toLowerCase() === tokenInput.trim().toLowerCase() ||
        t.id === tokenInput.trim()
    );

    if (tok) {
      // Check strict gating rule: Initial Receiving Check must be completed!
      const rcvCheck = checks.find((c) => c.tokenId === tok.id || c.tokenNumber === tok.tokenNumber);
      if (!rcvCheck || !isAwaitingQC(tok)) {
        setGatingBlockedToken(tok);
        return;
      }

      setMatchedToken(tok);
      setMatchedCheck(rcvCheck);
    } else {
      alert(`Token "${tokenInput}" not found in system. Please verify Token Number.`);
    }
  };

  useEffect(() => {
    if (tokenIdParam) {
      handleSearchToken();
    }
  }, [tokenIdParam]);

  useEffect(() => {
    if (!matchedToken) {
      setItemsState([]);
      return;
    }

    const matName = matchedToken.materialName || 'Material';
    const catName = matchedToken.categoryName || 'General';
    const uninspectedQty = matchedCheck ? matchedCheck.qcPendingQty : 100;
    const unit = matchedCheck ? matchedCheck.unit : 'sqft';

    // Find checklist template snapshot by category or product name
    const matchingTpl =
      templates.find((t) => t.categoryName.toLowerCase() === catName.toLowerCase()) ||
      templates.find((t) => (t.applicableProducts || []).some((p) => matName.toLowerCase().includes(p.toLowerCase()))) ||
      templates[0];

    const parameterResults: QCParameterResult[] = (matchingTpl?.parameters || []).map((p) => ({
      parameterId: p.id,
      parameterName: p.parameterName,
      requirement: p.expectedValue,
      actualObservation: p.expectedValue,
      result: 'PASS',
      remarks: 'Meets specification',
      critical: p.critical || p.isRequired,
    }));

    const initialItem = {
      productId: matchedToken.productId || 'prod-01',
      productDescription: matName,
      categoryName: catName,
      unit,
      receivedQty: matchedCheck ? matchedCheck.receivedQty : uninspectedQty,
      previouslyInspectedQty: 0,
      inspectionQty: uninspectedQty,
      approvedQty: uninspectedQty,
      rejectedQty: 0,
      holdQty: 0,
      rejectionReason: '',
      dispositionAction: 'Return to Vendor',
      parameterResults,
      remarks: '',
    };

    setItemsState([initialItem]);
  }, [matchedToken, matchedCheck]);

  const handleQtyChange = (index: number, key: 'approvedQty' | 'holdQty' | 'rejectedQty', value: number) => {
    const newItems = [...itemsState];
    const item = newItems[index];
    const numVal = Math.max(0, Number(value) || 0);

    item[key] = numVal;
    item.inspectionQty = item.approvedQty + item.holdQty + item.rejectedQty;

    setItemsState(newItems);
  };

  const handleParamResultChange = (itemIdx: number, paramIdx: number, field: keyof QCParameterResult, value: any) => {
    const newItems = [...itemsState];
    newItems[itemIdx].parameterResults[paramIdx][field] = value;
    setItemsState(newItems);
  };

  const handleSubmitQC = (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchedToken) {
      alert('Please scan/enter a valid Material Entry Token Number.');
      return;
    }

    for (const item of itemsState) {
      if (item.inspectionQty <= 0) {
        alert(`Inspection quantity for ${item.productDescription} must be greater than 0.`);
        return;
      }
      if (item.approvedQty + item.holdQty + item.rejectedQty !== item.inspectionQty) {
        alert(
          `Discrepancy for ${item.productDescription}: Approved (${item.approvedQty}) + Hold (${item.holdQty}) + Rejected (${item.rejectedQty}) must equal Total Inspected (${item.inspectionQty}).`
        );
        return;
      }
    }

    const res = completeQCInspection(
      {
        tokenId: matchedToken.id,
        tokenNumber: matchedToken.tokenNumber,
        receivingCheckId: matchedCheck?.id,
        poId: matchedCheck?.poId || '',
        poNumber: matchedCheck?.poNumber || 'PO-2026-001',
        projectId: matchedCheck?.projectId || '',
        projectName: matchedCheck?.projectName || 'Project Site',
        vendorId: matchedCheck?.vendorId || '',
        vendorName: matchedCheck?.vendorName || 'Vendor',
        vehicleNumber: matchedToken.vehicleNumber,
        driverName: matchedToken.driverName,
        inspectionDate,
        inspectorName,
        items: itemsState,
        overallRemarks,
      },
      inspectorName
    );

    if (res.success) {
      if (res.requiresAdminApproval) {
        alert(`QC Completed with failed parameters. Status set to ADMIN_APPROVAL_REQUIRED. GRN will be generated after Admin Review.`);
      } else {
        alert(`QC Passed cleanly! GRN automatically generated for accepted quantity.`);
      }
      navigate('/inventory/qc');
    }
  };

  return (
    <ListPageLayout>
      <div className="mb-4">
        <button
          onClick={() => navigate('/inventory/qc')}
          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to QC Inspections Register
        </button>
      </div>

      <PageHeader
        title="Execute Material Quality Control Inspection"
        subtitle="Stage 2 Verification: Scan or enter Gate Token Number to load incoming material parameters and auto-generate GRN upon pass."
      />

      {/* Token Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm my-4">
        <form onSubmit={handleSearchToken} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Truck className="w-5 h-5 absolute left-3 top-3 text-[#C5A059]" />
            <input
              type="text"
              placeholder="Enter or Scan Gate Token Number (e.g. PLY-20260810-001)"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d48] text-white font-bold text-sm rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Fetch Token & Material Details
          </button>
        </form>
      </div>

      {/* Gating Blocked Warning Banner */}
      {gatingBlockedToken && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 my-4 space-y-3 animate-in fade-in zoom-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-base">
                Initial Receiving Check Required Before Quality Control
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                Token <span className="font-mono font-bold">{gatingBlockedToken.tokenNumber}</span> ({gatingBlockedToken.materialName}) is currently at stage{' '}
                <span className="font-semibold text-amber-950">{gatingBlockedToken.currentStage || 'Gate Entry'}</span> with status{' '}
                <span className="font-semibold text-amber-950">{gatingBlockedToken.status}</span>.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Initial Receiving Check must be completed before Quality Control inspection can begin.
              </p>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate(`/inventory/receiving-check?token=${gatingBlockedToken.tokenNumber}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Go to Initial Receiving Check <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {matchedToken && (
        <form onSubmit={handleSubmitQC} className="space-y-6 my-4">
          {/* Header Context Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500 block">Token Number</span>
              <span className="font-mono font-bold text-gray-900 text-base">{matchedToken.tokenNumber}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Vehicle & Driver</span>
              <span className="font-semibold text-gray-900 text-sm">{matchedToken.vehicleNumber}</span>
              <span className="text-xs text-gray-500 block">{matchedToken.driverName}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Linked Purchase Order</span>
              <span className="font-bold text-purple-800 text-sm">{matchedCheck?.poNumber || 'PO-2026-001'}</span>
              <span className="text-xs text-gray-500 block">{matchedCheck?.vendorName || 'Vendor'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Material QC Pending Qty</span>
              <span className="font-mono font-black text-purple-700 text-base">
                {matchedCheck ? `${matchedCheck.qcPendingQty} ${matchedCheck.unit}` : '100 sqft'}
              </span>
            </div>
          </div>

          {/* Inspector Information */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">QC Engineer Name *</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Inspection Date *</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Inspection Item & Parameters */}
          {itemsState.map((item, itemIdx) => (
            <div key={itemIdx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.productDescription}</h4>
                  <p className="text-xs text-gray-500 font-medium">Category: {item.categoryName}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 text-xs font-bold font-mono">
                  QC Inspection Qty: {item.inspectionQty} {item.unit}
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Disposition Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">Accepted Qty ({item.unit}) *</label>
                    <input
                      type="number"
                      min={0}
                      value={item.approvedQty}
                      onChange={(e) => handleQtyChange(itemIdx, 'approvedQty', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-emerald-300 rounded font-bold text-emerald-900 bg-emerald-50/50"
                    />
                    <span className="text-[10px] text-emerald-700">Auto-GRN generation target</span>
                  </div>

                  <div>
                    <label className="block font-bold text-amber-800 mb-1">Hold Qty ({item.unit})</label>
                    <input
                      type="number"
                      min={0}
                      value={item.holdQty}
                      onChange={(e) => handleQtyChange(itemIdx, 'holdQty', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-amber-300 rounded font-bold text-amber-900 bg-amber-50/50"
                    />
                    <span className="text-[10px] text-amber-700">Quarantine hold for review</span>
                  </div>

                  <div>
                    <label className="block font-bold text-red-800 mb-1">Rejected Qty ({item.unit})</label>
                    <input
                      type="number"
                      min={0}
                      value={item.rejectedQty}
                      onChange={(e) => handleQtyChange(itemIdx, 'rejectedQty', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-red-300 rounded font-bold text-red-900 bg-red-50/50"
                    />
                    <span className="text-[10px] text-red-700">NCR auto-raised</span>
                  </div>
                </div>

                {/* Parameter Checklist Snapshot Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-700 flex justify-between">
                    <span>Category QC Checklist Parameters ({item.parameterResults.length})</span>
                    <span className="text-xs text-rose-600 font-normal">Failing any critical parameter triggers mandatory Admin Approval.</span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-semibold text-gray-500 border-b border-gray-200">
                        <th className="py-2 px-3">Parameter Name</th>
                        <th className="py-2 px-3">Requirement</th>
                        <th className="py-2 px-3">Actual Observation</th>
                        <th className="py-2 px-3 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {item.parameterResults.map((param: QCParameterResult, pIdx: number) => (
                        <tr key={pIdx}>
                          <td className="py-2 px-3 font-semibold text-gray-800 flex items-center gap-1.5">
                            {param.critical && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">CRITICAL</span>}
                            {param.parameterName}
                          </td>
                          <td className="py-2 px-3 text-gray-600 font-mono text-[11px]">{param.requirement}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={param.actualObservation}
                              onChange={(e) => handleParamResultChange(itemIdx, pIdx, 'actualObservation', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <select
                              value={param.result}
                              onChange={(e) => handleParamResultChange(itemIdx, pIdx, 'result', e.target.value)}
                              className={`px-2 py-1 border rounded font-bold text-xs ${
                                param.result === 'PASS'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-red-50 text-red-700 border-red-300'
                              }`}
                            >
                              <option value="PASS">PASS</option>
                              <option value="FAIL">FAIL</option>
                              <option value="NA">N/A</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {/* Form Actions */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
            <button
              type="button"
              onClick={() => navigate('/inventory/qc')}
              className="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 text-xs font-bold text-white bg-[#C5A059] hover:bg-[#b08d48] rounded-lg shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Complete QC & Trigger Auto-GRN
            </button>
          </div>
        </form>
      )}
    </ListPageLayout>
  );
};
export default QCInspectionFormPage;
