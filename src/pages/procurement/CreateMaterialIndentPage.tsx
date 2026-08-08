import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { getProjectById, getProjectBOQLines, getIndentBOQAvailability } from '../../domain/selectors';
import { MaterialIndent, ProjectBOQLine } from '../../domain/types';
import { AlertTriangle, ArrowLeft, Plus, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';
import { ActiveProjectSelect } from '../../components/procurement/ActiveProjectSelect';
import { CompactMaterialBOQSelect } from '../../components/procurement/CompactMaterialBOQSelect';

const DRAFT_STORAGE_KEY = 'empire_create_indent_draft_v1';

export const CreateMaterialIndentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, createMaterialIndent, submitMaterialIndent } = useERPStore();

  // Filter ONLY Active Projects satisfying strict procurement-ready criteria
  const eligibleActiveProjects = useMemo(() => {
    return (state.projects || []).filter((p) => {
      const statusLower = (p.projectStatus || p.status || '').toLowerCase();
      const isActive = statusLower === 'active';
      const isTeamLocked = Boolean(p.projectTeamLocked || p.isTeamLocked);
      const isBOQLocked = Boolean(p.projectBOQLocked || p.isBOQLocked);
      const isNotLegacySite = !p.projectCode?.startsWith('SITE-');
      const lines = getProjectBOQLines(state, p.id);
      const hasBOQItems = Boolean(p.lockedProjectBOQ?.lines?.length || p.acceptedBOQSnapshot?.length || lines.length > 0);
      const hasSchedule = Boolean(p.scheduleConfigured || p.scheduleActivities?.length || p.acceptedScheduleSnapshot?.length);

      return isActive && isTeamLocked && isBOQLocked && isNotLegacySite && hasBOQItems && hasSchedule;
    });
  }, [state.projects, state.projectBOQs]);

  const initialProjectId = searchParams.get('projectId') || eligibleActiveProjects[0]?.id || '';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);

  const currentProject = useMemo(() => {
    return getProjectById(state, selectedProjectId) || eligibleActiveProjects.find((p) => p.id === selectedProjectId);
  }, [state, selectedProjectId, eligibleActiveProjects]);

  const projectBOQLines = useMemo(() => {
    if (!selectedProjectId) return [];
    if (currentProject?.lockedProjectBOQ?.lines && currentProject.lockedProjectBOQ.lines.length > 0) {
      return currentProject.lockedProjectBOQ.lines;
    }
    return getProjectBOQLines(state, selectedProjectId);
  }, [state, selectedProjectId, currentProject]);

  const hasValidBOQ = Boolean((currentProject?.projectBOQLocked || currentProject?.isBOQLocked) && projectBOQLines.length > 0);

  // Available categories for selected Project BOQ
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    projectBOQLines.forEach((line) => {
      if (line.categoryName) categoriesSet.add(line.categoryName);
    });
    return Array.from(categoriesSet);
  }, [projectBOQLines]);

  // Form Fields
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [requiredByDate, setRequiredByDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState('');

  // Material Required Selection Input State
  const [selectedBOQLine, setSelectedBOQLine] = useState<ProjectBOQLine | null>(null);
  const [inputQty, setInputQty] = useState<number | ''>('');

  // Added Lines State
  const [addedLines, setAddedLines] = useState<
    Array<{
      boqLineId: string;
      itemDescription: string;
      categoryName: string;
      unitSymbol: string;
      qty: number;
      rate: number;
      specs?: string;
      overBOQReason?: string;
    }>
  >([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Restore saved draft from localStorage on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedProjectId && eligibleActiveProjects.some((p) => p.id === parsed.selectedProjectId)) {
            setSelectedProjectId(parsed.selectedProjectId);
          }
          if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
          if (parsed.requiredByDate) setRequiredByDate(parsed.requiredByDate);
          if (parsed.purpose) setPurpose(parsed.purpose);
          if (Array.isArray(parsed.addedLines)) setAddedLines(parsed.addedLines);
        }
      } catch (err) {
        console.error('Error restoring indent draft:', err);
      }
    }
  }, []);

  // Save current draft to localStorage on change
  const saveDraftToStorage = (
    projId: string,
    cat: string,
    reqDate: string,
    purp: string,
    linesList: typeof addedLines
  ) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            selectedProjectId: projId,
            selectedCategory: cat,
            requiredByDate: reqDate,
            purpose: purp,
            addedLines: linesList,
            savedAt: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.error('Error saving draft:', err);
      }
    }
  };

  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    setSelectedCategory('all');
    setSelectedBOQLine(null);
    setInputQty('');
    setAddedLines([]);
    saveDraftToStorage(projId, 'all', requiredByDate, purpose, []);
  };

  // Add Material to Added Materials Table
  const handleAddMaterial = () => {
    setErrorMsg(null);
    setDuplicateError(null);

    if (!selectedProjectId) {
      setErrorMsg('Please select an Active Project first.');
      return;
    }
    if (!selectedBOQLine) {
      setDuplicateError('Please select a material from the dropdown.');
      return;
    }
    const qtyVal = Number(inputQty);
    if (!qtyVal || qtyVal <= 0) {
      setDuplicateError('Please enter a valid quantity greater than 0.');
      return;
    }

    // Check duplicate
    const exists = addedLines.some((l) => l.boqLineId === selectedBOQLine.id);
    if (exists) {
      setDuplicateError(`This material (${selectedBOQLine.itemDescription}) is already added to the Indent.`);
      return;
    }

    const newLine = {
      boqLineId: selectedBOQLine.id,
      itemDescription: selectedBOQLine.itemDescription,
      categoryName: selectedBOQLine.categoryName || 'General Fitout',
      unitSymbol: selectedBOQLine.unitSymbol || 'nos',
      qty: qtyVal,
      rate: selectedBOQLine.boqRate || 0,
      specs: (selectedBOQLine as any).specifications || (selectedBOQLine as any).specs || '',
      overBOQReason: '',
    };

    const updated = [...addedLines, newLine];
    setAddedLines(updated);
    setSelectedBOQLine(null);
    setInputQty('');
    saveDraftToStorage(selectedProjectId, selectedCategory, requiredByDate, purpose, updated);
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    const updated = [...addedLines];
    updated[index] = { ...updated[index], qty: newQty };
    setAddedLines(updated);
    saveDraftToStorage(selectedProjectId, selectedCategory, requiredByDate, purpose, updated);
  };

  const handleUpdateOverBOQReason = (index: number, reasonText: string) => {
    const updated = [...addedLines];
    updated[index] = { ...updated[index], overBOQReason: reasonText };
    setAddedLines(updated);
    saveDraftToStorage(selectedProjectId, selectedCategory, requiredByDate, purpose, updated);
  };

  const handleRemoveMaterial = (index: number) => {
    const updated = addedLines.filter((_, i) => i !== index);
    setAddedLines(updated);
    saveDraftToStorage(selectedProjectId, selectedCategory, requiredByDate, purpose, updated);
  };

  // Calculated stats for added lines
  const calculatedAddedLines = useMemo(() => {
    return addedLines.map((line, idx) => {
      const avail = getIndentBOQAvailability(state, selectedProjectId, line.boqLineId, line.qty);
      const isOverLimit = line.qty > avail.availableBOQQty;
      const overLimitQty = isOverLimit ? line.qty - avail.availableBOQQty : 0;
      const lineTotal = line.qty * line.rate;

      return {
        ...line,
        lineIndex: idx + 1,
        acceptedBOQQty: avail.acceptedBOQQty,
        previouslyIndentedQty: avail.previouslyIndentedQty,
        availableBOQQty: avail.availableBOQQty,
        isOverLimit,
        overLimitQty,
        lineTotal,
      };
    });
  }, [addedLines, state, selectedProjectId]);

  const estimatedIndentTotal = calculatedAddedLines.reduce((sum, l) => sum + l.lineTotal, 0);

  // Check if any over-BOQ line is missing a reason
  const missingOverBOQReasonLine = calculatedAddedLines.find((l) => l.isOverLimit && (!l.overBOQReason || !l.overBOQReason.trim()));

  const handleSaveDraft = () => {
    setErrorMsg(null);
    if (!currentProject) {
      setErrorMsg('Please select an active Project.');
      return;
    }

    saveDraftToStorage(selectedProjectId, selectedCategory, requiredByDate, purpose, addedLines);

    const docNo = `IND-${String((state.materialIndents || []).length + 1).padStart(3, '0')}`;
    const newIndent: MaterialIndent = {
      id: `ind-${Date.now()}`,
      indentNumber: docNo,
      documentNumber: docNo,
      projectId: selectedProjectId,
      projectCode: currentProject.projectCode,
      projectName: currentProject.projectName,
      requestedByEmployeeName: currentProject.projectSupervisorName || 'Site Engineer',
      deliveryLocation: currentProject.siteAddress || 'Main Site Store',
      priority: 'normal',
      requiredByDate,
      purpose,
      status: 'draft',
      totalEstimatedValue: estimatedIndentTotal,
      itemCount: calculatedAddedLines.length,
      lines: calculatedAddedLines.map((l) => ({
        id: `ind-line-${l.lineIndex}`,
        productId: `prod-${l.boqLineId}`,
        productCode: `BOQ-ITEM-${l.lineIndex}`,
        productName: l.itemDescription,
        boqLineId: l.boqLineId,
        unitSymbol: l.unitSymbol,
        acceptedBOQQty: l.acceptedBOQQty,
        previouslyIndentedQty: l.previouslyIndentedQty,
        previouslyOrderedQty: 0,
        previouslyReceivedQty: 0,
        requestedQty: l.qty,
        availableBOQQty: l.availableBOQQty,
        isOverLimit: l.isOverLimit,
        overLimitQty: l.overLimitQty,
        estimatedRate: l.rate,
        estimatedTotal: l.lineTotal,
      })),
      hasOverLimitLines: calculatedAddedLines.some((l) => l.isOverLimit),
      boqExceptionReason: calculatedAddedLines.map((l) => l.overBOQReason).filter(Boolean).join('; '),
      createdBy: currentProject.projectSupervisorName || 'Site Engineer',
      createdAt: new Date().toISOString(),
      updatedBy: currentProject.projectSupervisorName || 'Site Engineer',
      updatedAt: new Date().toISOString(),
    };

    const res = createMaterialIndent(newIndent, currentProject.projectSupervisorName || 'Site Engineer');
    if (res.success && res.indent) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      navigate(`/procurement/indents/${res.indent.id}`);
    } else {
      setErrorMsg(res.error || 'Failed to save draft indent.');
    }
  };

  const handleSubmitIndent = () => {
    setErrorMsg(null);
    if (!currentProject || !hasValidBOQ) {
      setErrorMsg('Material Indents require an active Project with locked BOQ.');
      return;
    }
    if (addedLines.length === 0) {
      setErrorMsg('Please add at least one material to the Indent.');
      return;
    }
    if (!requiredByDate) {
      setErrorMsg('Please enter a valid Required By date.');
      return;
    }
    if (missingOverBOQReasonLine) {
      setErrorMsg(`Mandatory Additional Quantity Reason required for over-BOQ item "${missingOverBOQReasonLine.itemDescription}".`);
      return;
    }

    const docNo = `IND-${String((state.materialIndents || []).length + 1).padStart(3, '0')}`;
    const newIndent: MaterialIndent = {
      id: `ind-${Date.now()}`,
      indentNumber: docNo,
      documentNumber: docNo,
      projectId: selectedProjectId,
      projectCode: currentProject.projectCode,
      projectName: currentProject.projectName,
      requestedByEmployeeName: currentProject.projectSupervisorName || 'Site Engineer',
      deliveryLocation: currentProject.siteAddress || 'Main Site Store',
      priority: 'normal',
      requiredByDate,
      purpose,
      status: 'submitted',
      totalEstimatedValue: estimatedIndentTotal,
      itemCount: calculatedAddedLines.length,
      lines: calculatedAddedLines.map((l) => ({
        id: `ind-line-${l.lineIndex}`,
        productId: `prod-${l.boqLineId}`,
        productCode: `BOQ-ITEM-${l.lineIndex}`,
        productName: l.itemDescription,
        boqLineId: l.boqLineId,
        unitSymbol: l.unitSymbol,
        acceptedBOQQty: l.acceptedBOQQty,
        previouslyIndentedQty: l.previouslyIndentedQty,
        previouslyOrderedQty: 0,
        previouslyReceivedQty: 0,
        requestedQty: l.qty,
        availableBOQQty: l.availableBOQQty,
        isOverLimit: l.isOverLimit,
        overLimitQty: l.overLimitQty,
        estimatedRate: l.rate,
        estimatedTotal: l.lineTotal,
      })),
      hasOverLimitLines: calculatedAddedLines.some((l) => l.isOverLimit),
      boqExceptionReason: calculatedAddedLines.map((l) => l.overBOQReason).filter(Boolean).join('; '),
      createdBy: currentProject.projectSupervisorName || 'Site Engineer',
      createdAt: new Date().toISOString(),
      updatedBy: currentProject.projectSupervisorName || 'Site Engineer',
      updatedAt: new Date().toISOString(),
    };

    const createRes = createMaterialIndent(newIndent, currentProject.projectSupervisorName || 'Site Engineer');
    if (!createRes.success || !createRes.indent) {
      setErrorMsg(createRes.error || 'Failed to create indent.');
      return;
    }

    const submitRes = submitMaterialIndent(createRes.indent.id, currentProject.projectSupervisorName || 'Site Engineer');
    if (submitRes.success) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      navigate(`/procurement/indents/${createRes.indent.id}`);
    } else {
      setErrorMsg(submitRes.error || 'Draft saved, but failed to submit.');
    }
  };

  // Section 20: Empty state if no eligible active projects exist
  if (eligibleActiveProjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-[#E2E6EC] rounded-2xl shadow-xs text-center space-y-5 font-sans text-xs">
        <div className="p-4 bg-amber-100/80 text-amber-800 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-amber-700" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#121214] tracking-tight">No Procurement-Ready Projects</h2>
          <p className="text-slate-500 mt-1">
            Create Material Indent requires an Active Project with a locked Team, locked BOQ, and Schedule.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#121214] text-white font-bold rounded-xl text-xs"
        >
          Open Projects Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-4 sm:p-6 font-sans text-xs text-[#121214]">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Optional Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Link to="/procurement/indents" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Material Indents
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Create New Indent</span>
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-[#E2E6EC] rounded-2xl p-6 shadow-xs space-y-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-[#121214] tracking-tight">Create New Material Indent</h1>
            <p className="text-xs text-slate-500 mt-0.5">Request materials for an active Project.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Project & Metadata Form Controls */}
          <div className="space-y-4">
            {/* Project Field */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Project <span className="text-rose-600">*</span>
              </label>
              <ActiveProjectSelect
                projects={state.projects || []}
                selectedProjectId={selectedProjectId}
                onSelect={handleProjectChange}
              />
            </div>

            {/* Project Summary Single Row */}
            {currentProject && (
              <div className="bg-slate-50 border border-[#E2E6EC] rounded-xl p-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Client: </span>
                  <strong className="text-slate-900 font-bold">{currentProject.clientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Director: </span>
                  <strong className="text-slate-900 font-bold">{currentProject.projectDirectorName || 'Priya Nair'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Supervisor: </span>
                  <strong className="text-slate-900 font-bold">{currentProject.projectSupervisorName || 'Amit Verma'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">BOQ: </span>
                  <strong className="text-emerald-700 font-bold">Locked ({projectBOQLines.length} items)</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Location: </span>
                  <strong className="text-slate-900 font-bold">{currentProject.city || currentProject.siteAddress || 'Navi Mumbai'}</strong>
                </div>
              </div>
            )}

            {/* Category, Required By, Purpose Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category / BOQ Section */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Category / BOQ Section</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570]"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Required By Date */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Required By <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570]"
                />
              </div>

              {/* Purpose of Indent */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Purpose of Indent</label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe the reason for this procurement..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#AB9570] font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* MATERIALS REQUIRED SECTION */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Materials Required</h3>

            {duplicateError && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold text-xs">
                {duplicateError}
              </div>
            )}

            {/* Inline Material Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="sm:col-span-7">
                <label className="block text-slate-700 font-bold mb-1">Material</label>
                <CompactMaterialBOQSelect
                  boqLines={projectBOQLines}
                  selectedCategory={selectedCategory}
                  selectedBoqLineId={selectedBOQLine?.id || ''}
                  onSelect={(line) => {
                    setSelectedBOQLine(line);
                    if (duplicateError) setDuplicateError(null);
                  }}
                  getAvailability={(id) => getIndentBOQAvailability(state, selectedProjectId, id, Number(inputQty) || 0)}
                  alreadySelectedIds={addedLines.map((l) => l.boqLineId)}
                  disabled={!hasValidBOQ}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-bold mb-1">
                  Qty <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={inputQty}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0);
                      setInputQty(val);
                      if (duplicateError) setDuplicateError(null);
                    }}
                    placeholder="20"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570]"
                  />
                  {selectedBOQLine?.unitSymbol && (
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 font-mono">
                      {selectedBOQLine.unitSymbol}
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="w-full py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* ADDED MATERIALS TABLE */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Added Materials Table ({calculatedAddedLines.length})
            </h3>

            {calculatedAddedLines.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 font-medium">
                No materials added yet. Select a Material, enter Qty, and click "+ Add" above.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3">Material</th>
                      <th className="py-2.5 px-3 w-20">Unit</th>
                      <th className="py-2.5 px-3">Specs</th>
                      <th className="py-2.5 px-3 w-24">Qty</th>
                      <th className="py-2.5 px-3 w-24">Rate</th>
                      <th className="py-2.5 px-3 w-28">Amount</th>
                      <th className="py-2.5 px-3 w-16 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {calculatedAddedLines.map((row, idx) => (
                      <React.Fragment key={row.boqLineId}>
                        <tr className={`hover:bg-slate-50/60 ${row.isOverLimit ? 'bg-amber-50/40' : ''}`}>
                          <td className="py-3 px-3 font-mono font-bold text-slate-400">
                            {String(row.lineIndex).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{row.itemDescription}</div>
                            <div className="text-[10px] text-slate-500">{row.categoryName}</div>
                            <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                              Accepted: {row.acceptedBOQQty} · Used: {row.previouslyIndentedQty} · Available: {' '}
                              <span className={row.availableBOQQty <= 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                                {row.availableBOQQty}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">{row.unitSymbol}</td>
                          <td className="py-3 px-3">
                            {row.specs ? (
                              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                {row.specs}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={1}
                              value={row.qty}
                              onChange={(e) => handleUpdateQty(idx, Math.max(1, parseFloat(e.target.value) || 1))}
                              className={`w-20 px-2 py-1 border rounded-lg font-mono font-bold text-xs text-right ${
                                row.isOverLimit ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-300 text-slate-900'
                              }`}
                            />
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">{formatIndianCurrency(row.rate)}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{formatIndianCurrency(row.lineTotal)}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(idx)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Material"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>

                        {/* Over-BOQ Exception Flag & Reason Row */}
                        {row.isOverLimit && (
                          <tr className="bg-amber-50/80 border-b border-amber-200">
                            <td colSpan={8} className="p-3">
                              <div className="space-y-2">
                                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                                  <span>Requested quantity exceeds available BOQ by {row.overLimitQty} {row.unitSymbol}.</span>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                                    Additional Quantity Reason <span className="text-rose-600">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={row.overBOQReason || ''}
                                    onChange={(e) => handleUpdateOverBOQReason(idx, e.target.value)}
                                    placeholder="Provide mandatory reason for requested extra quantity..."
                                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Indent Total Summary Banner */}
          {calculatedAddedLines.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs">
              <span className="text-slate-600 uppercase tracking-wider">Estimated Indent Value</span>
              <span className="text-base font-black text-slate-900 font-mono">
                {formatIndianCurrency(estimatedIndentTotal)}
              </span>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Link
              to="/procurement/indents"
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition text-xs cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmitIndent}
                className="px-5 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <CheckCircle className="h-4 w-4 stroke-[2.5]" /> Submit Indent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
