import React, { useState, useMemo, useEffect } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import {
  getProjectById,
  getNormalizedLockedBOQLines,
  getProjectBOQCategories,
  getIndentBOQAvailability,
  getProcurementReadyProjects,
} from '../../domain/selectors';
import { MaterialIndent, ProjectBOQLine } from '../../domain/types';
import { X, Plus, Trash2, ShieldAlert, AlertTriangle, Send, Save } from 'lucide-react';
import { ActiveProjectSelect } from './ActiveProjectSelect';
import { CompactMaterialBOQSelect, extractMaterialPills } from './CompactMaterialBOQSelect';

const DRAFT_STORAGE_KEY = 'empire_create_indent_draft_v1';

export interface CreateMaterialIndentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
  onSuccess?: (indentId: string) => void;
}

export const CreateMaterialIndentModal: React.FC<CreateMaterialIndentModalProps> = ({
  isOpen,
  onClose,
  initialProjectId,
  onSuccess,
}) => {
  const { state, createMaterialIndent } = useERPStore();

  // Active Procurement-Ready Projects derived from central ERPStore.projects
  const eligibleActiveProjects = useMemo(() => {
    return getProcurementReadyProjects(state);
  }, [state]);

  const defaultProjectId = initialProjectId || eligibleActiveProjects[0]?.id || '';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId);

  // Sync initialProjectId or auto-select first project
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    } else if (!selectedProjectId && eligibleActiveProjects.length > 0) {
      setSelectedProjectId(eligibleActiveProjects[0].id);
    }
  }, [initialProjectId, eligibleActiveProjects]);

  const currentProject = useMemo(() => {
    return getProjectById(state, selectedProjectId) || eligibleActiveProjects.find((p) => p.id === selectedProjectId);
  }, [state, selectedProjectId, eligibleActiveProjects]);

  // Normalized BOQ lines for selected Project
  const normalizedBOQLines = useMemo(() => {
    if (!selectedProjectId) return [];
    return getNormalizedLockedBOQLines(state, selectedProjectId);
  }, [state, selectedProjectId]);

  // Adapt normalized lines to ProjectBOQLine interface
  const projectBOQLines = useMemo<ProjectBOQLine[]>(() => {
    return normalizedBOQLines.map((l) => ({
      id: l.id,
      lineNo: l.lineNo,
      itemDescription: l.itemDescription,
      categoryId: l.categoryId,
      categoryName: l.categoryName,
      unitSymbol: l.unitSymbol,
      boqQuantity: l.boqQuantity,
      boqRate: l.boqRate,
      boqAmount: l.boqAmount,
      indentedQuantity: 0,
      orderedQuantity: 0,
      receivedQuantity: 0,
      issuedQuantity: 0,
      remainingQuantity: l.boqQuantity,
      committedCost: 0,
      actualCost: 0,
      variance: 0,
      specifications: l.specifications,
      productId: l.productId,
    })) as unknown as ProjectBOQLine[];
  }, [normalizedBOQLines]);

  // Derived unique categories from Project BOQ
  const availableCategories = useMemo(() => {
    if (!selectedProjectId) return [];
    return getProjectBOQCategories(state, selectedProjectId);
  }, [state, selectedProjectId]);

  // Form Fields
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [requiredByDate, setRequiredByDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState('');

  // Material Selection Row State
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
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  // Default select first category if available and none selected
  useEffect(() => {
    if (availableCategories.length > 0) {
      const exists = availableCategories.some((c) => c.name === selectedCategory);
      if (!selectedCategory || !exists) {
        setSelectedCategory(availableCategories[0].name);
      }
    } else {
      setSelectedCategory('');
    }
  }, [availableCategories]);

  // Restore saved draft on modal open
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedProjectId && eligibleActiveProjects.some((p) => p.id === parsed.selectedProjectId)) {
            setSelectedProjectId(parsed.selectedProjectId);
          } else if (defaultProjectId) {
            setSelectedProjectId(defaultProjectId);
          }
          if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
          if (parsed.requiredByDate) setRequiredByDate(parsed.requiredByDate);
          if (parsed.purpose) setPurpose(parsed.purpose);
          if (Array.isArray(parsed.addedLines)) setAddedLines(parsed.addedLines);
        } else if (defaultProjectId) {
          setSelectedProjectId(defaultProjectId);
        }
      } catch (err) {
        console.error('Error restoring indent draft:', err);
      }
    }
  }, [isOpen]);

  // Save draft utility
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
    setSelectedCategory('');
    setSelectedBOQLine(null);
    setInputQty('');
    setAddedLines([]);
    saveDraftToStorage(projId, '', requiredByDate, purpose, []);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedBOQLine(null);
  };

  // Add Material handler
  const handleAddMaterial = () => {
    setErrorMsg(null);
    setDuplicateError(null);
    setHighlightedRowId(null);

    if (!selectedProjectId) {
      setErrorMsg('Please select a Project.');
      return;
    }
    if (!selectedCategory) {
      setErrorMsg('Please select a Category.');
      return;
    }
    if (!selectedBOQLine) {
      setDuplicateError('Please select a material.');
      return;
    }
    const qtyVal = Number(inputQty);
    if (!qtyVal || qtyVal <= 0) {
      setDuplicateError('Please enter a quantity greater than 0.');
      return;
    }

    // Check duplicate
    const exists = addedLines.some((l) => l.boqLineId === selectedBOQLine.id);
    if (exists) {
      setDuplicateError('Material already added to this Indent.');
      setHighlightedRowId(selectedBOQLine.id);
      return;
    }

    const newLine = {
      boqLineId: selectedBOQLine.id,
      itemDescription: selectedBOQLine.itemDescription,
      categoryName: selectedBOQLine.categoryName || selectedCategory || 'General Works',
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

  // Availability calculations
  const calculatedAddedLines = useMemo(() => {
    return addedLines.map((line, idx) => {
      const avail = getIndentBOQAvailability(state, selectedProjectId, line.boqLineId, line.qty);
      const isOverLimit = line.qty > avail.availableBOQQty;
      const overLimitQty = isOverLimit ? line.qty - avail.availableBOQQty : 0;
      const lineTotal = line.qty * line.rate;

      return {
        ...line,
        lineIndex: idx + 1,
        acceptedBOQQty: avail.acceptedBOQQty || 100,
        previouslyIndentedQty: avail.previouslyIndentedQty || 0,
        availableBOQQty: avail.availableBOQQty ?? 100,
        isOverLimit,
        overLimitQty,
        lineTotal,
      };
    });
  }, [addedLines, state, selectedProjectId]);

  const estimatedIndentTotal = calculatedAddedLines.reduce((sum, l) => sum + l.lineTotal, 0);

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
      onSuccess?.(res.indent.id);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to save draft indent.');
    }
  };

  const handleSubmitIndent = () => {
    setErrorMsg(null);
    if (!currentProject) {
      setErrorMsg('Material Indents require an active Project.');
      return;
    }
    if (!selectedCategory) {
      setErrorMsg('Please select a Category.');
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

    const indentId = `ind-${Date.now()}`;
    const indentNumber = `IND-${String((state.materialIndents || []).length + 1).padStart(3, '0')}`;
    const newIndent: MaterialIndent = {
      id: indentId,
      indentNumber,
      documentNumber: indentNumber,
      projectId: selectedProjectId,
      projectCode: currentProject.projectCode,
      projectName: currentProject.projectName,
      requestedByEmployeeName: currentProject.projectSupervisorName || 'Site Engineer',
      deliveryLocation: currentProject.siteAddress || 'Main Site Store',
      priority: 'normal',
      requiredByDate,
      status: 'submitted',
      purpose,
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

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    // Reset local state
    setSelectedProjectId('');
    setSelectedCategory('');
    setSelectedBOQLine(null);
    setInputQty('');
    setPurpose('');
    setAddedLines([]);
    setErrorMsg(null);
    setDuplicateError(null);

    onSuccess?.(createRes.indent.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans text-xs">
      {/* Centered Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-[#E2E6EC] w-full max-w-[780px] max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-[#121214]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#121214] tracking-tight">Create New Material Indent</h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">Fill in the details to request materials for a project.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bordered Top Details Box */}
          <div className="border border-[#E2E6EC] rounded-xl p-4 bg-white space-y-4">
            {/* Row 1: Project & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project <span className="text-rose-600">*</span>
                </label>
                <ActiveProjectSelect
                  projects={state.projects || []}
                  selectedProjectId={selectedProjectId}
                  onSelect={handleProjectChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedCategory}
                  disabled={!selectedProjectId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`w-full h-[42px] bg-white border border-slate-300 rounded-xl px-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#AB9570] focus:border-[#AB9570] ${
                    !selectedProjectId ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <option value="" disabled={Boolean(selectedCategory)}>
                    Select Category...
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Required By */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Required By <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full sm:w-1/2 h-[42px] bg-white border border-slate-300 rounded-xl px-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#AB9570] focus:border-[#AB9570]"
              />
            </div>

            {/* Row 3: Purpose of Indent */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Purpose of Indent</label>
              <textarea
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the reason for this procurement..."
                className="w-full h-[76px] bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#AB9570] focus:border-[#AB9570] resize-none font-normal"
              />
            </div>

            {/* Secondary info line */}
            {currentProject && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 text-[11px] text-slate-500 font-medium">
                <span>
                  Client: <strong className="text-slate-800">{currentProject.clientName}</strong>
                </span>
                <span>•</span>
                <span>
                  Supervisor: <strong className="text-slate-800">{currentProject.projectSupervisorName || 'Amit Verma'}</strong>
                </span>
                <span>•</span>
                <span>
                  BOQ: <strong className="text-emerald-700 font-semibold">Locked ({projectBOQLines.length} Lines)</strong>
                </span>
              </div>
            )}
          </div>

          {/* MATERIALS REQUIRED SECTION */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono font-bold text-xs">#</span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Materials Required</h3>
            </div>

            {duplicateError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold text-xs flex items-center justify-between">
                <span>{duplicateError}</span>
                <button type="button" onClick={() => setDuplicateError(null)} className="text-amber-700 hover:text-amber-900 font-bold">
                  ×
                </button>
              </div>
            )}

            {/* Compact Material Input Box */}
            <div className="bg-[#F7F8FA] border border-[#E2E6EC] rounded-xl p-3.5 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                MATERIAL - {addedLines.length + 1}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="w-full sm:flex-1">
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
                    disabled={!selectedCategory || !selectedProjectId}
                  />
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    min={1}
                    value={inputQty}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0);
                      setInputQty(val);
                      if (duplicateError) setDuplicateError(null);
                    }}
                    placeholder="Qty"
                    className="w-full h-[42px] bg-white border border-slate-300 rounded-xl px-3 text-xs font-bold text-slate-900 text-center focus:ring-2 focus:ring-[#AB9570] focus:border-[#AB9570]"
                  />
                </div>

                <div className="w-full sm:w-24">
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="w-full h-[42px] bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MATERIAL TABLE */}
          <div className="space-y-2">
            <div className="border border-[#E2E6EC] rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F8FA] border-b border-[#E2E6EC] text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3.5 w-10">#</th>
                    <th className="py-2.5 px-3.5">Material Name</th>
                    <th className="py-2.5 px-3.5 w-24">Unit</th>
                    <th className="py-2.5 px-3.5">Specs</th>
                    <th className="py-2.5 px-3.5 w-24 text-center">Qty</th>
                    <th className="py-2.5 px-3.5 w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {calculatedAddedLines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-normal">
                        No materials added yet.
                      </td>
                    </tr>
                  ) : (
                    calculatedAddedLines.map((row, idx) => {
                      const isHighlighted = highlightedRowId === row.boqLineId;
                      const pills = extractMaterialPills({
                        itemDescription: row.itemDescription,
                        unitSymbol: row.unitSymbol,
                        specifications: row.specs,
                      } as any);

                      return (
                        <React.Fragment key={row.boqLineId}>
                          <tr
                            className={`transition-colors h-14 ${
                              isHighlighted
                                ? 'bg-amber-100/70 border-l-4 border-l-amber-500'
                                : row.isOverLimit
                                ? 'bg-amber-50/40'
                                : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <td className="py-3 px-3.5 font-bold text-[#AB9570] font-mono">
                              {String(row.lineIndex).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-900">{row.itemDescription}</div>
                              {row.availableBOQQty > 0 && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Available: {row.availableBOQQty} {row.unitSymbol}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-slate-700 font-medium">{row.unitSymbol}</td>
                            <td className="py-3 px-3.5">
                              <div className="flex flex-wrap gap-1">
                                {pills.map((pill, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="inline-block px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-md text-[10px] font-medium"
                                  >
                                    {pill}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <input
                                type="number"
                                min={1}
                                value={row.qty}
                                onChange={(e) => handleUpdateQty(idx, Math.max(1, parseFloat(e.target.value) || 1))}
                                className={`w-16 h-8 px-2 border rounded-lg font-bold text-xs text-center ${
                                  row.isOverLimit ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-300 text-slate-900'
                                }`}
                              />
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMaterial(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Delete Material"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>

                          {/* Inline Over-BOQ Exception Flag & Input */}
                          {row.isOverLimit && (
                            <tr className="bg-amber-50/80 border-b border-amber-200">
                              <td colSpan={6} className="p-3.5 space-y-2">
                                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                                  <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                                  <span>
                                    Requested quantity exceeds available BOQ by {row.overLimitQty} {row.unitSymbol}.
                                  </span>
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
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-xs cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-800 font-semibold rounded-xl hover:bg-slate-50 transition text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-slate-500" /> Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmitIndent}
              className="px-5 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> Submit Intent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
