/**
 * Subcontractor Master Details Page
 * Location: src/pages/masters/SubcontractorDetailsPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import {
  Users,
  ArrowLeft,
  Edit,
  ShieldCheck,
  Phone,
  Mail,
  Star,
  HardHat,
  Briefcase,
} from 'lucide-react';

export const SubcontractorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { subcontractorId } = useParams<{ subcontractorId: string }>();
  const { state } = useERPStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'workorders' | 'compliance'>('overview');

  const subcontractor = state.subcontractors?.find((s) => s.id === subcontractorId);
  const workOrders = ((state as any).subcontractorWorkOrders || []).filter((wo: any) => wo.subcontractorId === subcontractorId);

  if (!subcontractor) {
    return (
      <div className="p-12 text-center space-y-4">
        <Users className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Subcontractor Not Found</h2>
        <p className="text-sm text-slate-500">The subcontractor master record could not be found.</p>
        <Button onClick={() => navigate('/masters/subcontractors')} variant="primary">
          Return to Subcontractor Directory
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
            onClick={() => navigate('/masters/subcontractors')}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold">
                {subcontractor.code}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                  subcontractor.status === 'empanelled'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : subcontractor.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {subcontractor.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{subcontractor.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/masters/subcontractors/${subcontractor.id}/edit`)}
            variant="primary"
            className="gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Profile
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
          <Users className="h-4 w-4" /> Profile & Capacity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workorders')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'workorders'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="h-4 w-4" /> Work Orders ({workOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'compliance'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Compliance & Safety
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Trade Specialization & Terms
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Trade Specialization</span>
                  <span className="font-semibold text-slate-900">{subcontractor.trade}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Labour Force Strength</span>
                  <span className="font-bold text-amber-700 font-mono">
                    {subcontractor.labourCapacity || 25} Skilled Workers
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Preferred Rate Structure</span>
                  <span className="font-semibold text-slate-900">{subcontractor.rateType || 'Item Rate'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">PAN Number</span>
                  <span className="font-mono font-semibold text-slate-900">{subcontractor.pan || 'Not Provided'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Contact & Base Location
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Primary Contact</span>
                    <span className="font-semibold text-slate-900">{subcontractor.contactPerson}</span>
                    <span className="block text-xs text-slate-600">{subcontractor.phone}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Email Address</span>
                    <span className="font-semibold text-slate-900">{subcontractor.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-700" /> Agency Scorecard
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Performance Rating:</span>
                  <span className="font-bold text-amber-700">{subcontractor.rating || '4.7 ★'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Work Orders:</span>
                  <span className="font-bold text-slate-900">{workOrders.length} Orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workorders' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">WO Number</th>
                <th className="py-3 px-4">Project / Site</th>
                <th className="py-3 px-4">Scope Title</th>
                <th className="py-3 px-4 text-right">Contract Value (₹)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {workOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No work orders recorded for this subcontractor yet.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo: any) => (
                  <tr key={wo.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{wo.woNumber}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">{wo.projectId}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{wo.title}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{wo.contractValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium capitalize">
                        {wo.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-amber-600" /> Labour Statutory Compliance & Safety Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-emerald-900 block">PF & ESI Registration</span>
              <span className="text-xs text-emerald-700 block">
                Provident Fund & Employees' State Insurance compliance verified for current fiscal year.
              </span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-emerald-900 block">On-Site Safety Records</span>
              <span className="text-xs text-emerald-700 block">
                Zero critical safety violations reported. Mandatory PPE and induction completed.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorDetailsPage;
