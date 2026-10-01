/**
 * Direct Purchase Order Workspace Component
 * Location: src/components/procurement/DirectPurchaseOrderWorkspace.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  UserCheck,
  FileText,
  Truck,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  Send,
  CheckCircle,
  X,
  CreditCard,
  AlertCircle,
  Package,
  Tag,
} from 'lucide-react';
import { generatePONumber } from '../../domain/documentNumbers';
import { formatIndianCurrency } from '../../utils/format';

export interface DirectPOLine {
  id: string;
  productId: string;
  productCode: string;
  materialName: string;
  categoryId: string;
  categoryName: string;
  unitSymbol: string;
  quantity: number;
  unitRate: number;
  discountPercentage: number;
  taxPercentage: number;
  specifications: string;
  isCustom?: boolean;
}

export interface DirectPOCharge {
  id: string;
  chargeType: string;
  description: string;
  amount: number;
  taxPercentage: number;
}

interface DirectPurchaseOrderWorkspaceProps {
  projects: any[];
  companyEntities: any[];
  vendors: any[];
  products: any[];
  categories: any[];
  units: any[];
  stockLocations: any[];
  purchaseOrders: any[];
  onSave: (poPayload: any, targetStatus: 'draft' | 'pending_approval' | 'issued') => void;
  onCancel: () => void;
  addItem: (collectionKey: any, item: any) => void;
}

export const DirectPurchaseOrderWorkspace: React.FC<DirectPurchaseOrderWorkspaceProps> = ({
  projects = [],
  companyEntities = [],
  vendors = [],
  products = [],
  categories = [],
  units = [],
  stockLocations = [],
  purchaseOrders = [],
  onSave,
  onCancel,
  addItem,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // Primary Selection States
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [companyEntityId, setCompanyEntityId] = useState<string>(
    companyEntities[0]?.id || 'comp-1'
  );
  const [vendorId, setVendorId] = useState<string>(vendors[0]?.id || '');
  const [poDate, setPoDate] = useState<string>(todayStr);
  const [deliveryDueDate, setDeliveryDueDate] = useState<string>(nextWeekStr);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days');
  const [vendorReference, setVendorReference] = useState<string>('');
  const [currency] = useState<string>('INR (₹)');

  // Selected Objects
  const selectedProject = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const selectedVendor = useMemo(() => vendors.find((v) => v.id === vendorId), [vendors, vendorId]);
  const selectedCompany = useMemo(
    () => companyEntities.find((c) => c.id === companyEntityId) || companyEntities[0] || {
      legalName: 'Flutebyte Technologies Pvt. Ltd.',
      gstin: '27AAACF1234H1Z8',
      registeredAddress: '1001, Flutebyte Tower, BKC, Mumbai',
      primaryEmail: 'procurement@flutebyte.com',
    },
    [companyEntities, companyEntityId]
  );

  // Auto-populate delivery address and payment terms when project/vendor changes
  useEffect(() => {
    if (selectedProject && !deliveryLocation) {
      const siteAddr = selectedProject.siteLocation || selectedProject.siteAddress || selectedProject.location || `${selectedProject.projectName} Project Site`;
      setDeliveryLocation(`${selectedProject.projectName} Site Store - ${siteAddr}`);
    }
  }, [selectedProject, deliveryLocation]);

  useEffect(() => {
    if (selectedVendor) {
      if (selectedVendor.paymentTermsDays) {
        setPaymentTerms(`Net ${selectedVendor.paymentTermsDays} Days`);
      } else if (selectedVendor.paymentTerms) {
        setPaymentTerms(selectedVendor.paymentTerms);
      }
    }
  }, [selectedVendor]);

  // Line Items State
  const [lines, setLines] = useState<DirectPOLine[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<DirectPOCharge[]>([]);

  // Initialize with 1 default line item from master if available
  useEffect(() => {
    if (lines.length === 0 && products.length > 0) {
      const p = products[0];
      const cat = categories.find((c) => c.id === p.categoryId);
      setLines([
        {
          id: `line-${Date.now()}-1`,
          productId: p.id,
          productCode: p.code || p.id,
          materialName: p.name,
          categoryId: p.categoryId || 'cat-1',
          categoryName: cat?.name || 'Wooden Joinery',
          unitSymbol: p.unitSymbol || p.unit || 'sqft',
          quantity: 100,
          unitRate: p.basePrice || p.lastPurchaseRate || 150,
          discountPercentage: 0,
          taxPercentage: 18,
          specifications: 'Standard Commercial Grade',
        },
      ]);
    }
  }, [products, categories, lines.length]);

  // Commercial Details & Justification
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(
    'Deliver directly to project site gate during working hours (9 AM - 6 PM).'
  );
  const [termsAndConditions, setTermsAndConditions] = useState<string>(
    '1. Material must strictly conform to technical specifications.\n2. Delivery must be completed on or before delivery due date.\n3. Damaged goods will be rejected at supplier cost.\n4. Mention PO number on invoice & Delivery Challan.\n5. Payment subject to accepted GRN & agreed payment terms.'
  );
  const [directPOReason, setDirectPOReason] = useState<string>('Emergency Purchase');
  const [justification, setJustification] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Custom Item Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customCategoryId, setCustomCategoryId] = useState<string>(categories[0]?.id || 'cat-1');
  const [customUnitSymbol, setCustomUnitSymbol] = useState<string>('sqft');
  const [customShortCode, setCustomShortCode] = useState<string>('MAT');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customSpecification, setCustomSpecification] = useState<string>('');
  const [customRate, setCustomRate] = useState<number>(0);
  const [saveToMaster, setSaveToMaster] = useState<boolean>(false);

  // Computed Auto-Generated PO Number
  const autoPONumber = useMemo(() => {
    const firstLine = lines[0];
    const catInput = categories.find((c) => c.id === firstLine?.categoryId) || firstLine?.categoryName || 'WJM';
    const prodInput = products.find((p) => p.id === firstLine?.productId) || firstLine?.materialName || 'PLY';
    return generatePONumber(purchaseOrders, catInput, prodInput, poDate);
  }, [purchaseOrders, lines, categories, products, poDate]);

  // Financial Calculations
  const lineTotals = useMemo(() => {
    let materialBasic = 0;
    let materialDiscount = 0;
    let materialTaxable = 0;
    let materialTax = 0;

    lines.forEach((l) => {
      const qty = Number(l.quantity || 0);
      const rate = Number(l.unitRate || 0);
      const discPct = Number(l.discountPercentage || 0);
      const taxPct = Number(l.taxPercentage || 0);

      const basic = qty * rate;
      const discAmt = basic * (discPct / 100);
      const taxable = Math.max(0, basic - discAmt);
      const taxAmt = taxable * (taxPct / 100);

      materialBasic += basic;
      materialDiscount += discAmt;
      materialTaxable += taxable;
      materialTax += taxAmt;
    });

    let chargesSubtotal = 0;
    let chargesTax = 0;

    additionalCharges.forEach((c) => {
      const amt = Number(c.amount || 0);
      const taxPct = Number(c.taxPercentage || 0);
      const taxAmt = amt * (taxPct / 100);

      chargesSubtotal += amt;
      chargesTax += taxAmt;
    });

    const totalTaxable = materialTaxable + chargesSubtotal;
    const totalTax = materialTax + chargesTax;
    const grossTotal = totalTaxable + totalTax;
    const grandTotal = Math.round(grossTotal);
    const roundOff = Number((grandTotal - grossTotal).toFixed(2));

    return {
      materialBasic,
      materialDiscount,
      materialTaxable,
      materialTax,
      chargesSubtotal,
      chargesTax,
      totalTaxable,
      totalTax,
      roundOff,
      grandTotal,
    };
  }, [lines, additionalCharges]);

  // Handlers for Line Items
  const handleAddLineFromMaster = () => {
    const defaultProd = products[0];
    const cat = categories.find((c) => c.id === defaultProd?.categoryId);
    const newLine: DirectPOLine = {
      id: `line-${Date.now()}-${lines.length + 1}`,
      productId: defaultProd?.id || `prod-${Date.now()}`,
      productCode: defaultProd?.code || 'MAT',
      materialName: defaultProd?.name || 'Material Item',
      categoryId: defaultProd?.categoryId || 'cat-1',
      categoryName: cat?.name || 'General',
      unitSymbol: defaultProd?.unitSymbol || 'sqft',
      quantity: 10,
      unitRate: defaultProd?.basePrice || 100,
      discountPercentage: 0,
      taxPercentage: 18,
      specifications: '',
    };
    setLines([...lines, newLine]);
  };

  const handleProductSelect = (index: number, pId: string) => {
    const p = products.find((prod) => prod.id === pId);
    if (!p) return;
    const cat = categories.find((c) => c.id === p.categoryId);
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      productId: p.id,
      productCode: p.code || p.id,
      materialName: p.name,
      categoryId: p.categoryId || 'cat-1',
      categoryName: cat?.name || 'General',
      unitSymbol: p.unitSymbol || p.unit || 'sqft',
      unitRate: p.basePrice || p.lastPurchaseRate || updated[index].unitRate,
    };
    setLines(updated);
  };

  const handleUpdateLine = (index: number, patch: Partial<DirectPOLine>) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], ...patch };
    setLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) {
      alert('Direct PO must contain at least one line item.');
      return;
    }
    setLines(lines.filter((_, idx) => idx !== index));
  };

  // Handlers for Additional Charges
  const handleAddCharge = () => {
    setAdditionalCharges([
      ...additionalCharges,
      {
        id: `chg-${Date.now()}`,
        chargeType: 'Freight',
        description: 'Freight & Transportation Charges',
        amount: 5000,
        taxPercentage: 18,
      },
    ]);
  };

  const handleRemoveCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, idx) => idx !== index));
  };

  // Custom Product Creation Handler
  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const cat = categories.find((c) => c.id === customCategoryId);
    const newProdId = `prod-custom-${Date.now()}`;
    const shortCodeClean = (customShortCode || 'MAT').toUpperCase();

    const customLine: DirectPOLine = {
      id: `line-${Date.now()}`,
      productId: newProdId,
      productCode: `PRD-${shortCodeClean}-${Date.now().toString().slice(-4)}`,
      materialName: customItemName.trim(),
      categoryId: customCategoryId,
      categoryName: cat?.name || 'General',
      unitSymbol: customUnitSymbol,
      quantity: 1,
      unitRate: Math.max(0, customRate),
      discountPercentage: 0,
      taxPercentage: 18,
      specifications: customSpecification || customDescription,
      isCustom: true,
    };

    setLines([...lines, customLine]);

    if (saveToMaster) {
      addItem('products', {
        id: newProdId,
        code: customLine.productCode,
        shortCode: shortCodeClean,
        name: customItemName.trim(),
        categoryId: customCategoryId,
        unitId: `unit-${customUnitSymbol}`,
        unitSymbol: customUnitSymbol,
        basePrice: customRate,
        basePriceEffectiveDate: todayStr,
        isActive: true,
        brand: 'Generic',
      });
    }

    // Reset Form
    setCustomItemName('');
    setCustomDescription('');
    setCustomSpecification('');
    setCustomRate(0);
    setSaveToMaster(false);
    setIsCustomModalOpen(false);
  };

  // Form Submission Validation & Submit
  const handleFormSubmit = (targetStatus: 'draft' | 'pending_approval' | 'issued') => {
    setFormError('');

    if (!projectId) {
      setFormError('Please select a valid Project for Direct PO assignment.');
      return;
    }

    if (!vendorId) {
      setFormError('Please select a Vendor from Vendor Master.');
      return;
    }

    if (!deliveryLocation.trim()) {
      setFormError('Delivery Address / Site Location is required.');
      return;
    }

    if (lines.length === 0) {
      setFormError('At least one line item is required.');
      return;
    }

    const hasInvalidLine = lines.some((l) => l.quantity <= 0 || l.unitRate < 0);
    if (hasInvalidLine) {
      setFormError('All line items must have Quantity > 0 and Unit Rate >= 0.');
      return;
    }

    if (!directPOReason) {
      setFormError('Mandatory Direct Purchase Order Reason is required.');
      return;
    }

    if (!justification.trim() || justification.trim().length < 5) {
      setFormError('Please enter a valid Audit Trail Justification / Remarks (min 5 characters).');
      return;
    }

    const poLinesPayload = lines.map((l, idx) => {
      const basic = l.quantity * l.unitRate;
      const discAmt = basic * (l.discountPercentage / 100);
      const taxable = basic - discAmt;
      const taxAmt = taxable * (l.taxPercentage / 100);
      const total = taxable + taxAmt;

      return {
        id: `pol-${Date.now()}-${idx + 1}`,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.materialName,
        unitSymbol: l.unitSymbol,
        unit: l.unitSymbol,
        quantity: l.quantity,
        unitPrice: l.unitRate,
        unitRate: l.unitRate,
        basicRate: l.unitRate,
        discountPercentage: l.discountPercentage,
        taxPercentage: l.taxPercentage,
        lineTotal: total,
        specifications: l.specifications,
        categoryName: l.categoryName,
      };
    });

    const poPayload = {
      id: `po-direct-${Date.now()}`,
      documentNumber: autoPONumber,
      poNumber: autoPONumber,
      projectId: selectedProject?.id || projectId,
      projectName: selectedProject?.projectName || 'Project Site',
      companyEntityId: selectedCompany?.id || companyEntityId,
      companyName: selectedCompany?.legalName || 'Company Entity',
      vendorId: selectedVendor?.id || vendorId,
      vendorName: selectedVendor?.name || 'Selected Vendor',
      originType: 'direct_po',
      purchaseType: 'direct_po',
      sourceType: 'DIRECT_PO',

      // Explicitly clear Indent & RFQ requirements
      indentId: undefined,
      rfqId: undefined,
      sourceIndentId: undefined,
      sourceIndentNumber: undefined,
      rfqDocumentNumber: undefined,
      vendorQuotationId: undefined,

      orderDate: poDate,
      poDate,
      deliveryDueDate,
      expectedDeliveryDate: deliveryDueDate,
      deliveryAddress: deliveryLocation,
      deliveryInstructions,
      paymentTerms,
      vendorReference,
      currency,
      termsAndConditions,

      // Audit & Justification
      directPurchaseReason: directPOReason,
      directPOReason,
      justification,
      remarks: `[Direct PO] Reason: ${directPOReason} | Justification: ${justification}`,

      lines: poLinesPayload,
      additionalCharges,

      // Financial Breakdown
      subtotal: lineTotals.materialBasic,
      discountTotal: lineTotals.materialDiscount,
      taxableSubtotal: lineTotals.totalTaxable,
      taxTotal: lineTotals.totalTax,
      chargesSubtotal: lineTotals.chargesSubtotal,
      chargesTax: lineTotals.chargesTax,
      roundOff: lineTotals.roundOff,
      totalAmount: lineTotals.grandTotal,
      grandTotal: lineTotals.grandTotal,

      status: targetStatus,
      paymentStatus: 'unpaid',
      deliveryStatus: 'not_received',

      createdAt: new Date().toISOString(),
      createdBy: 'Sunil Mehta (Procurement Lead)',
    };

    onSave(poPayload, targetStatus);
  };

  return (
    <div className="space-y-6 text-xs font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Banner Error */}
      {formError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
          <button
            onClick={() => setFormError('')}
            className="text-rose-500 hover:text-rose-800 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: DIRECT PURCHASE ORDER GENERAL DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/15 text-amber-800 rounded-lg">
              <FileText className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Direct Purchase Order General Details
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl">
            <span className="text-slate-400 font-medium text-[11px]">Auto PO #:</span>
            <span className="font-mono font-black text-amber-900 text-xs">{autoPONumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Selection */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Project / Site Location <span className="text-rose-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:border-amber-500 outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode ? `${p.projectCode} - ` : ''}
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Internal Company Entity */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Internal Legal Entity / Billed To <span className="text-rose-500">*</span>
            </label>
            <select
              value={companyEntityId}
              onChange={(e) => setCompanyEntityId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:border-amber-500 outline-none"
            >
              {companyEntities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legalName || c.tradeName} ({c.code || 'MAIN'})
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Master Selection */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Vendor Master <span className="text-rose-500">*</span>
            </label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:border-amber-500 outline-none"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vendorCode || v.code || 'VND'}) - {v.city || 'India'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Master Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Company Metadata Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
            <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-1">
              <span>Billed To: {selectedCompany.legalName}</span>
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div><strong>GSTIN:</strong> <span className="font-mono text-slate-900">{selectedCompany.gstin}</span></div>
            <div className="truncate"><strong>Address:</strong> {selectedCompany.registeredAddress}</div>
            <div><strong>Email:</strong> {selectedCompany.primaryEmail}</div>
          </div>

          {/* Vendor Metadata Box */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
            <div className="font-bold text-slate-900 flex items-center justify-between border-b border-amber-200/60 pb-1">
              <span>Vendor: {selectedVendor?.name}</span>
              <UserCheck className="h-3.5 w-3.5 text-amber-700" />
            </div>
            <div><strong>GSTIN:</strong> <span className="font-mono text-slate-900">{selectedVendor?.gstin || '27AAAAA0000A1Z5'}</span></div>
            <div><strong>Contact:</strong> {selectedVendor?.contactPerson || 'N/A'} ({selectedVendor?.phone || 'N/A'})</div>
            <div><strong>Payment Terms:</strong> <span className="font-bold">{paymentTerms}</span></div>
          </div>
        </div>

        {/* Commercial Dates & Logistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">PO Date *</label>
            <input
              type="date"
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Expected Delivery Date *</label>
            <input
              type="date"
              value={deliveryDueDate}
              onChange={(e) => setDeliveryDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Payment Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Vendor Ref / Quotation No.</label>
            <input
              type="text"
              placeholder="e.g. QT-VND-8891"
              value={vendorReference}
              onChange={(e) => setVendorReference(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-amber-500"
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-700">
              Delivery Site Address / Destination Location <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Preset Destinations:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) setDeliveryLocation(e.target.value);
                }}
                className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-medium"
              >
                <option value="">-- Select Preset Destination --</option>
                {selectedProject && (
                  <option value={`${selectedProject.projectName} Site Store - ${selectedProject.siteLocation || selectedProject.siteAddress || selectedProject.location || 'Site Gate'}`}>
                    [Project Site] {selectedProject.projectName}
                  </option>
                )}
                {stockLocations.map((loc) => (
                  <option key={loc.id} value={`${loc.name} - ${loc.address || loc.code}`}>
                    [Warehouse] {loc.name}
                  </option>
                ))}
                <option value="Flutebyte HQ Central Logistics Hub, BKC, Mumbai">
                  [Company HQ] BKC Central Warehouse
                </option>
              </select>
            </div>
          </div>
          <textarea
            rows={2}
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Specify full delivery address, site gate, storekeeper contact..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* SECTION 2: MATERIAL / PRODUCT LINE ITEMS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/15 text-amber-800 rounded-lg">
              <Package className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Material / Product Line Items ({lines.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddLineFromMaster}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-700" /> Add Product Item
            </button>

            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-700" /> + Custom Item
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Material / Product Master</th>
                  <th className="py-3 px-3">UOM</th>
                  <th className="py-3 px-3 text-right w-28">PO Qty *</th>
                  <th className="py-3 px-3 text-right w-28">Unit Rate (₹) *</th>
                  <th className="py-3 px-3 text-right w-24">Disc %</th>
                  <th className="py-3 px-3 text-right w-24">GST %</th>
                  <th className="py-3 px-3 text-right">Line Total (₹)</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {lines.map((line, idx) => {
                  const qty = Number(line.quantity || 0);
                  const rate = Number(line.unitRate || 0);
                  const discPct = Number(line.discountPercentage || 0);
                  const taxPct = Number(line.taxPercentage || 0);

                  const basic = qty * rate;
                  const discAmt = basic * (discPct / 100);
                  const taxable = Math.max(0, basic - discAmt);
                  const lineTotal = taxable * (1 + taxPct / 100);

                  return (
                    <tr key={line.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400 align-middle">{idx + 1}</td>

                      <td className="py-3 px-3 align-middle">
                        {line.isCustom ? (
                          <div>
                            <div className="font-bold text-slate-900">{line.materialName}</div>
                            <div className="text-[10px] text-amber-700 font-mono flex items-center gap-1">
                              <Tag className="h-3 w-3" /> Custom Item ({line.categoryName})
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <select
                              value={line.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-amber-500"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.code || 'PRD'})
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Specifications / Item note..."
                              value={line.specifications}
                              onChange={(e) => handleUpdateLine(idx, { specifications: e.target.value })}
                              className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:bg-white"
                            />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <input
                          type="text"
                          value={line.unitSymbol}
                          onChange={(e) => handleUpdateLine(idx, { unitSymbol: e.target.value })}
                          className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-center text-xs font-semibold"
                        />
                      </td>

                      <td className="py-3 px-3 text-right align-middle">
                        <input
                          type="number"
                          min={1}
                          step="any"
                          value={line.quantity}
                          onChange={(e) => handleUpdateLine(idx, { quantity: parseFloat(e.target.value) || 0 })}
                          className="w-24 text-right font-mono font-black py-1 px-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-amber-500"
                        />
                      </td>

                      <td className="py-3 px-3 text-right align-middle">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={line.unitRate}
                          onChange={(e) => handleUpdateLine(idx, { unitRate: parseFloat(e.target.value) || 0 })}
                          className="w-24 text-right font-mono font-bold py-1 px-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-amber-500"
                        />
                      </td>

                      <td className="py-3 px-3 text-right align-middle">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          value={line.discountPercentage}
                          onChange={(e) => handleUpdateLine(idx, { discountPercentage: parseFloat(e.target.value) || 0 })}
                          className="w-16 text-right font-mono text-slate-600 py-1 px-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </td>

                      <td className="py-3 px-3 text-right align-middle">
                        <select
                          value={line.taxPercentage}
                          onChange={(e) => handleUpdateLine(idx, { taxPercentage: parseFloat(e.target.value) || 0 })}
                          className="w-16 text-right font-mono text-slate-600 py-1 px-1 bg-white border border-slate-300 rounded-lg text-xs"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900 align-middle">
                        ₹{formatIndianCurrency(lineTotal)}
                      </td>

                      <td className="py-3 px-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: ADDITIONAL CHARGES & OVERHEADS (OPTIONAL) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Truck className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Additional Charges & Freight (Optional)
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddCharge}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer text-xs"
          >
            <Plus className="h-3.5 w-3.5 text-slate-600" /> Add Charge
          </button>
        </div>

        {additionalCharges.length === 0 ? (
          <div className="py-4 text-center text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No additional charges added. Click "+ Add Charge" to add freight, packing, or insurance.
          </div>
        ) : (
          <div className="space-y-2">
            {additionalCharges.map((chg, idx) => (
              <div
                key={chg.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Charge Type</label>
                  <select
                    value={chg.chargeType}
                    onChange={(e) => {
                      const updated = [...additionalCharges];
                      updated[idx].chargeType = e.target.value;
                      setAdditionalCharges(updated);
                    }}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Freight">Freight & Transportation</option>
                    <option value="Loading/Unloading">Loading / Unloading</option>
                    <option value="Packing">Packing & Forwarding</option>
                    <option value="Insurance">Transit Insurance</option>
                    <option value="Installation">Installation & Handling</option>
                    <option value="Other">Other Overhead</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Description</label>
                  <input
                    type="text"
                    value={chg.description}
                    onChange={(e) => {
                      const updated = [...additionalCharges];
                      updated[idx].description = e.target.value;
                      setAdditionalCharges(updated);
                    }}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Basic Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={chg.amount}
                    onChange={(e) => {
                      const updated = [...additionalCharges];
                      updated[idx].amount = parseFloat(e.target.value) || 0;
                      setAdditionalCharges(updated);
                    }}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-right"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveCharge(idx)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: COMMERCIAL TERMS & MANDATORY AUDIT JUSTIFICATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="p-1.5 bg-amber-500/15 text-amber-800 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            4. Commercial Terms & Direct PO Justification
          </h2>
        </div>

        {/* Direct PO Mandatory Reason */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            Mandatory Direct PO Business Reason & Audit Trail <span className="text-rose-600">*</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-amber-900 text-xs mb-1">Direct PO Reason *</label>
              <select
                value={directPOReason}
                onChange={(e) => setDirectPOReason(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-950 focus:border-amber-600 outline-none"
              >
                <option value="Emergency Purchase">Emergency Site Material Purchase</option>
                <option value="Repeat Purchase">Repeat Purchase (Pre-Approved Vendor)</option>
                <option value="Approved Rate Contract">Approved Rate Contract</option>
                <option value="Single Source Vendor">Single Source / Sole OEM Vendor</option>
                <option value="Client Specified Vendor">Client Specified Vendor / Brand</option>
                <option value="Low Value Purchase">Low Value Threshold Purchase</option>
                <option value="Replacement Material">Replacement for Damaged Goods</option>
                <option value="Management Decision">Executive Management Direct Order</option>
                <option value="Other">Other Business Justification</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-amber-900 text-xs mb-1">
                Audit Trail Justification & Commercial Remarks * (Min 5 chars)
              </label>
              <textarea
                rows={2}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter mandatory justification for bypassing Indent/RFQ (e.g., Urgent site joinery deadline; rates verified against previous PO...)"
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-medium focus:border-amber-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Instructions & Boilerplate Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Delivery Instructions for Vendor</label>
            <textarea
              rows={3}
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">PO Terms & Conditions</label>
            <textarea
              rows={3}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: COMMERCIAL SUMMARY & SUBMIT BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-[#AB9570] text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Commercial Financial Summary
              </h3>
              <span className="font-mono text-xs text-slate-400">{currency}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block">Material Basic:</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{formatIndianCurrency(lineTotals.materialBasic)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Material Tax:</span>
                <span className="font-mono font-bold text-slate-300 text-sm">
                  ₹{formatIndianCurrency(lineTotals.materialTax)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Freight & Charges:</span>
                <span className="font-mono font-bold text-slate-300 text-sm">
                  ₹{formatIndianCurrency(lineTotals.chargesSubtotal)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total GST:</span>
                <span className="font-mono font-bold text-slate-300 text-sm">
                  ₹{formatIndianCurrency(lineTotals.totalTax)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Grand Total Purchase Order Amount
              </span>
              <div className="font-mono font-black text-2xl text-[#AB9570]">
                ₹{formatIndianCurrency(lineTotals.grandTotal)}
              </div>
            </div>
            {lineTotals.roundOff !== 0 && (
              <span className="text-[10px] font-mono text-slate-400">
                Round Off: {lineTotals.roundOff}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">PO Actions</h4>
            <p className="text-[11px] text-slate-500">
              Direct PO will be created with sourceType: DIRECT_PO and immediately logged for audit review.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => handleFormSubmit('draft')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4 text-slate-600" /> Save Draft PO
            </button>

            <button
              type="button"
              onClick={() => handleFormSubmit('pending_approval')}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-4 w-4 text-amber-500" /> Submit for Approval
            </button>

            <button
              type="button"
              onClick={() => handleFormSubmit('issued')}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" /> Issue Direct Purchase Order
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOM ITEM MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-amber-700" /> Add Custom Product Line Item
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomItem} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Material / Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Teak Veneer Edge Banding 12mm"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:border-amber-500 outline-none font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Category *</label>
                  <select
                    value={customCategoryId}
                    onChange={(e) => setCustomCategoryId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">UOM *</label>
                  <select
                    value={customUnitSymbol}
                    onChange={(e) => setCustomUnitSymbol(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.symbol || u.code}>
                        {u.name} ({u.symbol || u.code})
                      </option>
                    ))}
                    <option value="sqft">Square Feet (sqft)</option>
                    <option value="nos">Numbers (nos)</option>
                    <option value="ltr">Liters (ltr)</option>
                    <option value="rmt">Running Meters (rmt)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Product Short Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRM"
                    value={customShortCode}
                    onChange={(e) => setCustomShortCode(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Reference Unit Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={customRate}
                    onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Specifications / Description</label>
                <textarea
                  rows={2}
                  placeholder="Technical specs, grade, thickness..."
                  value={customSpecification}
                  onChange={(e) => setCustomSpecification(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveToMaster"
                  checked={saveToMaster}
                  onChange={(e) => setSaveToMaster(e.target.checked)}
                  className="h-4 w-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="saveToMaster" className="font-bold text-slate-800 text-xs cursor-pointer">
                  Save to Material Master for future purchases
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Add Custom Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
