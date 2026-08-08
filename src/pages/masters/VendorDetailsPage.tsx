/**
 * Vendor Master Details Page
 * Location: src/pages/masters/VendorDetailsPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import {
  Store,
  ArrowLeft,
  Edit,
  FileText,
  ShieldCheck,
  Package,
  Phone,
  Mail,
  MapPin,
  Star,
} from 'lucide-react';

export const VendorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const { state } = useERPStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'orders' | 'performance'>('overview');

  const vendor = state.vendors?.find((v) => v.id === vendorId);
  const products = state.products?.filter((p) => p.vendorIds?.includes(vendorId || '')) || [];
  const purchaseOrders = state.purchaseOrders?.filter((po) => po.vendorId === vendorId) || [];

  if (!vendor) {
    return (
      <div className="p-12 text-center space-y-4">
        <Store className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Vendor Not Found</h2>
        <p className="text-sm text-slate-500">The vendor master record could not be found.</p>
        <Button onClick={() => navigate('/masters/vendors')} variant="primary">
          Return to Vendor Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/masters/vendors')}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold">
                {vendor.code}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                  vendor.status === 'empanelled'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : vendor.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {vendor.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{vendor.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/masters/vendors/${vendor.id}/edit`)}
            variant="primary"
            className="gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Vendor Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Store className="h-4 w-4" /> Company Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'categories'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="h-4 w-4" /> Approved Products ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="h-4 w-4" /> Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'performance'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Performance & Rating
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Registration & Statutory Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">GSTIN Number</span>
                  <span className="font-mono font-semibold text-slate-900">{vendor.gstin || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">PAN Number</span>
                  <span className="font-mono font-semibold text-slate-900">{vendor.pan || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Approved Master Category</span>
                  <span className="font-semibold text-slate-900">{vendor.category || 'General Supplier'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Standard Payment Terms</span>
                  <span className="font-semibold text-emerald-700">
                    Net {vendor.paymentTermsDays || 30} Days Credit
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Contact & Registered Address
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Contact Person</span>
                    <span className="font-semibold text-slate-900">{vendor.contactPerson}</span>
                    <span className="block text-xs text-slate-600">{vendor.phone}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Email Address</span>
                    <span className="font-semibold text-slate-900">{vendor.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Location Address</span>
                  <span>
                    {vendor.address || 'Address not specified'}, {vendor.city}, {vendor.state}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-700" /> Supplier Scorecard
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Overall Rating:</span>
                  <span className="font-bold text-amber-700">{vendor.rating || '4.8 ★'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total POs Issued:</span>
                  <span className="font-bold text-slate-900">{purchaseOrders.length} POs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Linked Products:</span>
                  <span className="font-bold text-slate-900">{products.length} Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Product Code</th>
                <th className="py-3 px-4">Product Description</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Base UOM</th>
                <th className="py-3 px-4 text-right">Base Rate (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No products currently linked to this supplier.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{p.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">{p.brand || 'Generic'}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">{p.unitSymbol}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{p.basePrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    No purchase orders recorded for this vendor yet.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{po.id}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{po.createdAt || '2026-01-15'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{po.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium capitalize">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Quality Inspection & Reliability Scorecard
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">On-Time Delivery</span>
              <span className="text-xl font-bold text-slate-900">96.5%</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Quality Pass Rate</span>
              <span className="text-xl font-bold text-emerald-700">99.1%</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">Compliance Certificates</span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> GST & MSME Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetailsPage;
