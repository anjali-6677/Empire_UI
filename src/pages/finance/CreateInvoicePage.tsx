import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import {
  DirectInvoice,
  InvoiceLineItem,
  InvoiceAdditionalCharge,
  InvoiceAttachment,
  InvoiceDirection,
  InvoiceType,
} from '../../domain/types';
import { PageHeader } from '../../components/common/PageHeader';
import { formatIndianCurrency } from '../../utils/format';
import {
  Plus,
  Trash2,
  Save,
  Send,
  ArrowLeft,
  FileText,
  DollarSign,
  Paperclip,
  ShieldAlert,
  CreditCard,
} from 'lucide-react';

export const CreateInvoicePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { state, addItem, updateItem } = useERPStore();

  const isEditing = Boolean(id);
  const existingInvoice = isEditing ? (state.directInvoices || []).find((inv) => inv.id === id) : null;

  // Form Field States
  const [direction, setDirection] = useState<InvoiceDirection>(existingInvoice?.direction || 'Payable');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(
    existingInvoice?.invoiceType || 'Vendor Invoice'
  );
  const [projectId, setProjectId] = useState<string>(existingInvoice?.projectId || '');
  const [legalEntity, setLegalEntity] = useState<string>(
    existingInvoice?.legalEntity || 'Flutebyte Technologies Pvt. Ltd.'
  );
  const [partyType, setPartyType] = useState<'Vendor' | 'Subcontractor' | 'Client' | 'Other Payee' | 'Other Customer'>(
    existingInvoice?.partyType || 'Vendor'
  );
  const [partyId, setPartyId] = useState<string>(existingInvoice?.partyId || '');
  const [partyName, setPartyName] = useState<string>(existingInvoice?.partyName || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    existingInvoice?.invoiceNumber || `INV/2026/${Math.floor(100 + Math.random() * 900)}`
  );
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState<string>(
    existingInvoice?.supplierInvoiceNumber || ''
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    existingInvoice?.invoiceDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    existingInvoice?.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [referenceType, setReferenceType] = useState<'Direct' | 'Purchase Order' | 'GRN' | 'Work Order' | 'Other'>(
    existingInvoice?.referenceType || 'Direct'
  );
  const [referenceNumber, setReferenceNumber] = useState<string>(existingInvoice?.referenceNumber || '');
  const [paymentTerms, setPaymentTerms] = useState<string>(existingInvoice?.paymentTerms || '15 Days Net');
  const [notes, setNotes] = useState<string>(existingInvoice?.notes || '');

  // Embedded Collections
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    existingInvoice?.lineItems || [
      {
        id: `li-${Date.now()}`,
        description: '',
        category: '',
        qty: 1,
        unit: 'Job',
        rate: 0,
        discount: 0,
        taxPercent: 18,
        taxAmount: 0,
        lineTotal: 0,
      },
    ]
  );

  const [additionalCharges, setAdditionalCharges] = useState<InvoiceAdditionalCharge[]>(
    existingInvoice?.additionalCharges || []
  );

  const [attachments, setAttachments] = useState<InvoiceAttachment[]>(
    existingInvoice?.attachments || []
  );

  // New Attachment Inputs
  const [newAttTitle, setNewAttTitle] = useState('');
  const [newAttFileName, setNewAttFileName] = useState('');

  // Duplicate Check Banner State
  const [duplicateError, setDuplicateError] = useState<string>('');

  // Synchronize direction changes with default types & party types
  useEffect(() => {
    if (!isEditing) {
      if (direction === 'Payable') {
        setInvoiceType('Vendor Invoice');
        setPartyType('Vendor');
      } else {
        setInvoiceType('Client Invoice');
        setPartyType('Client');
      }
    }
  }, [direction, isEditing]);

  // Handle party select dropdown change
  const handlePartySelect = (selectedId: string) => {
    setPartyId(selectedId);
    if (direction === 'Payable') {
      const vendor = (state.vendors || []).find((v) => v.id === selectedId);
      if (vendor) {
        setPartyName(vendor.name);
      } else {
        const sub = (state.subcontractors || []).find((s) => s.id === selectedId);
        if (sub) setPartyName(sub.name);
      }
    } else {
      const client = (state.clients || []).find((c) => c.id === selectedId);
      if (client) setPartyName(client.name);
    }
  };

  // Duplicate Check Validation Rule (Requirement 9)
  useEffect(() => {
    setDuplicateError('');
    if (!referenceNumber.trim()) return;

    const refUpper = referenceNumber.trim().toUpperCase();

    if (referenceType === 'GRN') {
      // Check if GRN exists in Vendor APs
      const existingAP = (state.vendorAPs || []).find(
        (ap) => ap.grnNumber.toUpperCase() === refUpper
      );
      if (existingAP) {
        setDuplicateError(
          `Duplicate Blocked: GRN "${referenceNumber}" already has an associated Vendor AP (${existingAP.apNumber}). A manual invoice cannot duplicate automated GRN procurement.`
        );
        return;
      }

      // Check if GRN exists in existing Direct Invoices
      const existingInv = (state.directInvoices || []).find(
        (inv) => inv.id !== id && (inv.referenceNumber || '').toUpperCase() === refUpper
      );
      if (existingInv) {
        setDuplicateError(
          `Duplicate Blocked: GRN "${referenceNumber}" is already linked to Invoice #${existingInv.invoiceNumber}.`
        );
        return;
      }
    }

    if (referenceType === 'Work Order') {
      // Check if Work Order / Subcontractor Bill already exists
      const existingBill = (state.subcontractorBills || []).find(
        (b) => (b.billNumber || '').toUpperCase() === refUpper
      );
      if (existingBill) {
        setDuplicateError(
          `Duplicate Blocked: Work Order / Certified WIP "${referenceNumber}" is already linked to Subcontractor Bill ${existingBill.billNumber}.`
        );
        return;
      }
    }
  }, [referenceType, referenceNumber, state.vendorAPs, state.directInvoices, state.subcontractorBills, id]);

  // Line Item Handlers
  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    const taxPercent = Number(item.taxPercent) || 0;

    const baseAmount = Math.max(0, qty * rate - discount);
    const taxAmount = (baseAmount * taxPercent) / 100;
    const lineTotal = baseAmount + taxAmount;

    item.taxAmount = taxAmount;
    item.lineTotal = lineTotal;

    updated[index] = item;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `li-${Date.now()}-${Math.random()}`,
        description: '',
        category: '',
        qty: 1,
        unit: 'Nos',
        rate: 0,
        discount: 0,
        taxPercent: 18,
        taxAmount: 0,
        lineTotal: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Additional Charges Handlers
  const handleChargeChange = (index: number, field: keyof InvoiceAdditionalCharge, value: any) => {
    const updated = [...additionalCharges];
    const chg = { ...updated[index], [field]: value };

    const amount = Number(chg.amount) || 0;
    const taxPercent = Number(chg.taxPercent) || 0;
    const taxAmount = (amount * taxPercent) / 100;

    chg.taxAmount = taxAmount;
    chg.total = amount + taxAmount;

    updated[index] = chg;
    setAdditionalCharges(updated);
  };

  const addCharge = () => {
    setAdditionalCharges([
      ...additionalCharges,
      {
        id: `chg-${Date.now()}`,
        description: 'Freight & Transportation',
        amount: 0,
        taxPercent: 18,
        taxAmount: 0,
        total: 0,
      },
    ]);
  };

  const removeCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
  };

  // Attachment Handler
  const addAttachment = () => {
    if (!newAttTitle.trim() || !newAttFileName.trim()) return;
    setAttachments([
      ...attachments,
      {
        id: `att-${Date.now()}`,
        documentTitle: newAttTitle.trim(),
        fileName: newAttFileName.trim(),
        fileType: 'pdf',
        uploadDate: new Date().toISOString().split('T')[0],
      },
    ]);
    setNewAttTitle('');
    setNewAttFileName('');
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Financial Summary Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.rate)), 0);
  const discountTotal = lineItems.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const additionalChargesTotal = additionalCharges.reduce((sum, chg) => sum + Number(chg.amount || 0), 0);
  const taxTotal =
    lineItems.reduce((sum, item) => sum + item.taxAmount, 0) +
    additionalCharges.reduce((sum, chg) => sum + chg.taxAmount, 0);

  const rawGrandTotal = subtotal - discountTotal + additionalChargesTotal + taxTotal;
  const finalInvoiceValue = Math.round(rawGrandTotal);
  const roundOff = finalInvoiceValue - rawGrandTotal;

  // Form Submit Handler
  const handleSave = (targetStatus: 'Draft' | 'Pending Approval') => {
    if (duplicateError) {
      alert('Cannot save invoice: Duplicate control validation failed. Please clear the duplicate reference.');
      return;
    }

    if (!partyName.trim()) {
      alert('Please enter or select a Party Name.');
      return;
    }

    if (lineItems.length === 0 || !lineItems[0].description.trim()) {
      alert('Please add at least one line item with a description.');
      return;
    }

    const selectedProj = (state.projects || []).find((p) => p.id === projectId);

    const invoicePayload: DirectInvoice = {
      id: isEditing ? existingInvoice!.id : `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      supplierInvoiceNumber: supplierInvoiceNumber.trim() || undefined,
      direction,
      invoiceType,
      projectId: projectId || undefined,
      projectName: selectedProj ? selectedProj.projectName : undefined,
      legalEntity,
      partyType,
      partyId: partyId || undefined,
      partyName: partyName.trim(),
      invoiceDate,
      dueDate,
      referenceType,
      referenceNumber: referenceNumber.trim() || undefined,
      paymentTerms,
      notes: notes.trim() || undefined,

      subtotal,
      discountTotal,
      additionalChargesTotal,
      taxTotal,
      grandTotal: rawGrandTotal,
      roundOff,
      finalInvoiceValue,

      paidAmount: existingInvoice ? existingInvoice.paidAmount : 0,
      outstandingAmount: existingInvoice ? existingInvoice.outstandingAmount : finalInvoiceValue,

      invoiceStatus: targetStatus,
      paymentStatus: existingInvoice ? existingInvoice.paymentStatus : 'Not Started',

      lineItems,
      additionalCharges,
      attachments,
      paymentHistory: existingInvoice ? existingInvoice.paymentHistory : [],

      createdAt: existingInvoice ? existingInvoice.createdAt : new Date().toISOString(),
      createdBy: existingInvoice ? existingInvoice.createdBy : 'Finance Executive',
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      updateItem('directInvoices', invoicePayload.id, invoicePayload);
    } else {
      addItem('directInvoices', invoicePayload);
    }

    navigate('/finance/invoices');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={isEditing ? `Edit Invoice (${existingInvoice?.invoiceNumber})` : 'Create Invoice'}
        subtitle="Manual invoice entry for direct vendor purchases, services, consultants and non-RA client invoices."
        breadcrumbs={[
          { label: 'Finance, Billing & Payments' },
          { label: 'Invoices', href: '/finance/invoices' },
          { label: isEditing ? 'Edit Invoice' : 'Create Invoice' },
        ]}
        actions={
          <button
            onClick={() => navigate('/finance/invoices')}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Register
          </button>
        }
      />

      {/* Duplicate Alert Banner */}
      {duplicateError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-3 shadow-sm text-rose-900 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-sm block">Duplicate Check Restriction</span>
            <p>{duplicateError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form Sections (Left 8-cols) & Summary Card (Right 4-cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: INVOICE INFORMATION */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" /> Section 1: Invoice Information
            </h3>

            {/* Direction Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Invoice Direction *</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <input
                    type="radio"
                    name="direction"
                    value="Payable"
                    checked={direction === 'Payable'}
                    onChange={() => setDirection('Payable')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Payable (Vendor / Expense Invoice)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <input
                    type="radio"
                    name="direction"
                    value="Receivable"
                    checked={direction === 'Receivable'}
                    onChange={() => setDirection('Receivable')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Receivable (Client Invoice)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice Type *</label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {direction === 'Payable' ? (
                    <>
                      <option value="Vendor Invoice">Vendor Invoice</option>
                      <option value="Service Invoice">Service Invoice</option>
                      <option value="Consultant Invoice">Consultant Invoice</option>
                      <option value="Other Expense Invoice">Other Expense Invoice</option>
                    </>
                  ) : (
                    <>
                      <option value="Client Invoice">Client Invoice</option>
                      <option value="Other Receivable Invoice">Other Receivable Invoice</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Project / Site Location</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">General Enterprise / No Specific Project</option>
                  {(state.projects || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Party / Vendor / Client Name *</label>
                {direction === 'Payable' ? (
                  <select
                    value={partyId}
                    onChange={(e) => handlePartySelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Select Vendor / Payee...</option>
                    {(state.vendors || []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={partyId}
                    onChange={(e) => handlePartySelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Select Client / Party...</option>
                    {(state.clients || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                {!partyId && (
                  <input
                    type="text"
                    placeholder="Or type custom Party / Vendor name..."
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Legal Entity *</label>
                <input
                  type="text"
                  value={legalEntity}
                  onChange={(e) => setLegalEntity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Invoice # *</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Party Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. ETP/INV/7781"
                  value={supplierInvoiceNumber}
                  onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reference Type</label>
                <select
                  value={referenceType}
                  onChange={(e) => setReferenceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Direct">Direct Invoice (No Link)</option>
                  <option value="Purchase Order">Purchase Order</option>
                  <option value="GRN">GRN (Goods Receipt Note)</option>
                  <option value="Work Order">Work Order / Subcontractor WIP</option>
                  <option value="Other">Other Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. GRN/2026/001 or PO/2026/102"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Immediate">Immediate / Advance</option>
                  <option value="7 Days Credit">7 Days Credit</option>
                  <option value="15 Days Net">15 Days Net</option>
                  <option value="30 Days Net">30 Days Net</option>
                  <option value="45 Days Net">45 Days Net</option>
                  <option value="60 Days Net">60 Days Net</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice Notes / Instructions</label>
              <textarea
                rows={2}
                placeholder="Enter scope details, tax notes, or special financial conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: LINE ITEMS */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Section 2: Line Items ({lineItems.length})
              </h3>
              <button
                type="button"
                onClick={addLineItem}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-200">
                    <th className="py-2.5 px-2 w-8">#</th>
                    <th className="py-2.5 px-2">Description *</th>
                    <th className="py-2.5 px-2 w-28">Category</th>
                    <th className="py-2.5 px-2 w-20 text-right">Qty *</th>
                    <th className="py-2.5 px-2 w-20 text-center">Unit</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹) *</th>
                    <th className="py-2.5 px-2 w-20 text-right">Disc (₹)</th>
                    <th className="py-2.5 px-2 w-20 text-center">Tax %</th>
                    <th className="py-2.5 px-2 w-24 text-right">Line Total</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="py-2 px-2 text-gray-400 font-semibold">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          required
                          placeholder="Line item description..."
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder="Category"
                          value={item.category || ''}
                          onChange={(e) => handleLineItemChange(idx, 'category', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={item.qty}
                          onChange={(e) => handleLineItemChange(idx, 'qty', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-right font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        >
                          <option value="Job">Job</option>
                          <option value="Nos">Nos</option>
                          <option value="sqft">sqft</option>
                          <option value="ltr">ltr</option>
                          <option value="rmt">rmt</option>
                          <option value="Lump Sum">Lump Sum</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-right font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.discount}
                          onChange={(e) => handleLineItemChange(idx, 'discount', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-right focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={item.taxPercent}
                          onChange={(e) => handleLineItemChange(idx, 'taxPercent', Number(e.target.value))}
                          className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs text-center focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-gray-900">
                        {formatIndianCurrency(item.lineTotal)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: ADDITIONAL CHARGES */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" /> Section 3: Additional Charges & Adjustments
              </h3>
              <button
                type="button"
                onClick={addCharge}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Charge
              </button>
            </div>

            {additionalCharges.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-500">
                No additional freight, packing or service charges added.
              </div>
            ) : (
              <div className="space-y-2">
                {additionalCharges.map((chg, idx) => (
                  <div key={chg.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs">
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        placeholder="Charge description (e.g. Freight, Handling)..."
                        value={chg.description}
                        onChange={(e) => handleChargeChange(idx, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount (₹)"
                        value={chg.amount}
                        onChange={(e) => handleChargeChange(idx, 'amount', Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-semibold text-right focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <select
                        value={chg.taxPercent}
                        onChange={(e) => handleChargeChange(idx, 'taxPercent', Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-center focus:outline-none"
                      >
                        <option value={0}>0% Tax</option>
                        <option value={5}>5% Tax</option>
                        <option value={18}>18% Tax</option>
                      </select>
                    </div>
                    <div className="md:col-span-1 text-right font-bold text-gray-900">
                      {formatIndianCurrency(chg.total)}
                    </div>
                    <div className="md:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeCharge(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: ATTACHMENTS */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-amber-600" /> Section 4: Document Attachments
            </h3>

            <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Document Title (e.g. Vendor Original Bill)..."
                value={newAttTitle}
                onChange={(e) => setNewAttTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Filename (e.g. INV_991.pdf)..."
                value={newAttFileName}
                onChange={(e) => setNewAttFileName(e.target.value)}
                className="w-48 px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={addAttachment}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shrink-0"
              >
                Attach File
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <div key={att.id} className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="font-bold text-gray-900 block">{att.documentTitle}</span>
                        <span className="text-[11px] text-gray-400">{att.fileName}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: STICKY INVOICE SUMMARY PANEL (Right 4-cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6 space-y-5">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" /> Financial Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Base Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatIndianCurrency(subtotal)}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Total Discount:</span>
                  <span className="font-semibold">-{formatIndianCurrency(discountTotal)}</span>
                </div>
              )}

              {additionalChargesTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Additional Charges:</span>
                  <span className="font-semibold text-gray-900">{formatIndianCurrency(additionalChargesTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Total GST / Tax:</span>
                <span className="font-semibold text-gray-900">{formatIndianCurrency(taxTotal)}</span>
              </div>

              {roundOff !== 0 && (
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Round Off:</span>
                  <span>{roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-amber-200 bg-amber-50/70 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block uppercase">Final Invoice Value</span>
                  <span className="text-[11px] text-amber-700">{direction} Net Amount</span>
                </div>
                <div className="text-xl font-extrabold text-amber-900">
                  {formatIndianCurrency(finalInvoiceValue)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                type="button"
                disabled={Boolean(duplicateError)}
                onClick={() => handleSave('Pending Approval')}
                className={`w-full py-2.5 px-4 text-xs font-bold text-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 ${
                  duplicateError
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <Send className="w-4 h-4" /> Submit for Approval
              </button>

              <button
                type="button"
                disabled={Boolean(duplicateError)}
                onClick={() => handleSave('Draft')}
                className={`w-full py-2 px-4 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${
                  duplicateError ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-4 h-4 text-gray-500" /> Save as Draft
              </button>

              <button
                type="button"
                onClick={() => navigate('/finance/invoices')}
                className="w-full py-2 px-4 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
