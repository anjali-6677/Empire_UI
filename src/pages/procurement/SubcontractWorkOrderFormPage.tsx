import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { SubcontractWorkOrder } from '../../domain/types';
import { PageHeader } from '../../components/common/PageHeader';
import { ActiveProjectSelect } from '../../components/procurement/ActiveProjectSelect';
import { BOQLineSelect } from '../../components/procurement/BOQLineSelect';
import { getProjectLockedBOQLines, calculateBOQLineSubcontractAvailability, NormalizedBOQLine } from '../../utils/boqHelper';
import { formatIndianCurrency } from '../../utils/format';
import { ArrowLeft, Save, Plus, Trash2, Hammer, AlertTriangle, Info } from 'lucide-react';

export const SubcontractWorkOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createSubcontractorWorkOrder } = useERPStore();

  // 1. Filter Eligible Projects: Active & BOQ Locked & has valid BOQ lines
  const eligibleProjects = useMemo(() => {
    return (state.projects || []).filter((p: any) => {
      const isActive = (p.status || p.projectStatus || '').toLowerCase() === 'active';
      const isLocked = Boolean(p.isBOQLocked || p.projectBOQLocked || p.boqLockSetup?.isBOQLocked);
      const lines = getProjectLockedBOQLines(p);
      return isActive && isLocked && lines.length > 0;
    });
  }, [state.projects]);

  const vendors = useMemo(() => {
    return (state.vendors || []).filter(
      (v) => v.vendorType === 'subcontractor' || v.vendorType === 'both' || !v.vendorType || (v as any).tradeCategory
    );
  }, [state.vendors]);

  const [projectId, setProjectId] = useState<string>(eligibleProjects[0]?.id || '');
  const [subcontractorId, setSubcontractorId] = useState<string>(vendors[0]?.id || '');
  const [retentionPercentage, setRetentionPercentage] = useState<number>(5);
  const [taxPercentage, setTaxPercentage] = useState<number>(18);
  const [paymentTerms, setPaymentTerms] = useState<string>(
    'Bi-weekly RA bills against verified site WIP measurement, subject to 5% retention deduction.'
  );

  const selectedProject = useMemo(() => {
    return eligibleProjects.find((p) => p.id === projectId) || eligibleProjects[0];
  }, [eligibleProjects, projectId]);

  // All normalized BOQ lines for selected project
  const allProjectBOQLines = useMemo(() => {
    return getProjectLockedBOQLines(selectedProject);
  }, [selectedProject]);

  // Derive Trade Categories dynamically from Project Locked BOQ
  const availableCategories = useMemo(() => {
    const catsSet = new Set<string>();
    allProjectBOQLines.forEach((line) => {
      if (line.categoryName) catsSet.add(line.categoryName);
    });
    const catsArray = Array.from(catsSet);
    return catsArray.length > 0 ? catsArray : ['General Fitout'];
  }, [allProjectBOQLines]);

  const [workCategory, setWorkCategory] = useState<string>(availableCategories[0] || 'General Fitout');

  // Update selected category when project changes if current category is not in new project
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(workCategory)) {
      setWorkCategory(availableCategories[0]);
    }
  }, [availableCategories, workCategory]);

  // Filter BOQ lines for the selected Trade Category
  const categoryBOQLines = useMemo(() => {
    return allProjectBOQLines.filter(
      (l) =>
        l.categoryName.toLowerCase() === workCategory.toLowerCase() ||
        l.categoryId.toLowerCase() === workCategory.toLowerCase()
    );
  }, [allProjectBOQLines, workCategory]);

  // Helper for availability calculation per BOQ line
  const getLineAvailability = (boqLineId: string) => {
    if (!projectId || !boqLineId) return { boqQuantity: 0, alreadySubcontractedQty: 0, availableQty: 0 };
    return calculateBOQLineSubcontractAvailability(state, projectId, boqLineId);
  };

  // State for Work Order Items
  const [items, setItems] = useState<
    Array<{
      id: string;
      boqLineId: string;
      itemCode?: string;
      scopeDescription: string;
      unitSymbol: string;
      availableQty: number;
      quantity: number;
      rate: number; // negotiated WO rate
      referenceRate: number; // baseline BOQ rate
      amount: number;
      variationReason?: string;
    }>
  >([]);

  // Initialize or update first item when project/category loads
  useEffect(() => {
    if (items.length === 0 && categoryBOQLines.length > 0) {
      const firstLine = categoryBOQLines[0];
      const avail = getLineAvailability(firstLine.id);
      setItems([
        {
          id: `woi-${Date.now()}-1`,
          boqLineId: firstLine.id,
          itemCode: firstLine.itemCode,
          scopeDescription: firstLine.itemDescription,
          unitSymbol: firstLine.unitSymbol,
          availableQty: avail.availableQty,
          quantity: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 100),
          rate: firstLine.boqRate,
          referenceRate: firstLine.boqRate,
          amount: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 100) * firstLine.boqRate,
        },
      ]);
    }
  }, [categoryBOQLines]);

  // Handle Project Change Behavior: Clear category, BOQ selections, and item rows
  const handleProjectSelect = (newProjectId: string) => {
    if (newProjectId === projectId) return;
    setProjectId(newProjectId);
    const newProj = eligibleProjects.find((p) => p.id === newProjectId);
    const newLines = getProjectLockedBOQLines(newProj);
    const newCats = Array.from(new Set(newLines.map((l) => l.categoryName)));
    const firstCat = newCats[0] || 'General Fitout';
    setWorkCategory(firstCat);

    const firstCatLines = newLines.filter((l) => l.categoryName === firstCat);
    if (firstCatLines.length > 0) {
      const firstLine = firstCatLines[0];
      const avail = calculateBOQLineSubcontractAvailability(state, newProjectId, firstLine.id);
      setItems([
        {
          id: `woi-${Date.now()}-1`,
          boqLineId: firstLine.id,
          itemCode: firstLine.itemCode,
          scopeDescription: firstLine.itemDescription,
          unitSymbol: firstLine.unitSymbol,
          availableQty: avail.availableQty,
          quantity: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50),
          rate: firstLine.boqRate,
          referenceRate: firstLine.boqRate,
          amount: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50) * firstLine.boqRate,
        },
      ]);
    } else {
      setItems([]);
    }
  };

  // Handle Category Change Behavior: Clear BOQ line selections and auto-filled data for item rows
  const handleCategorySelect = (newCat: string) => {
    setWorkCategory(newCat);
    const newCatLines = allProjectBOQLines.filter((l) => l.categoryName === newCat);
    if (newCatLines.length > 0) {
      const firstLine = newCatLines[0];
      const avail = getLineAvailability(firstLine.id);
      setItems([
        {
          id: `woi-${Date.now()}-1`,
          boqLineId: firstLine.id,
          itemCode: firstLine.itemCode,
          scopeDescription: firstLine.itemDescription,
          unitSymbol: firstLine.unitSymbol,
          availableQty: avail.availableQty,
          quantity: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50),
          rate: firstLine.boqRate,
          referenceRate: firstLine.boqRate,
          amount: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50) * firstLine.boqRate,
        },
      ]);
    } else {
      setItems([]);
    }
  };

  const handleAddItem = () => {
    const unselectedLine = categoryBOQLines.find((l) => !items.some((i) => i.boqLineId === l.id)) || categoryBOQLines[0];
    if (!unselectedLine) return;

    const avail = getLineAvailability(unselectedLine.id);
    setItems((prev) => [
      ...prev,
      {
        id: `woi-${Date.now()}-${prev.length + 1}`,
        boqLineId: unselectedLine.id,
        itemCode: unselectedLine.itemCode,
        scopeDescription: unselectedLine.itemDescription,
        unitSymbol: unselectedLine.unitSymbol,
        availableQty: avail.availableQty,
        quantity: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50),
        rate: unselectedLine.boqRate,
        referenceRate: unselectedLine.boqRate,
        amount: Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50) * unselectedLine.boqRate,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBOQLineChange = (index: number, line: NormalizedBOQLine) => {
    const avail = getLineAvailability(line.id);
    setItems((prev) => {
      const updated = [...prev];
      const defaultQty = Math.min(avail.availableQty > 0 ? avail.availableQty : 1, 50);
      updated[index] = {
        ...updated[index],
        boqLineId: line.id,
        itemCode: line.itemCode,
        scopeDescription: line.itemDescription, // Auto-fill description
        unitSymbol: line.unitSymbol, // Auto-fill UOM
        availableQty: avail.availableQty, // Auto-fill Available Qty
        referenceRate: line.boqRate, // Auto-fill Reference Rate
        rate: updated[index].rate > 0 ? updated[index].rate : line.boqRate, // Retain negotiated rate if set
        quantity: defaultQty,
        amount: defaultQty * (updated[index].rate > 0 ? updated[index].rate : line.boqRate),
      };
      return updated;
    });
  };

  const handleItemFieldChange = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'rate') {
        const qty = field === 'quantity' ? Number(value) : item.quantity;
        const rate = field === 'rate' ? Number(value) : item.rate;
        item.amount = qty * rate;
      }

      updated[index] = item;
      return updated;
    });
  };

  const subtotal = items.reduce((sum, l) => sum + (l.amount || 0), 0);
  const taxTotal = (subtotal * taxPercentage) / 100;
  const grandTotal = subtotal + taxTotal;

  // Form Validation
  const hasDuplicateBOQLines = useMemo(() => {
    const lineIds = items.map((i) => i.boqLineId).filter(Boolean);
    return new Set(lineIds).size !== lineIds.length;
  }, [items]);

  const hasExceededAvailableQtyWithoutReason = useMemo(() => {
    return items.some((item) => item.quantity > item.availableQty && !item.variationReason?.trim());
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (hasDuplicateBOQLines) {
      alert('Error: Duplicate BOQ lines selected. Please ensure each item line references a unique project BOQ line.');
      return;
    }

    if (hasExceededAvailableQtyWithoutReason) {
      alert('Error: One or more items exceed available BOQ quantity. Please provide an Additional / Variation Reason.');
      return;
    }

    const vendorObj = vendors.find((v) => v.id === subcontractorId);
    const newWO: SubcontractWorkOrder = {
      id: `swo-${Date.now()}`,
      documentNumber: `SWO-${Date.now().toString().slice(-6)}`,
      woNumber: `SWO-${Date.now().toString().slice(-6)}`,
      projectId: selectedProject.id,
      projectName: selectedProject.projectName,
      subcontractorId,
      subcontractorName: vendorObj?.name || 'Subcontractor Agency',
      workCategory,
      startDate: new Date().toISOString().split('T')[0],
      completionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms,
      retentionPercentage,
      taxPercentage,
      items: items.map((item) => ({
        id: item.id,
        boqLineId: item.boqLineId,
        itemCode: item.itemCode,
        scopeDescription: item.scopeDescription,
        categoryName: workCategory,
        quantity: item.quantity,
        unitSymbol: item.unitSymbol,
        rate: item.rate,
        amount: item.amount,
        variationReason: item.quantity > item.availableQty ? item.variationReason : undefined,
      })),
      subtotal,
      taxTotal,
      grandTotal,
      retentionAmount: (subtotal * retentionPercentage) / 100,
      finalContractValue: grandTotal,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      createdBy: 'Contracts Officer',
      updatedAt: new Date().toISOString(),
    };

    createSubcontractorWorkOrder(newWO, 'Contracts Officer');
    navigate('/procurement/work-orders');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/procurement/work-orders')}
          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Work Orders List
        </button>
      </div>

      <PageHeader
        title="Create Subcontractor Work Order"
        subtitle="Award trade work orders linked directly to BOQ line items with enforced retention & rate rules."
      />

      {eligibleProjects.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-amber-900">No Eligible Active & BOQ-Locked Projects</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Subcontract Work Orders require an active project with a locked BOQ baseline. Complete Project BOQ setup before issuing a Subcontract Work Order.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Project Site *</label>
              <ActiveProjectSelect
                projects={eligibleProjects as any}
                selectedProjectId={projectId}
                onSelect={handleProjectSelect}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subcontractor Agency *</label>
              <select
                value={subcontractorId}
                onChange={(e) => setSubcontractorId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-[#AB9570] focus:border-[#AB9570] bg-white h-[42px]"
              >
                {vendors.length === 0 ? (
                  <option value="">No Subcontractor Vendors Found</option>
                ) : (
                  vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({(v as any).tradeCategory || v.gstin || 'GST Unregistered'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Trade Work Category *</label>
              <select
                value={workCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-[#AB9570] focus:border-[#AB9570] bg-white h-[42px]"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scope Items Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <Hammer className="w-4 h-4 mr-2 text-[#AB9570]" /> Subcontract Scope & Rate Schedule
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing BOQ lines under category: <strong className="text-gray-900">{workCategory}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={categoryBOQLines.length === 0}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#121214] bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-[#AB9570]" /> Add BOQ Item Line
              </button>
            </div>

            {hasDuplicateBOQLines && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                This BOQ line is already added to the Work Order. Please remove or select a different BOQ line.
              </div>
            )}

            {categoryBOQLines.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg space-y-2">
                <Info className="w-6 h-6 text-gray-400 mx-auto" />
                <div className="text-xs font-semibold text-gray-700">
                  No BOQ lines are available under category "{workCategory}" for the selected project.
                </div>
                <p className="text-[11px] text-gray-500">Select another Trade Work Category above to view available BOQ lines.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                      <th className="py-2.5 px-3 min-w-[240px]">Linked Project BOQ Line *</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Scope Description</th>
                      <th className="py-2.5 px-3 text-center w-16">UOM</th>
                      <th className="py-2.5 px-3 text-right w-24">Available</th>
                      <th className="py-2.5 px-3 text-right w-24">WO Qty *</th>
                      <th className="py-2.5 px-3 text-right w-28">Ref Rate</th>
                      <th className="py-2.5 px-3 text-right w-28">WO Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right w-32">Amount (₹)</th>
                      <th className="py-2.5 px-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, idx) => {
                      const isOverBOQ = item.quantity > item.availableQty;
                      const overQty = item.quantity - item.availableQty;

                      return (
                        <React.Fragment key={item.id || idx}>
                          <tr className={`hover:bg-gray-50/50 ${isOverBOQ ? 'bg-amber-50/30' : ''}`}>
                            <td className="py-2 px-3">
                              <BOQLineSelect
                                boqLines={categoryBOQLines}
                                selectedLineId={item.boqLineId}
                                onSelect={(line) => handleBOQLineChange(idx, line)}
                                getAvailability={getLineAvailability}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.scopeDescription}
                                onChange={(e) => handleItemFieldChange(idx, 'scopeDescription', e.target.value)}
                                className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#AB9570]"
                              />
                            </td>
                            <td className="py-2 px-3 text-center font-medium text-gray-700">{item.unitSymbol}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-800">{item.availableQty}</td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemFieldChange(idx, 'quantity', Number(e.target.value))}
                                className={`w-24 text-right text-xs p-1.5 border rounded focus:ring-1 focus:ring-[#AB9570] font-bold ${
                                  isOverBOQ ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
                                }`}
                              />
                            </td>
                            <td className="py-2 px-3 text-right text-gray-500 font-mono">
                              {formatIndianCurrency(item.referenceRate)}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={item.rate}
                                onChange={(e) => handleItemFieldChange(idx, 'rate', Number(e.target.value))}
                                className="w-28 text-right text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#AB9570] font-semibold"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-gray-900">
                              {formatIndianCurrency(item.amount)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                disabled={items.length === 1}
                                className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>

                          {/* Exceeding Available Qty Warning & Reason Row */}
                          {isOverBOQ && (
                            <tr className="bg-amber-50/70 border-b border-amber-200">
                              <td colSpan={9} className="py-2 px-4 space-y-2">
                                <div className="flex items-center text-xs font-semibold text-amber-800">
                                  <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600 shrink-0" />
                                  Work Order quantity exceeds available Project BOQ quantity by {overQty} {item.unitSymbol}.
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                                    Additional / Variation Reason *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={item.variationReason || ''}
                                    onChange={(e) => handleItemFieldChange(idx, 'variationReason', e.target.value)}
                                    placeholder="State justification for exceeding baseline BOQ quantity..."
                                    className="w-full text-xs p-1.5 bg-white border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 text-gray-900"
                                  />
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
            )}

            {/* Financial Calculation Bar */}
            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Scope Amount:</span>
                  <span className="font-semibold text-gray-900">{formatIndianCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>GST Tax Rate (%):</span>
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-16 text-right p-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST Tax Amount:</span>
                  <span className="font-semibold text-gray-900">{formatIndianCurrency(taxTotal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total Work Order Value:</span>
                  <span className="text-emerald-700">{formatIndianCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial & Verification Terms */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Retention Deduction (%)</label>
              <input
                type="number"
                value={retentionPercentage}
                onChange={(e) => setRetentionPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-[#AB9570] focus:border-[#AB9570]"
              />
              <p className="text-xs text-gray-500 mt-1">Automatically deducted from certified RA bills as security deposit.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment & Milestone Terms</label>
              <textarea
                rows={3}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-[#AB9570] focus:border-[#AB9570]"
              />
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/procurement/work-orders')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasDuplicateBOQLines || hasExceededAvailableQtyWithoutReason}
              className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-[#121214] hover:bg-[#252528] disabled:opacity-50 rounded-lg shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2 text-[#AB9570]" /> Submit Work Order for Approval
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SubcontractWorkOrderFormPage;
