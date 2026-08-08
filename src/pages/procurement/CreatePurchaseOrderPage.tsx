import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { ApprovedIndentSelect } from '../../components/procurement/ApprovedIndentSelect';
import { PurchaseOrderSourceSummary } from '../../components/procurement/PurchaseOrderSourceSummary';
import { VendorQuotationCards } from '../../components/procurement/VendorQuotationCards';
import { VendorComparisonPanel } from '../../components/procurement/VendorComparisonPanel';
import { VendorSelectionJustification } from '../../components/procurement/VendorSelectionJustification';
import { PurchaseOrderItemsTable, POItemRow } from '../../components/procurement/PurchaseOrderItemsTable';
import { PurchaseOrderCommercialSummary } from '../../components/procurement/PurchaseOrderCommercialSummary';


export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfqParamId = searchParams.get('rfqId');
  const indentParamId = searchParams.get('indentId');

  const { state, addItem, updateItem, logAudit } = useERPStore();

  const indents = state.materialIndents || [];
  const projects = state.projects || [];
  const rfqs = state.rfqs || [];
  const vendorQuotations = state.vendorQuotations || [];
  const vendors = state.vendors || [];

  // Determine initial selected indent
  const initialIndentId =
    indentParamId ||
    (rfqParamId ? rfqs.find((r) => r.id === rfqParamId)?.indentId : '') ||
    indents.find((i) => i.status === 'approved' || i.status === 'Approved')?.id ||
    '';

  const [selectedIndentId, setSelectedIndentId] = useState<string>(initialIndentId);
  const selectedIndent = indents.find((i) => i.id === selectedIndentId);
  const selectedProject = selectedIndent ? projects.find((p) => p.id === selectedIndent.projectId) : null;

  // Determine mode (RFQ route vs Direct PO route)
  const isIndentDirectPO = Boolean((selectedIndent as any)?.purchaseType === 'direct_po' || (selectedIndent as any)?.isDirectPO || indentParamId);
  const [mode, setMode] = useState<'rfq' | 'direct'>(isIndentDirectPO ? 'direct' : 'rfq');

  useEffect(() => {
    if (selectedIndent) {
      if ((selectedIndent as any)?.purchaseType === 'direct_po' || (selectedIndent as any)?.isDirectPO) {
        setMode('direct');
      }
    }
  }, [selectedIndent]);

  // RFQ selection logic
  const linkedRFQs = selectedIndent ? rfqs.filter((r) => r.indentId === selectedIndent.id) : [];
  const linkedQuotes = vendorQuotations.filter((q) => linkedRFQs.some((r) => r.id === q.rfqId));

  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Non-L1 Justification state
  const [nonL1Reason, setNonL1Reason] = useState<string>('');
  const [nonL1CommercialNotes, setNonL1CommercialNotes] = useState<string>('');
  const [nonL1TechnicalNotes, setNonL1TechnicalNotes] = useState<string>('');

  // Direct PO Vendor & Reason state
  const [directVendorId, setDirectVendorId] = useState<string>(vendors[0]?.id || '');
  const [directPOReason, setDirectPOReason] = useState<string>('');

  // Line items state
  const [poItems, setPoItems] = useState<POItemRow[]>([]);

  // Commercial & Terms state
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

  // Auto-select lowest vendor quote when linked quotes load
  useEffect(() => {
    if (linkedQuotes.length > 0 && !selectedQuotationId) {
      const sorted = [...linkedQuotes].sort((a, b) => ((a as any).landedAmount || (a as any).totalAmount || 0) - ((b as any).landedAmount || (b as any).totalAmount || 0));
      setSelectedQuotationId(sorted[0].id);
    }
  }, [linkedQuotes, selectedQuotationId]);

  // Sync PO line items whenever selected indent or quotation changes
  useEffect(() => {
    if (!selectedIndent) {
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
      if (mode === 'rfq' && selQuote) {
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

  // Financial Calculations
  const itemsSubtotal = poItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const totalTaxAmount = poItems.reduce((sum, item) => sum + item.lineTaxAmount, 0);
  const grandTotal = Math.max(0, itemsSubtotal - discount + freight + totalTaxAmount);

  // Vendor resolution
  const selectedQuoteObj = vendorQuotations.find((q) => q.id === selectedQuotationId);
  const selectedVendorObj: any = mode === 'rfq'
    ? vendors.find((v) => v.id === (selectedQuoteObj as any)?.vendorId) || { id: `v-${Date.now()}`, name: (selectedQuoteObj as any)?.vendorName || 'Vendor' }
    : vendors.find((v) => v.id === directVendorId) || { id: directVendorId || `v-${Date.now()}`, name: 'Direct Vendor' };

  // Check if non-L1 selected
  let isNonL1Selected = false;
  if (mode === 'rfq' && linkedQuotes.length > 1 && selectedQuotationId) {
    const sorted = [...linkedQuotes].sort((a, b) => ((a as any).landedAmount || 0) - ((b as any).landedAmount || 0));
    if (sorted[0]?.id !== selectedQuotationId) {
      isNonL1Selected = true;
    }
  }

  // Handle PO Submission
  const handleProcessPO = (status: 'Draft' | 'Pending Approval' | 'Issued') => {
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

    if (mode === 'rfq' && !selectedQuotationId && linkedQuotes.length > 0) {
      setFormError('Please select a received vendor quotation.');
      return;
    }

    if (mode === 'rfq' && isNonL1Selected && (!nonL1Reason || !nonL1CommercialNotes)) {
      setFormError('Selecting a non-lowest vendor requires a mandatory Selection Reason and Commercial Justification.');
      return;
    }

    if (mode === 'direct' && !directPOReason) {
      setFormError('Mandatory Direct Purchase Order reason is required.');
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
      projectId: selectedIndent.projectId,
      projectName: selectedProject?.projectName || selectedIndent.projectName,
      indentId: selectedIndent.id,
      indentNumber: selectedIndent.indentNumber,
      rfqId: (selectedQuoteObj as any)?.rfqId || (linkedRFQs[0] ? linkedRFQs[0].id : undefined),
      vendorQuotationId: selectedQuotationId || undefined,
      vendorId: selectedVendorObj.id,
      vendorName: selectedVendorObj.name || (selectedQuoteObj as any)?.vendorName || 'Selected Vendor',
      
      purchaseType: mode,
      status: status,
      poDate,
      deliveryDate,
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

      directPOReason: mode === 'direct' ? directPOReason : undefined,

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
              Single-page PO workspace auto-filled from Approved Material Indent & Vendor Quotations.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('rfq')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
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
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              mode === 'direct'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct PO Route
          </button>
        </div>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl font-semibold text-xs flex items-center justify-between animate-in fade-in">
          <span>{formError}</span>
          <button onClick={() => setFormError('')} className="text-rose-500 hover:text-rose-800 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: Select Approved Material Indent (Primary First Field) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <ApprovedIndentSelect
          indents={indents}
          projects={projects}
          selectedIndentId={selectedIndentId}
          onSelectIndent={(ind) => setSelectedIndentId(ind.id)}
        />
      </div>

      {/* SECTION 2: Auto-Filled Read-Only Project & Indent Details */}
      {selectedIndent && (
        <PurchaseOrderSourceSummary indent={selectedIndent} project={selectedProject} />
      )}

      {/* SECTION 3: Vendor Quotation Selection / Direct PO Vendor Setup */}
      {selectedIndent && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          {mode === 'rfq' ? (
            <>
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
            </>
          ) : (
            /* Direct PO Mode Vendor Selector */
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600" /> Direct Purchase Order Vendor Setup
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Select Vendor Master <span className="text-rose-500">*</span></label>
                  <select
                    value={directVendorId}
                    onChange={(e) => setDirectVendorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-[#AB9570]"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.vendorCode || 'V-CODE'}) - {v.city || 'India'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
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
            isDirectPO={mode === 'direct'}
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
          isDirectPO={mode === 'direct'}
          directPOReason={directPOReason}
          onDirectPOReasonChange={setDirectPOReason}
          onSaveDraft={() => handleProcessPO('Draft')}
          onSubmitApproval={() => handleProcessPO('Pending Approval')}
          onIssuePO={() => handleProcessPO('Issued')}
          onCancel={() => navigate('/procurement/purchase-orders')}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
