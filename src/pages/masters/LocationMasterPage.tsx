/**
 * Location Master Page
 * Location: src/pages/masters/LocationMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { LocationMaster } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  MapPin,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Boxes,
} from 'lucide-react';

export const LocationMasterPage: React.FC = () => {
  const { state, createLocation, updateLocation, toggleLocationStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationMaster | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationMaster['type']>('Corporate Office');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [country, setCountry] = useState('India');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const locations = state.locations || [];
  const stockLocations = state.stockLocations || [];

  const filteredLocations = locations.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.address && l.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalActive = locations.filter((l) => l.status === 'Active').length;

  const handleOpenModal = (loc?: LocationMaster) => {
    setErrorMessage(null);
    if (loc) {
      setEditingLoc(loc);
      setCode(loc.code);
      setName(loc.name);
      setType(loc.type);
      setAddress(loc.address || '');
      setCity(loc.city);
      setStateName(loc.state || '');
      setPinCode(loc.pinCode || '');
      setCountry(loc.country || 'India');
    } else {
      setEditingLoc(null);
      setCode(`LOC-${String(locations.length + 1).padStart(3, '0')}`);
      setName('');
      setType('Corporate Office');
      setAddress('');
      setCity('Mumbai');
      setStateName('Maharashtra');
      setPinCode('');
      setCountry('India');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim() || !city.trim()) {
      setErrorMessage('Location Code, Name, and City are required.');
      return;
    }

    if (editingLoc) {
      const res = updateLocation(editingLoc.id, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
        country: country.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update location.');
        return;
      }
    } else {
      const res = createLocation({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
        country: country.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create location.');
        return;
      }
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <MapPin className="h-6 w-6 text-[#B39A6A]" />
            Location Master
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage geographical locations, regional hubs, offices, yards, and site locations.
          </p>
        </div>
        <PrimaryActionButton
          label="Add Location"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Locations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{locations.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Locations</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalActive}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Linked Stock Stores</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stockLocations.length}</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Location Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="Corporate Office">Corporate Office</option>
            <option value="Regional Office">Regional Office</option>
            <option value="Warehouse">Warehouse & Logistics Hub</option>
            <option value="Project Site">Project Site Location</option>
            <option value="Yard">Fabrication Yard</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, city, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">City & State</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-center">Linked Stores</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No locations found.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((l) => {
                  const storesCount = stockLocations.filter(
                    (s) => s.locationId === l.id || s.locationName === l.name
                  ).length;

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Location',
                      icon: Edit,
                      onClick: () => handleOpenModal(l),
                    },
                    {
                      id: 'toggle_status',
                      label: l.status === 'Active' ? 'Deactivate Location' : 'Activate Location',
                      icon: l.status === 'Active' ? XCircle : CheckCircle,
                      variant: l.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => toggleLocationStatus(l.id),
                    },
                  ];

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{l.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{l.name}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                          {l.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        <div className="font-semibold">{l.city}</div>
                        <div className="text-slate-500">{l.state}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{l.address || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold inline-flex items-center gap-1">
                          <Boxes className="h-3 w-3" />
                          {storesCount} stores
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            l.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${l.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Location */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingLoc ? 'Edit Location' : 'Create New Location'}
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOC-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Regional Office">Regional Office</option>
                    <option value="Warehouse">Warehouse & Logistics Hub</option>
                    <option value="Project Site">Project Site Location</option>
                    <option value="Yard">Fabrication Yard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhiwandi Central Logistics Yard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address, building name, plot number..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 400013"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingLoc ? 'Save Location' : 'Create Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMasterPage;
