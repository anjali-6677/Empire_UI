/**
 * Client Master Details Page
 * Location: src/pages/masters/ClientDetailsPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export const ClientDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { state } = useERPStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');

  const client = state.clients?.find((c) => c.id === clientId);
  const projects = state.projects?.filter((p) => p.clientId === clientId) || [];

  if (!client) {
    return (
      <div className="p-12 text-center space-y-4">
        <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Client Not Found</h2>
        <p className="text-sm text-slate-500">The client master record could not be found.</p>
        <Button onClick={() => navigate('/masters/clients')} variant="primary">
          Return to Client Directory
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
            onClick={() => navigate('/masters/clients')}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold">
                {client.code}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  client.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{client.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/masters/clients/${client.id}/edit`)}
            variant="primary"
            className="gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Client Details
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
          <Building2 className="h-4 w-4" /> Overview & GST
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'projects'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="h-4 w-4" /> Associated Projects ({projects.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Statutory & Classification Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Classification</span>
                  <span className="font-semibold text-slate-900">{client.type || 'Corporate'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">GSTIN Number</span>
                  <span className="font-mono font-semibold text-slate-900">{client.gstin || 'Unregistered'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Billing Terms</span>
                  <span className="font-semibold text-emerald-700">
                    Net {client.paymentTermsDays || 30} Days Credit
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Primary Representative & Address
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Contact Representative</span>
                    <span className="font-semibold text-slate-900">{client.contactPerson}</span>
                    <span className="block text-xs text-slate-600">{client.phone}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Email Address</span>
                    <span className="font-semibold text-slate-900">{client.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Billing Address</span>
                  <span>
                    {client.address || 'Address not specified'}, {client.city}, {client.state}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700" /> Account Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Projects:</span>
                  <span className="font-bold text-slate-900">{projects.length} Sites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Project Code</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    No active projects linked to this client.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{p.projectCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.projectName}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{(p as any).siteLocation || 'Site'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium capitalize">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientDetailsPage;
