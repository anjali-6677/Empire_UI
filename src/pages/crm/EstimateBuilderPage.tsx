import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Layers,
  Shield,
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Building,
  MapPin,
  Tag,
} from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import {
  BOQSection,
  PricingFactor,
  CostSummary,
  ScheduleItem,
  PaymentStage,
  Estimate,
} from '../../domain/types';
import { getClientDisplayDetails, normalizeEnquiryRequirement } from '../../utils/crmHelpers';
import { formatIndianCurrency } from '../../utils/format';
import { BOQSectionEditor } from '../../components/crm/BOQSectionEditor';
import { PricingFactorsForm } from '../../components/crm/PricingFactorsForm';
import { CostSummaryCard } from '../../components/crm/CostSummaryCard';
import { ScheduleEditor } from '../../components/crm/ScheduleEditor';
import { PaymentTermsEditor } from '../../components/crm/PaymentTermsEditor';
import { QuotationPreview } from '../../components/crm/QuotationPreview';
import { SendQuotationModal } from '../../components/crm/SendQuotationModal';

export const EstimateBuilderPage: React.FC = () => {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const navigate = useNavigate();
  const { state, addItem, updateItem, logAudit } = useERPStore();

  const enquiry = state.enquiries.find((e) => e.id === enquiryId || e.enquiryNumber === enquiryId);
  const existingEstimate = state.estimates.find((e) => e.id === enquiry?.currentEstimateId || e.enquiryId === enquiry?.id);
  const client = state.clients.find((c) => c.id === enquiry?.clientId);
  const clientDetails = getClientDisplayDetails(client);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Pricing Factors state defaults
  const defaultFactors: PricingFactor[] = (state as any).companyPricingFactors && (state as any).companyPricingFactors.length > 0
    ? (state as any).companyPricingFactors.map((f: any) => ({ ...f, estimateValue: f.companyDefaultValue, overridden: false }))
    : [
        { id: 'pf-wastage', name: 'Material Wastage Factor', code: 'WASTAGE', companyDefaultValue: 5, estimateValue: 5, calculationType: 'percentage', isMandatory: true, categoryScope: 'all', appliesToCostBasis: 'material_cost', sortOrder: 1 },
        { id: 'pf-transport', name: 'Freight & Transportation', code: 'FREIGHT', companyDefaultValue: 3.5, estimateValue: 3.5, calculationType: 'percentage', isMandatory: false, categoryScope: 'all', appliesToCostBasis: 'material_cost', sortOrder: 2 },
        { id: 'pf-overhead', name: 'Site Supervision & Overhead', code: 'OVERHEAD', companyDefaultValue: 8, estimateValue: 8, calculationType: 'percentage', isMandatory: true, categoryScope: 'all', appliesToCostBasis: 'subtotal', sortOrder: 3 },
        { id: 'pf-profit', name: 'Gross Profit Margin', code: 'PROFIT', companyDefaultValue: 18, estimateValue: 18, calculationType: 'percentage', isMandatory: true, categoryScope: 'all', appliesToCostBasis: 'subtotal', sortOrder: 4 },
      ];

  // ONLY NEW estimates start with an empty BOQ section list ([]). Preserve existing saved estimate sections!
  const [boqSections, setBoqSections] = useState<BOQSection[]>(
    existingEstimate ? existingEstimate.boqSections : []
  );

  const [pricingFactors, setPricingFactors] = useState<PricingFactor[]>(
    existingEstimate?.pricingFactors || defaultFactors
  );
  const [isCustomPricing, setIsCustomPricing] = useState<boolean>(
    existingEstimate?.isCustomPricing || false
  );
  const [overrideReason, setOverrideReason] = useState<string>(
    existingEstimate?.overrideReason || ''
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    existingEstimate?.schedule || ([
      { id: 'sch-1', workSection: 'Site Prep & Civil', description: 'Demolition & floor marking', startAfterDays: 0, duration: 7, durationUnit: 'days', expectedStart: '', expectedCompletion: '' },
      { id: 'sch-2', workSection: 'Carpentry & Millwork', description: 'Carcass & framing', startAfterDays: 7, duration: 21, durationUnit: 'days', expectedStart: '', expectedCompletion: '' },
      { id: 'sch-3', workSection: 'Finishes & Polish', description: 'Veneer pressing & PU finish', startAfterDays: 28, duration: 14, durationUnit: 'days', expectedStart: '', expectedCompletion: '' },
    ] as any)
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentStage[]>(
    existingEstimate?.paymentTerms || [
      { id: 'pt-1', stageName: 'Advance Mobilization', description: 'Upon signing contract', percentage: 10, amount: 0, dueCondition: 'Contract Execution' },
      { id: 'pt-2', stageName: 'Material Delivery', description: 'Upon site arrival of materials', percentage: 40, amount: 0, dueCondition: 'Material Delivery' },
      { id: 'pt-3', stageName: 'Mid Progress Fitting', description: '70% Carpentry completion', percentage: 40, amount: 0, dueCondition: '70% Carpentry' },
      { id: 'pt-4', stageName: 'Final Handover', description: 'Upon final snag list sign-off', percentage: 10, amount: 0, dueCondition: 'Handover Signoff' },
    ]
  );

  // Calculation Engine
  const calculateCostSummary = (): CostSummary => {
    let baseBOQCost = 0;
    let materialCostSum = 0;
    let lineLabourSum = 0;
    let lineInstallationSum = 0;

    boqSections.forEach((sec) => {
      sec.items.forEach((item) => {
        baseBOQCost += item.totalCost || 0;
        materialCostSum += item.materialCost || 0;
        lineLabourSum += item.labourCost || 0;
        lineInstallationSum += item.installationCost || 0;
      });
    });

    let wastageAmount = 0;
    let transportAmount = 0;
    let overheadAmount = 0;
    let profitAmount = 0;
    let profitPercentage = 18;

    pricingFactors.forEach((f) => {
      const val = f.estimateValue;
      if (f.code === 'WASTAGE') wastageAmount = (materialCostSum * val) / 100;
      if (f.code === 'FREIGHT') transportAmount = (materialCostSum * val) / 100;
      if (f.code === 'OVERHEAD') overheadAmount = (baseBOQCost * val) / 100;
      if (f.code === 'PROFIT') profitPercentage = val;
    });

    const subtotalBeforeProfit = baseBOQCost + wastageAmount + transportAmount + overheadAmount;
    profitAmount = (subtotalBeforeProfit * profitPercentage) / 100;
    const taxableAmount = subtotalBeforeProfit + profitAmount;
    const gstAmount = (taxableAmount * 18) / 100;
    const finalQuotationValue = Math.round(taxableAmount + gstAmount);

    return {
      baseBOQCost,
      materialCostSum,
      lineLabourSum,
      lineInstallationSum,
      wastageAmount,
      transportationAmount: transportAmount,
      miscellaneousAmount: 0,
      overheadAmount,
      subtotalBeforeProfit,
      profitPercentage,
      discountAmount: 0,
      taxableAmount,
      gstAmount,
      finalQuotationValue,
      internalTotalCost: subtotalBeforeProfit,
      profitAmount,
    };
  };

  const costSummary = calculateCostSummary();

  // Sync Payment Terms Amounts
  useEffect(() => {
    const updatedPt = paymentTerms.map((pt) => ({
      ...pt,
      amount: (costSummary.finalQuotationValue * pt.percentage) / 100,
    }));
    setPaymentTerms(updatedPt);
  }, [costSummary.finalQuotationValue]);

  if (!enquiry) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Enquiry record not found. Please select a valid customer enquiry.
      </div>
    );
  }

  const handleSaveEstimate = (status: 'draft' | 'pending_approval') => {
    const today = new Date().toISOString();
    const estId = existingEstimate?.id || `est-${Date.now()}`;
    const quoteNo = existingEstimate?.quotationNumber || `EMP-QUOTE-2026-${String(state.estimates.length + 1).padStart(3, '0')}-R0`;
    const revNum = existingEstimate?.revisionNumber || 0;
    const revLabel = existingEstimate?.revisionLabel || 'R0';

    const newEstimate: Estimate = {
      id: estId,
      enquiryId: enquiry.id,
      quotationNumber: quoteNo,
      revisionNumber: revNum,
      revisionLabel: revLabel,
      clientId: enquiry.clientId,
      clientName: enquiry.clientName,
      status: status === 'pending_approval' ? ('under_estimation' as any) : 'draft',
      boqSections,
      pricingFactors,
      isCustomPricing,
      overrideReason: isCustomPricing ? overrideReason : undefined,
      costSummary,
      schedule,
      paymentTerms,
      termsAndConditions: 'Quotation valid for 30 days.\nPayment as per agreed milestone schedule.',
      finalQuotationValue: costSummary.finalQuotationValue,
      createdAt: existingEstimate?.createdAt || today,
      createdBy: existingEstimate?.createdBy || 'Current User',
      updatedAt: today,
      updatedBy: 'Current User',
    };

    if (existingEstimate) {
      updateItem('estimates', estId, newEstimate);
    } else {
      addItem('estimates', newEstimate);
    }

    updateItem('enquiries', enquiry.id, {
      status: 'estimating',
      currentEstimateId: estId,
      estimateIds: Array.from(new Set([...(enquiry.estimateIds || []), estId])),
      updatedAt: today,
    });

    logAudit({
      documentType: 'estimate',
      documentId: estId,
      documentNumber: quoteNo,
      action: existingEstimate ? 'UPDATED' : 'CREATED',
      performedBy: 'Current User',
      newStatus: status,
      details: `Saved estimate ${quoteNo} (${revLabel}) with final quotation value ₹${costSummary.finalQuotationValue.toLocaleString('en-IN')}`,
    });

    if (status === 'pending_approval') {
      navigate(`/crm?tab=enquiries`);
    } else {
      alert(`Estimate ${quoteNo} saved as Draft.`);
    }
  };

  const handleConfirmSendQuotation = (deliveryMethod: 'email' | 'whatsapp' | 'manual') => {
    handleSaveEstimate('draft');
    const estId = existingEstimate?.id || `est-${Date.now()}`;
    const today = new Date().toISOString();

    updateItem('estimates', estId, {
      status: 'sent_to_client',
      sentDetails: { sentDate: today.split('T')[0], deliveryMethod, sentBy: 'Current Estimator' },
      updatedAt: today,
    });

    updateItem('enquiries', enquiry.id, {
      status: 'sent_to_client',
      updatedAt: today,
    });

    logAudit({
      documentType: 'quotation',
      documentId: estId,
      documentNumber: existingEstimate?.quotationNumber || 'QUOTATION',
      action: 'SENT_TO_CLIENT',
      performedBy: 'Current Estimator',
      newStatus: 'sent_to_client',
      details: `Quotation dispatched to client via ${deliveryMethod}.`,
    });

    setIsSendModalOpen(false);
    navigate(`/crm?tab=estimates`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs bg-slate-50 min-h-screen">
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/crm')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200"
            title="Back to CRM Workspace"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-[10px] font-bold text-[#AB9570] uppercase tracking-wider flex items-center gap-1.5">
              <span>{enquiry.enquiryNumber}</span>
              <span className="bg-[#AB9570]/20 text-[#AB9570] px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                {existingEstimate?.revisionLabel || 'R0'}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">Commercial Estimate & BOQ Builder</h1>
            <p className="text-xs text-slate-500 font-medium">
              Client: <span className="font-semibold text-slate-900">{clientDetails.clientName}</span> ({clientDetails.contactPerson})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSaveEstimate('draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all text-xs"
          >
            <Save className="h-4 w-4 text-slate-600" /> Save Baseline Draft
          </button>

          <button
            type="button"
            onClick={() => setIsSendModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-sm transition-all text-xs"
          >
            <Send className="h-4 w-4 stroke-[2.5]" /> Send Proposal
          </button>
        </div>
      </div>

      {/* Prominent Client Requirement & Scope Banner (Light ERP Card) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#AB9570] font-bold flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5" /> Client Master Requirement Details
          </span>
          <span className="text-xs font-mono font-black text-slate-900">
            Est. Budget: <span className="text-[#AB9570]">{formatIndianCurrency(enquiry.expectedBudget || 0)}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="md:col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Requirement Title</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {normalizeEnquiryRequirement(enquiry.projectRequirement)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category & Property</span>
            <div className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
              <Tag className="h-3 w-3 text-[#AB9570]" />
              {enquiry.projectType || 'Commercial'} ({enquiry.propertyType || 'Standard'})
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location & Area</span>
            <div className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#AB9570]" />
              {enquiry.location || 'Site Location TBD'} ({enquiry.approximateArea || '3500'} {enquiry.areaUnit || 'sqft'})
            </div>
          </div>
        </div>
      </div>

      {/* 6-Step Stepper Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-6 gap-1 text-xs">
        {[
          { step: 1, label: '1. BOQ Items', icon: Layers },
          { step: 2, label: '2. Pricing Factors', icon: Shield },
          { step: 3, label: '3. Cost Summary', icon: Calculator },
          { step: 4, label: '4. Timeline', icon: Calendar },
          { step: 5, label: '5. Payment Terms', icon: CreditCard },
          { step: 6, label: '6. Proposal Package', icon: FileText },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step as any)}
              className={`flex items-center gap-2 p-2.5 rounded-xl font-bold transition-all text-left ${
                isActive
                  ? 'bg-slate-900 text-[#AB9570] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#AB9570]' : 'text-slate-400'}`} />
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <BOQSectionEditor
          sections={boqSections}
          onChange={setBoqSections}
          categories={state.categories}
          products={state.products}
          units={state.units}
        />
      )}

      {currentStep === 2 && (
        <PricingFactorsForm
          pricingFactors={pricingFactors}
          onPricingFactorsChange={setPricingFactors}
          isCustomPricing={isCustomPricing}
          onIsCustomPricingChange={setIsCustomPricing}
          overrideReason={overrideReason}
          onOverrideReasonChange={setOverrideReason}
          boqSections={boqSections}
          costSummary={costSummary}
        />
      )}

      {currentStep === 3 && <CostSummaryCard costSummary={costSummary} />}

      {currentStep === 4 && <ScheduleEditor schedule={schedule} onChange={setSchedule} />}

      {currentStep === 5 && (
        <PaymentTermsEditor
          paymentTerms={paymentTerms}
          onChange={setPaymentTerms}
          quotationValue={costSummary.finalQuotationValue}
        />
      )}

      {currentStep === 6 && (
        <QuotationPreview
          enquiry={enquiry}
          estimate={{
            id: existingEstimate?.id || 'temp-est',
            enquiryId: enquiry.id,
            quotationNumber: existingEstimate?.quotationNumber || `EMP-QUOTE-2026-001-${existingEstimate?.revisionLabel || 'R0'}`,
            revisionNumber: existingEstimate?.revisionNumber || 0,
            revisionLabel: existingEstimate?.revisionLabel || 'R0',
            clientId: enquiry.clientId,
            clientName: enquiry.clientName,
            status: 'draft',
            boqSections,
            pricingFactors,
            isCustomPricing,
            costSummary,
            schedule,
            paymentTerms,
            termsAndConditions: '',
            finalQuotationValue: costSummary.finalQuotationValue,
            createdAt: new Date().toISOString(),
            createdBy: 'Current User',
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User',
          }}
          onSendToClient={() => setIsSendModalOpen(true)}
        />
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((currentStep - 1) as any)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-40"
        >
          Previous Step
        </button>

        <div className="font-mono text-slate-500 font-bold">
          Step {currentStep} of 6
        </div>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((currentStep + 1) as any)}
            className="px-5 py-2 bg-[#121214] hover:bg-slate-800 text-[#AB9570] font-bold rounded-xl shadow-md"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSendModalOpen(true)}
            className="px-6 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-lg"
          >
            Send Quotation to Client
          </button>
        )}
      </div>

      {/* Send Modal */}
      <SendQuotationModal
        enquiry={enquiry}
        estimate={{
          id: existingEstimate?.id || 'temp-est',
          enquiryId: enquiry.id,
          quotationNumber: existingEstimate?.quotationNumber || `EMP-QUOTE-2026-001-${existingEstimate?.revisionLabel || 'R0'}`,
          revisionNumber: existingEstimate?.revisionNumber || 0,
          revisionLabel: existingEstimate?.revisionLabel || 'R0',
          clientId: enquiry.clientId,
          clientName: enquiry.clientName,
          status: 'draft',
          boqSections,
          pricingFactors,
          isCustomPricing,
          costSummary,
          schedule,
          paymentTerms,
          termsAndConditions: '',
          finalQuotationValue: costSummary.finalQuotationValue,
          createdAt: new Date().toISOString(),
          createdBy: 'Current User',
          updatedAt: new Date().toISOString(),
          updatedBy: 'Current User',
        }}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onConfirmSend={handleConfirmSendQuotation}
      />
    </div>
  );
};
