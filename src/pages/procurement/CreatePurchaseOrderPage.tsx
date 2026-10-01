import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { ApprovedIndentSelect } from '../../components/procurement/ApprovedIndentSelect';
import { PurchaseOrderSourceSummary } from '../../components/procurement/PurchaseOrderSourceSummary';
import { VendorQuotationCards } from '../../components/procurement/VendorQuotationCards';
import { VendorComparisonPanel } from '../../components/procurement/VendorComparisonPanel';
import { VendorSelectionJustification } from '../../components/procurement/VendorSelectionJustification';
import { PurchaseOrderItemsTable, POItemRow } from '../../components/procurement/PurchaseOrderItemsTable';
import { PurchaseOrderCommercialSummary } from '../../components/procurement/PurchaseOrderCommercialSummary';
import { DirectPurchaseOrderWorkspace } from '../../components/procurement/DirectPurchaseOrderWorkspace';
import {
  getCanonicalRFQIds,
  getQuotationRFQIds,
  getQuotationLandedAmount,
  isValidReceivedQuotation,
} from '../../utils/procurementSelectors';
import { formatIndianCurrency } from '../../utils/format';

export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfqParamId = searchParams.get('rfqId');
  const indentParamId = searchParams.get('indentId');
  const modeParam = searchParams.get('mode');

  const { state, addItem, updateItem, logAudit } = useERPStore();

  const indents = state.materialIndents || [];
  const projects = state.projects || [];
  const rfqs = state.rfqs || [];
  const vendorQuotations = state.vendorQuotations || [];
  const vendors = state.vendors || [];
  const products = state.products || [];
  const categories = state.categories || [];
  const units = state.units || [];
  const stockLocations = state.stockLocations || [];
  const companyEntities = state.companyEntities || [];
  const purchaseOrders = state.purchaseOrders || [];

  // Determine RFQ source context if provided using canonical ID matching
  const targetRFQ = rfqParamId
    ? rfqs.find((r) => {
        const ids = getCanonicalRFQIds(r);
        return ids.includes(rfqParamId.trim().toLowerCase());
      })
    : null;

  // Determine initial selected indent explicitly from RFQ sourceIndentId / indentId first
  const initialIndentId =
    targetRFQ?.indentId ||
    (targetRFQ as any)?.sourceIndentId ||
    indentParamId ||
    '';

  const [selectedIndentId, setSelectedIndentId] = useState<string>(initialIndentId);
  const [lockedFromRFQ, setLockedFromRFQ] = useState<boolean>(Boolean(targetRFQ));

  // Sync initial indent if targetRFQ resolves asynchronously or after load
  useEffect(() => {
    if (targetRFQ) {
      const resolvedIndentId = targetRFQ.indentId || (targetRFQ as any).sourceIndentId;
      if (resolvedIndentId && resolvedIndentId !== selectedIndentId) {
        setSelectedIndentId(resolvedIndentId);
      }
      setLockedFromRFQ(true);
    }
  }, [rfqParamId, targetRFQ]);

  const selectedIndent = indents.find((i) => i.id === selectedIndentId) || (targetRFQ ? indents.find((i) => i.indentNumber === targetRFQ.sourceIndentNumber) : null);
  const selectedProject = selectedIndent
    ? projects.find((p) => p.id === selectedIndent.projectId)
    : targetRFQ
    ? projects.find((p) => p.id === targetRFQ.projectId)
    : null;

  // Determine mode (RFQ route vs Direct PO route)
  const isIndentDirectPO = Boolean(
    modeParam === 'direct' ||
      (selectedIndent as any)?.purchaseType === 'direct_po' ||
      (selectedIndent as any)?.isDirectPO ||
      (indentParamId && !rfqParamId)
  );
  const [mode, setMode] = useState<'rfq' | 'direct'>(isIndentDirectPO ? 'direct' : 'rfq');

  useEffect(() => {
    if (modeParam === 'direct') {
      setMode('direct');
    } else if (selectedIndent && !targetRFQ) {
      if ((selectedIndent as any)?.purchaseType === 'direct_po' || (selectedIndent as any)?.isDirectPO) {
        setMode('direct');
      }
    }
  }, [selectedIndent, targetRFQ, modeParam]);

  // RFQ selection logic: fetch quotes for targetRFQ or for any linked RFQs of the selected indent
  const linkedRFQs = targetRFQ
    ? [targetRFQ]
    : selectedIndent
    ? rfqs.filter((r) => r.indentId === selectedIndent.id || (r as any).sourceIndentId === selectedIndent.id || r.sourceIndentNumber === selectedIndent.indentNumber)
    : [];

  const linkedQuotes = vendorQuotations.filter((q) => {
    const isLinked = linkedRFQs.some((r) => {
      const canonicalIds = getCanonicalRFQIds(r);
      const qRfqIds = getQuotationRFQIds(q);
      return qRfqIds.some((qId) => canonicalIds.includes(qId));
    });
    return isLinked && isValidReceivedQuotation(q);
  });

  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Non-L1 Justification state
  const [nonL1Reason, setNonL1Reason] = useState<string>('');
  const [nonL1CommercialNotes, setNonL1CommercialNotes] = useState<string>('');
  const [nonL1TechnicalNotes, setNonL1TechnicalNotes] = useState<string>('');

  // Line items state for RFQ Route
  const [poItems, setPoItems] = useState<POItemRow[]>([]);

  // Commercial & Terms state for RFQ Route
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [poDate, setPoDate] = useState<string>(todayStr);
  const [deliveryDate, setDeliveryDate] = useState<string>(nextWeekStr);
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('Deliver directly to project site gate during working hours 9 AM - 6 PM.');
  const [generalNotes, setGeneralNotes] = useState<string>('Standard 12-month manufacturer warranty applies. Inspect goods prior to unloading.');
  const [freight, setFreight] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Auto-select lowest vendor quote (L1) when linked quotes load
  useEffect(() => {
    if (linkedQuotes.length > 0 && !selectedQuotationId) {
      const sorted = [...linkedQuotes].sort(
        (a, b) => getQuotationLandedAmount(a) - getQuotationLandedAmount(b)
      );
      setSelectedQuotationId(sorted[0].id);
    }
  }, [linkedQuotes, selectedQuotationId]);

  // Sync PO line items whenever selected indent or quotation changes (RFQ mode)
  useEffect(() => {
    if (mode === 'direct' || !selectedIndent) {
      setPoItems([]);
      return;
    }

    const selQuote = vendorQuotations.find((q) => q.id === selectedQuotationId);

    const items: POItemRow[] = (selectedIndent.items || (selectedIndent as any).lines || []).map((line: any, idx: number) => {
      const matName = line.materialName || line.itemDescription || line.productName || `Item #${idx + 1}`;
      const appQty = line.approvedQty || line.quantity || line.requestedQty || 0;
      const prevQty = line.convertedQty || line.orderedQty || 0;
      const remQty = Math.max(0, appQty - prevQty);

      let rate = line.estimatedRate || line.rate || 100;
      if (selQuote) {
        rate = (selQuote as any).unitRate || ((selQuote as any).basicAmount ? (selQuote as any).basicAmount / Math.max(1, appQty) : rate);
      }

      const poQty = remQty;
      const sub = poQty * rate;
      const taxPct = line.taxPercent || 18;
      const taxAmt = (sub * taxPct) / 100;

      return {
        boqLineId: line.boqLineId || line.id || `line-${idx}`,
        materialName: matName,
        categoryName: line.categoryName || (selectedIndent as any).category || 'General',
        unit: line.unit || line.unitSymbol || 'Pcs',
        approvedQty: appQty,
        previouslyConvertedQty: prevQty,
        remainingQty: remQty,
        poQty,
        unitRate: rate,
        taxPercent: taxPct,
        lineSubtotal: sub,
        lineTaxAmount: taxAmt,
        lineTotal: sub + taxAmt,
      };
    });

    setPoItems(items);
  }, [selectedIndentId, selectedQuotationId, mode]);

  const handleItemQtyChange = (index: number, qty: number) => {
    setPoItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.poQty = qty;
      item.lineSubtotal = qty * item.unitRate;
      item.lineTaxAmount = (item.lineSubtotal * item.taxPercent) / 100;
      item.lineTotal = item.lineSubtotal + item.lineTaxAmount;
      updated[index] = item;
      return updated;
    });
  };

  const handleItemRateChange = (index: number, rate: number) => {
    setPoItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.unitRate = rate;
      item.lineSubtotal = item.poQty * rate;
      item.lineTaxAmount = (item.lineSubtotal * item.taxPercent) / 100;
      item.lineTotal = item.lineSubtotal + item.lineTaxAmount;
      updated[index] = item;
      return updated;
    });
  };

  // Financial Calculations for RFQ Route
  const itemsSubtotal = poItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const totalTaxAmount = poItems.reduce((sum, item) => sum + item.lineTaxAmount, 0);
  const grandTotal = Math.max(0, itemsSubtotal - discount + freight + totalTaxAmount);

  // Vendor resolution for RFQ Route
  const selectedQuoteObj = vendorQuotations.find((q) => q.id === selectedQuotationId);
  const selectedVendorObj: any = vendors.find((v) => v.id === (selectedQuoteObj as any)?.vendorId) || { id: `v-${Date.now()}`, name: (selectedQuoteObj as any)?.vendorName || 'Vendor' };

  // Check if non-L1 selected
  let isNonL1Selected = false;
  if (mode === 'rfq' && linkedQuotes.length > 1 && selectedQuotationId) {
    const sorted = [...linkedQuotes].sort(
      (a, b) => getQuotationLandedAmount(a) - getQuotationLandedAmount(b)
    );
    if (sorted[0]?.id !== selectedQuotationId) {
      isNonL1Selected = true;
    }
  }

  // Handle Direct PO Save Handler
  const handleDirectPOSave = (poPayload: any, targetStatus: 'draft' | 'pending_approval' | 'issued') => {
    setIsSubmitting(true);
    addItem('purchaseOrders', poPayload);

    logAudit({
      documentType: 'purchase_order',
      documentId: poPayload.id,
      documentNumber: poPayload.documentNumber,
      action: targetStatus === 'issued' ? 'PO_ISSUED' : 'PO_CREATED',
      performedBy: 'Current User',
      newStatus: targetStatus,
      details: `Direct Purchase Order ${poPayload.documentNumber} created for ${poPayload.vendorName}. Total: ₹${formatIndianCurrency(poPayload.grandTotal)}`,
    });

    setIsSubmitting(false);
    navigate('/procurement/purchase-orders');
  };

  // Handle RFQ-based PO Submission
  const handleProcessRFQPOMode = (status: 'Draft' | 'Pending Approval' | 'Issued') => {
    setFormError('');

    if (!selectedIndent) {
      setFormError('Please select an Approved Material Indent first.');
      return;
    }

    if (poItems.length === 0) {
      setFormError('No material items found for Purchase Order creation.');
      return;
    }

    // Validate quantities
    const hasOverQty = poItems.some((item) => item.poQty > item.remainingQty);
    if (hasOverQty) {
      setFormError('One or more order quantities exceed the remaining approved indent quantity.');
      return;
    }

    const hasZeroQty = poItems.every((item) => item.poQty <= 0);
    if (hasZeroQty) {
      setFormError('Please enter at least one item order quantity greater than 0.');
      return;
    }

    if (!selectedQuotationId && linkedQuotes.length > 0) {
      setFormError('Please select a received vendor quotation.');
      return;
    }

    if (isNonL1Selected && (!nonL1Reason || !nonL1CommercialNotes)) {
      setFormError('Selecting a non-lowest vendor requires a mandatory Selection Reason and Commercial Justification.');
      return;
    }

    setIsSubmitting(true);

    const poIndex = (state.purchaseOrders || []).length + 1;
    const poNumber = `PO-2026-${String(poIndex).padStart(3, '0')}`;
    const poId = `po-${Date.now()}`;

    const poLines: any[] = poItems.map((item, idx) => ({
      id: `pol-${poId}-${idx + 1}`,
      boqLineId: item.boqLineId,
      productId: item.boqLineId || `prod-${idx + 1}`,
      productCode: `MAT-${idx + 1}`,
      productName: item.materialName,
      unitSymbol: item.unit,
      orderedQty: item.poQty,
      quantity: item.poQty,
      basicRate: item.unitRate,
      rate: item.unitRate,
      taxPercentage: item.taxPercent,
      lineSubtotal: item.lineSubtotal,
      lineTotal: item.lineTotal,
    }));

    const newPO: any = {
      id: poId,
      poNumber,
      documentNumber: poNumber,
      projectId: selectedIndent.projectId,
      projectName: selectedProject?.projectName || selectedIndent.projectName,
      indentId: selectedIndent.id,
      indentNumber: selectedIndent.indentNumber,
      sourceIndentId: selectedIndent.id,
      sourceIndentNumber: selectedIndent.indentNumber,
      rfqId: (selectedQuoteObj as any)?.rfqId || (linkedRFQs[0] ? linkedRFQs[0].id : undefined),
      rfqDocumentNumber: (selectedQuoteObj as any)?.rfqDocumentNumber || (linkedRFQs[0] ? linkedRFQs[0].documentNumber : undefined),
      vendorQuotationId: selectedQuotationId || undefined,
      vendorId: selectedVendorObj.id,
      vendorName: selectedVendorObj.name || (selectedQuoteObj as any)?.vendorName || 'Selected Vendor',
      
      purchaseType: 'rfq',
      originType: 'rfq',
      sourceType: 'RFQ_AWARD',
      status: status,
      poDate,
      orderDate: poDate,
      deliveryDate,
      deliveryDueDate: deliveryDate,
      paymentTerms,
      deliveryInstructions,
      notes: generalNotes,

      // Financials
      basicAmount: itemsSubtotal,
      discountAmount: discount,
      freightAmount: freight,
      taxAmount: totalTaxAmount,
      totalAmount: grandTotal,
      grandTotal,

      isNonL1Award: isNonL1Selected,
      nonL1Justification: isNonL1Selected
        ? `${nonL1Reason}: ${nonL1CommercialNotes}`
        : undefined,

      lines: poLines,
      items: poLines,

      createdAt: new Date().toISOString(),
      createdBy: 'Current User (Procurement)',
      updatedAt: new Date().toISOString(),
    };

    // Save PO to store
    addItem('purchaseOrders', newPO);

    // Update Indent converted quantities and conversion status
    const updatedIndentItems = (selectedIndent.items || (selectedIndent as any).lines || []).map((line: any, idx: number) => {
      const poItemMatch = poItems[idx];
      const currentConv = line.convertedQty || line.orderedQty || 0;
      const addConv = poItemMatch ? poItemMatch.poQty : 0;
      return {
        ...line,
        convertedQty: currentConv + addConv,
        orderedQty: currentConv + addConv,
      };
    });

    const isFullyConverted = updatedIndentItems.every((line: any) => {
      const appQty = line.approvedQty || line.quantity || 0;
      const convQty = line.convertedQty || 0;
      return convQty >= appQty;
    });

    const newIndentStatus = isFullyConverted ? 'converted_to_po' : 'partially_converted';

    updateItem('materialIndents', selectedIndent.id, {
      items: updatedIndentItems,
      lines: updatedIndentItems,
      status: newIndentStatus as any,
      purchaseOrderId: poId,
      updatedAt: new Date().toISOString(),
    } as any);

    // Update RFQ status if applicable
    if ((selectedQuoteObj as any)?.rfqId) {
      updateItem('rfqs', (selectedQuoteObj as any).rfqId, {
        status: 'awarded' as any,
        purchaseOrderId: poId,
        selectedVendorId: selectedVendorObj.id,
        updatedAt: new Date().toISOString(),
      } as any);
    }

    logAudit({
      documentType: 'purchase_order',
      documentId: poId,
      documentNumber: poNumber,
      action: status === 'Issued' ? 'PO_ISSUED' : 'PO_CREATED',
      performedBy: 'Current User',
      newStatus: status,
      details: `Purchase Order ${poNumber} created from Indent ${selectedIndent.indentNumber}. Total Amount: ₹${grandTotal.toLocaleString('en-IN')}`,
    });

    setIsSubmitting(false);
    navigate('/procurement/purchase-orders');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-xs font-sans text-slate-800">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 bg-white p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/procurement/purchase-orders"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#AB9570]/20 text-[#AB9570] rounded-lg">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Create Purchase Order</h1>
            </div>
            <p className="text-[11px] text-slate-500">
              {mode === 'direct'
                ? 'Direct Procurement Route — Create Purchase Order directly without preceding Indent or RFQ.'
                : 'RFQ Award Route — Purchase Order creation auto-filled from Approved Material Indent & Vendor Quotations.'}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('rfq')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mode === 'rfq'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RFQ Award Route
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mode === 'direct'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct PO Route
          </button>
        </div>
      </div>

      {/* RENDER DIRECT PO WORKSPACE WHEN MODE IS DIRECT */}
      {mode === 'direct' ? (
        <DirectPurchaseOrderWorkspace
          projects={projects}
          companyEntities={companyEntities}
          vendors={vendors}
          products={products}
          categories={categories}
          units={units}
          stockLocations={stockLocations}
          purchaseOrders={purchaseOrders}
          onSave={handleDirectPOSave}
          onCancel={() => navigate('/procurement/purchase-orders')}
          addItem={addItem}
        />
      ) : (
        /* RENDER RFQ AWARD ROUTE WORKSPACE WHEN MODE IS RFQ */
        <div className="space-y-6">
          {/* Form Error Banner */}
          {formError && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl font-semibold text-xs flex items-center justify-between animate-in fade-in">
              <span>{formError}</span>
              <button onClick={() => setFormError('')} className="text-rose-500 hover:text-rose-800 font-bold">
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION 1: Select Approved Material Indent or Display Locked Source RFQ Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {lockedFromRFQ && targetRFQ ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-[#AB9570]/20 text-[#AB9570] rounded-md font-mono font-black text-xs">
                      RFQ SOURCE LOCKED
                    </span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {targetRFQ.documentNumber || (targetRFQ as any).rfqNo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLockedFromRFQ(false)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                  >
                    Change Source
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Source Indent</span>
                    <span className="font-mono font-bold text-slate-900">{selectedIndent?.indentNumber || targetRFQ.sourceIndentNumber || 'IND-2026-001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Project</span>
                    <span className="font-bold text-slate-900">{selectedProject?.projectName || targetRFQ.projectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Received Quotations</span>
                    <span className="font-mono font-bold text-emerald-700">{linkedQuotes.length} Quotes Available</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Status</span>
                    <span className="font-bold text-slate-800 uppercase">{targetRFQ.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <ApprovedIndentSelect
                indents={indents}
                projects={projects}
                selectedIndentId={selectedIndentId}
                onSelectIndent={(ind) => setSelectedIndentId(ind.id)}
              />
            )}
          </div>

          {/* SECTION 2: Auto-Filled Read-Only Project & Indent Details */}
          {selectedIndent && (
            <PurchaseOrderSourceSummary indent={selectedIndent} project={selectedProject} />
          )}

          {/* SECTION 3: Vendor Quotation Selection */}
          {selectedIndent && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <VendorQuotationCards
                rfqs={linkedRFQs}
                vendorQuotations={linkedQuotes}
                selectedQuotationId={selectedQuotationId}
                onSelectQuotation={(q) => setSelectedQuotationId(q.id)}
                onToggleComparison={() => setIsComparisonOpen(!isComparisonOpen)}
                isComparisonOpen={isComparisonOpen}
              />

              {/* Inline Detailed Comparison Matrix */}
              {isComparisonOpen && linkedQuotes.length > 0 && (
                <VendorComparisonPanel
                  quotations={linkedQuotes}
                  selectedQuotationId={selectedQuotationId}
                  onSelectQuotation={(q) => setSelectedQuotationId(q.id)}
                />
              )}

              {/* Non-L1 Vendor Justification */}
              {isNonL1Selected && (
                <VendorSelectionJustification
                  reason={nonL1Reason}
                  onReasonChange={setNonL1Reason}
                  commercialNotes={nonL1CommercialNotes}
                  onCommercialNotesChange={setNonL1CommercialNotes}
                  technicalNotes={nonL1TechnicalNotes}
                  onTechnicalNotesChange={setNonL1TechnicalNotes}
                  selectedVendorName={selectedVendorObj.name}
                />
              )}
            </div>
          )}

          {/* SECTION 4: Line Items Table & Partial Quantity Controls */}
          {selectedIndent && poItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <PurchaseOrderItemsTable
                items={poItems}
                onItemQtyChange={handleItemQtyChange}
                onItemRateChange={handleItemRateChange}
                isDirectPO={false}
              />
            </div>
          )}

          {/* SECTION 5: Commercial Summary & Approval Action Buttons */}
          {selectedIndent && (
            <PurchaseOrderCommercialSummary
              subtotal={itemsSubtotal}
              discount={discount}
              onDiscountChange={setDiscount}
              freight={freight}
              onFreightChange={setFreight}
              taxAmount={totalTaxAmount}
              grandTotal={grandTotal}
              poDate={poDate}
              onPoDateChange={setPoDate}
              deliveryDate={deliveryDate}
              onDeliveryDateChange={setDeliveryDate}
              paymentTerms={paymentTerms}
              onPaymentTermsChange={setPaymentTerms}
              deliveryInstructions={deliveryInstructions}
              onDeliveryInstructionsChange={setDeliveryInstructions}
              generalNotes={generalNotes}
              onGeneralNotesChange={setGeneralNotes}
              isDirectPO={false}
              onSaveDraft={() => handleProcessRFQPOMode('Draft')}
              onSubmitApproval={() => handleProcessRFQPOMode('Pending Approval')}
              onIssuePO={() => handleProcessRFQPOMode('Issued')}
              onCancel={() => navigate('/procurement/purchase-orders')}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}
    </div>
  );
};
