/**
 * Warehouse / Store Locations Master Page
 * Location: src/pages/masters/StockLocationsPage.tsx
 */

import React, { useState } from 'react';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import { Warehouse, Plus, Search, Edit, CheckCircle, XCircle } from 'lucide-react';

interface StockLocation {
  id: string;
  code: string;
  name: string;
  type: 'Central Warehouse' | 'Regional Yard' | 'Project Site Store';
  city: string;
  address: string;
  managerName: string;
  phone: string;
  isActive: boolean;
}

const DEFAULT_LOCATIONS: StockLocation[] = [
  {
    id: 'loc-1',
    code: 'WH-MAIN-01',
    name: 'Central Logistics Hub & Main Warehouse',
    type: 'Central Warehouse',
    city: 'Mumbai',
    address: 'Plot 45, Bhiwandi Logistics Park',
    managerName: 'Ramesh Sawant',
    phone: '+91 98200 11223',
    isActive: true,
  },
  {
    id: 'loc-2',
    code: 'YARD-PUNE-01',
    name: 'West Region Fabrication Yard',
    type: 'Regional Yard',
    city: 'Pune',
    address: 'Chakan Industrial Phase II',
    managerName: 'Anil Deshmukh',
    phone: '+91 98900 33445',
    isActive: true,
  },
  {
    id: 'loc-3',
    code: 'STORE-SITE-101',
    name: 'Apex Tower Site Store Room',
    type: 'Project Site Store',
    city: 'Mumbai',
    address: 'Apex Tower Project Site, Worli',
    managerName: 'Sanjay Verma',
    phone: '+91 97690 55667',
    isActive: true,
  },
];

export const StockLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<StockLocation[]>(DEFAULT_LOCATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState<StockLocation | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'Central Warehouse' | 'Regional Yard' | 'Project Site Store'>('Central Warehouse');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');

  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (loc?: StockLocation) => {
    if (loc) {
      setEditingLoc(loc);
      setCode(loc.code);
      setName(loc.name);
      setType(loc.type);
      setCity(loc.city);
      setAddress(loc.address);
      setManagerName(loc.managerName);
      setPhone(loc.phone);
    } else {
      setEditingLoc(null);
      setCode(`STORE-${String(locations.length + 1).padStart(3, '0')}`);
      setName('');
      setType('Central Warehouse');
      setCity('');
      setAddress('');
      setManagerName('');
      setPhone('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingLoc) {
      setLocations(
        locations.map((l) =>
          l.id === editingLoc.id
            ? { ...l, code: code.toUpperCase(), name, type, city, address, managerName, phone }
            : l
        )
      );
    } else {
      const newLoc: StockLocation = {
        id: `loc-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        type,
        city,
        address,
        managerName,
        phone,
        isActive: true,
      };
      setLocations([...locations, newLoc]);
    }
    setShowModal(false);
  };

  const handleToggleActive = (loc: StockLocation) => {
    setLocations(
      locations.map((l) => (l.id === loc.id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Warehouse className="h-6 w-6 text-[#B39A6A]" />
            Warehouse & Locations
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage central stores, regional yards and site locations.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Location
        </Button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search warehouse code, name, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th className="py-3 px-4">Location Code</th>
              <th className="py-3 px-4">Warehouse / Store Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">City / Address</th>
              <th className="py-3 px-4">Store In-Charge</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredLocations.map((l) => {
              const rowActions: MasterActionItem[] = [
                {
                  id: 'edit',
                  label: 'Edit Location',
                  icon: Edit,
                  onClick: () => handleOpenModal(l),
                },
                {
                  id: 'toggle_active',
                  label: l.isActive ? 'Deactivate' : 'Activate',
                  icon: l.isActive ? XCircle : CheckCircle,
                  variant: l.isActive ? 'destructive' : 'primary',
                  onClick: () => handleToggleActive(l),
                },
              ];

              return (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{l.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{l.name}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                      {l.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900 block">{l.city}</span>
                    <span className="text-slate-500">{l.address}</span>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className="font-semibold text-slate-900 block">{l.managerName}</span>
                    <span className="text-slate-500">{l.phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        l.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {l.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <MasterRowActionsMenu ariaLabel={`Actions for ${l.name}`} actions={rowActions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingLoc ? 'Edit Store Location' : 'Add Store Location'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH-MAIN-02"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Region Central Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Central Warehouse">Central Warehouse</option>
                  <option value="Regional Yard">Regional Yard</option>
                  <option value="Project Site Store">Project Site Store</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navi Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Store Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Patil"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98200 99887"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Physical Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Store Location
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLocationsPage;
