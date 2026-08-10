import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { QuarantineItem, NCR } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import {
  AlertTriangle,
  RotateCcw,
  FileText,
  Truck,
} from 'lucide-react';

export const QuarantinePage: React.FC = () => {
  const { state, updateItem, addItem, logAudit } = useERPStore();

  const quarantineItems: QuarantineItem[] = state.quarantineItems || [];
  const ncrs: NCR[] = state.ncrs || [];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quarantine' | 'ncr'>('quarantine');
  const [selectedItemForRTV, setSelectedItemForRTV] = useState<QuarantineItem | null>(null);
  const [transporterDetails, setTransporterDetails] = useState<string>('VRL Logistics / Blue Dart Express');

  const filteredQuarantine = quarantineItems.filter((q) => {
    return (
      searchQuery === '' ||
      q.productDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredNCRs = ncrs.filter((n) => {
    return (
      searchQuery === '' ||
      n.ncrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.productDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateRTV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRTV) return;

    const rtvNumber = `RTV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const rtvRecord: any = {
      id: `rtv-${Date.now()}`,
      rtvNumber,
      ncrId: selectedItemForRTV.ncrId,
      grnId: selectedItemForRTV.grnId,
      grnNumber: selectedItemForRTV.grnNumber,
      poId: selectedItemForRTV.poId,
      poNumber: selectedItemForRTV.poNumber,
      vendorId: selectedItemForRTV.vendorId,
      vendorName: selectedItemForRTV.vendorName,
      projectId: selectedItemForRTV.projectId,
      projectName: selectedItemForRTV.projectName,
      returnDate: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: selectedItemForRTV.productId,
          productDescription: selectedItemForRTV.productDescription,
          quantity: selectedItemForRTV.quantity,
          unit: selectedItemForRTV.unit,
          reason: selectedItemForRTV.reason,
        },
      ],
      transporterDetails,
      status: 'dispatched',
      createdAt: new Date().toISOString(),
      createdBy: 'Store Manager',
    };

    addItem('returnToVendors', rtvRecord);

    updateItem('quarantineItems', selectedItemForRTV.id, {
      status: 'rtv_created',
    });

    if (selectedItemForRTV.ncrId) {
      updateItem('ncrs', selectedItemForRTV.ncrId, {
        status: 'returned',
        rtvNumber,
      });
    }

    logAudit({
      documentType: 'quarantine',
      documentId: selectedItemForRTV.id,
      documentNumber: rtvNumber,
      action: 'RTV_DISPATCHED',
      performedBy: 'Store Manager',
      details: `Generated Return to Vendor ${rtvNumber} for ${selectedItemForRTV.quantity} ${selectedItemForRTV.unit} of ${selectedItemForRTV.productDescription}.`,
    });

    setSelectedItemForRTV(null);
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Material Quarantine & Non-Conformance Records (NCR)"
        subtitle="Physical isolation of rejected & held stock, defect tracking, and Return to Vendor (RTV) dispatch workflows."
      />

      <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg">
        <button
          onClick={() => setActiveTab('quarantine')}
          className={`px-4 py-3 text-xs font-bold transition-colors border-b-2 flex items-center ${
            activeTab === 'quarantine'
              ? 'border-[#AB9570] text-[#121214]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mr-1.5 text-red-600" /> Isolated Quarantine Stock ({quarantineItems.length})
        </button>

        <button
          onClick={() => setActiveTab('ncr')}
          className={`px-4 py-3 text-xs font-bold transition-colors border-b-2 flex items-center ${
            activeTab === 'ncr'
              ? 'border-[#AB9570] text-[#121214]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 mr-1.5 text-amber-600" /> Non-Conformance Records ({ncrs.length})
        </button>
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search material description, vendor, GRN, or PO number..."
      />

      {activeTab === 'quarantine' ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden my-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Material Description</th>
                <th className="py-3 px-4">Vendor & Site</th>
                <th className="py-3 px-4">GRN & PO Ref</th>
                <th className="py-3 px-4 text-center">Bucket Type</th>
                <th className="py-3 px-4 text-right font-bold text-gray-900">Quarantine Qty</th>
                <th className="py-3 px-4">Defect Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredQuarantine.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No material items in quarantine. Rejected materials from QC inspections will automatically appear here.
                  </td>
                </tr>
              ) : (
                filteredQuarantine.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.productDescription}</td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{item.vendorName}</span>
                        <span className="text-gray-500">{item.projectName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{item.grnNumber}</span>
                        <span className="text-gray-500">PO: {item.poNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.type === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-700">{item.quantity} {item.unit}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">{item.reason}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'rtv_created' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {item.status === 'rtv_created' ? 'RTV Dispatched' : 'In Quarantine'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status !== 'rtv_created' && (
                        <button
                          onClick={() => setSelectedItemForRTV(item)}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-[#121214] hover:bg-[#252528] rounded shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#AB9570]" /> Create RTV
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden my-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">NCR #</th>
                <th className="py-3 px-4">Material & Vendor</th>
                <th className="py-3 px-4 text-right font-bold">Rejected Qty</th>
                <th className="py-3 px-4">Raised By & Date</th>
                <th className="py-3 px-4">Defect Summary</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredNCRs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No Non-Conformance Records found.
                  </td>
                </tr>
              ) : (
                filteredNCRs.map((ncr) => (
                  <tr key={ncr.id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-bold text-gray-900">{ncr.ncrNumber}</td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{ncr.productDescription}</span>
                        <span className="text-gray-500">{ncr.vendorName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-700">{ncr.rejectedQty} {ncr.unit}</td>
                    <td className="py-3 px-4 text-xs text-gray-700">
                      <div className="flex flex-col">
                        <span>{ncr.raisedBy}</span>
                        <span className="text-gray-400">{ncr.raisedDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{ncr.observedDefect}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ncr.status === 'returned' ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {ncr.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* RTV Modal */}
      {selectedItemForRTV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-[#AB9570]" /> Return to Vendor (RTV) Gate Pass Generation
            </h3>

            <form onSubmit={handleCreateRTV} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <p><strong className="text-gray-700">Vendor:</strong> {selectedItemForRTV.vendorName}</p>
                <p><strong className="text-gray-700">Material:</strong> {selectedItemForRTV.productDescription}</p>
                <p><strong className="text-gray-700">Return Qty:</strong> <span className="font-bold text-red-700">{selectedItemForRTV.quantity} {selectedItemForRTV.unit}</span></p>
                <p><strong className="text-gray-700">Reason:</strong> {selectedItemForRTV.reason}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Transporter / Gate Pass Details *</label>
                <input
                  type="text"
                  required
                  value={transporterDetails}
                  onChange={(e) => setTransporterDetails(e.target.value)}
                  placeholder="e.g. Vehicle KA-01-EA-1234, Driver Suresh"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedItemForRTV(null)}
                  className="px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#121214] hover:bg-[#252528] rounded-lg shadow-sm"
                >
                  Confirm & Dispatch RTV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};

export default QuarantinePage;
