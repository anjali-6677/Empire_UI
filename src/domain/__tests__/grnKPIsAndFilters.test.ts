import {
  getGRNNetPayable,
  getGRNPaidAmount,
  getGRNOutstanding,
  getGRNPaymentStatus,
  getGRNKPISummary,
} from '../selectors';

export function runGRNKPITests(): { passed: boolean; message: string } {
  try {
    const sampleGRNs: any[] = [
      {
        id: 'grn_001',
        grnNumber: 'REC/0001',
        poId: 'po_001',
        poNumber: 'FBT/PLY/0826/1',
        vendorId: 'vendor_001',
        vendorName: 'PlyWorld Corp',
        grnDate: '2026-08-10',
        acceptedQty: 100,
        poUnitRate: 1500,
        baseAcceptedValue: 150000,
        taxAmount: 27000,
        netPayable: 177000,
        status: 'qc_completed',
      },
      {
        id: 'grn_002',
        grnNumber: 'REC/0002',
        poId: 'po_002',
        poNumber: 'FBT/LAM/0826/2',
        vendorId: 'vendor_002',
        vendorName: 'Laminate Hub',
        grnDate: '2026-08-12',
        acceptedQty: 50,
        poUnitRate: 2000,
        baseAcceptedValue: 100000,
        taxAmount: 18000,
        netPayable: 118000,
        status: 'qc_completed',
      },
      {
        id: 'grn_003',
        grnNumber: 'REC/0003',
        poId: 'po_003',
        poNumber: 'FBT/EL/0826/3',
        vendorId: 'vendor_001',
        vendorName: 'PlyWorld Corp',
        grnDate: '2026-08-15',
        acceptedQty: 20,
        poUnitRate: 500,
        baseAcceptedValue: 10000,
        taxAmount: 1800,
        netPayable: 11800,
        status: 'Cancelled',
      },
    ];

    const samplePayments = [
      {
        id: 'pay_001',
        grnId: 'grn_001',
        amount: 77000,
        paymentDate: '2026-08-12',
      },
      {
        id: 'pay_002',
        grnId: 'grn_002',
        amount: 118000,
        paymentDate: '2026-08-14',
      },
    ];

    // 1. Individual GRN financial calculations
    if (getGRNNetPayable(sampleGRNs[0]) !== 177000) throw new Error('GRN 1 Net Payable calculation failed');
    if (getGRNPaidAmount(sampleGRNs[0], samplePayments) !== 77000) throw new Error('GRN 1 Paid Amount calculation failed');
    if (getGRNOutstanding(sampleGRNs[0], samplePayments) !== 100000) throw new Error('GRN 1 Outstanding calculation failed');

    if (getGRNNetPayable(sampleGRNs[1]) !== 118000) throw new Error('GRN 2 Net Payable calculation failed');
    if (getGRNPaidAmount(sampleGRNs[1], samplePayments) !== 118000) throw new Error('GRN 2 Paid Amount calculation failed');
    if (getGRNOutstanding(sampleGRNs[1], samplePayments) !== 0) throw new Error('GRN 2 Outstanding calculation failed');

    // 2. Status Evaluation
    const today = '2026-08-17';
    if (getGRNPaymentStatus(sampleGRNs[0], samplePayments, undefined, today) !== 'Partially Paid')
      throw new Error('GRN 1 status calculation failed');
    if (getGRNPaymentStatus(sampleGRNs[1], samplePayments, undefined, today) !== 'Paid')
      throw new Error('GRN 2 status calculation failed');
    if (getGRNPaymentStatus(sampleGRNs[2], samplePayments, undefined, today) !== 'Cancelled')
      throw new Error('GRN 3 status calculation failed');

    // 3. Global KPI Summaries
    const kpis = getGRNKPISummary(sampleGRNs, samplePayments);
    if (kpis.totalGRNs !== 2) throw new Error(`Global KPI totalGRNs failed: got ${kpis.totalGRNs}`);
    if (kpis.openGRNs !== 1) throw new Error(`Global KPI openGRNs failed: got ${kpis.openGRNs}`);
    if (kpis.totalNetPayable !== 295000) throw new Error(`Global KPI totalNetPayable failed: got ${kpis.totalNetPayable}`);
    if (kpis.totalOutstanding !== 100000) throw new Error(`Global KPI totalOutstanding failed: got ${kpis.totalOutstanding}`);

    // 4. Dynamic Vendor Filtering Simulation
    const vendor1GRNs = sampleGRNs.filter((g) => g.vendorId === 'vendor_001');
    const kpisVendor1 = getGRNKPISummary(vendor1GRNs, samplePayments);
    if (kpisVendor1.totalGRNs !== 1) throw new Error('Vendor filter totalGRNs failed');
    if (kpisVendor1.openGRNs !== 1) throw new Error('Vendor filter openGRNs failed');
    if (kpisVendor1.totalNetPayable !== 177000) throw new Error('Vendor filter totalNetPayable failed');
    if (kpisVendor1.totalOutstanding !== 100000) throw new Error('Vendor filter totalOutstanding failed');

    return { passed: true, message: 'All GRN KPI and filter calculation tests passed successfully!' };
  } catch (err: any) {
    return { passed: false, message: err?.message || 'GRN KPI tests failed' };
  }
}

