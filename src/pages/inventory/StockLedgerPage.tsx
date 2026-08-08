/**
 * Stock Ledger & Location Balances Page
 * Location: src/pages/inventory/StockLedgerPage.tsx
 */

import React, { useState, useMemo } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import {
  Boxes,
  MapPin,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Layers,
  History,
} from 'lucide-react';

export const StockLedgerPage: React.FC = () => {
  const { state } = useERPStore();

  const stockLedger = state.stockLedger || [];
  const projects = state.projects || [];
  const locations = (state as any).locations || [
    { id: 'loc-001', name: 'Central Site Store - Basement 1' },
    { id: 'loc-002', name: 'Secondary Store Yard' },
    { id: 'loc-dest-001', name: 'Site Work Package' },
  ];

  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'balances' | 'ledger'>('balances');

  // Compute Current Balances per Location & Product
  const locationBalances = useMemo(() => {
    const map = new Map<string, {
      locationId: string;
      locationName: string;
      productId: string;
      productCode: string;
      productName: string;
      unitSymbol: string;
      totalIn: number;
      totalOut: number;
      availableStock: number;
      unitRate: number;
      totalValue: number;
    }>();

    stockLedger.forEach((entry) => {
      if (selectedLocation !== 'all' && entry.locationId !== selectedLocation) return;
      if (selectedProject !== 'all' && entry.projectId !== selectedProject) return;

      const key = `${entry.locationId}_${entry.productId}`;
      const existing = map.get(key) || {
        locationId: entry.locationId,
        locationName: entry.locationName || 'Location',
        productId: entry.productId,
        productCode: entry.productCode,
        productName: entry.productName,
        unitSymbol: entry.unitSymbol || 'units',
        totalIn: 0,
        totalOut: 0,
        availableStock: 0,
        unitRate: entry.unitRate || 0,
        totalValue: 0,
      };

      existing.totalIn += entry.inQuantity || 0;
      existing.totalOut += entry.outQuantity || 0;
      existing.availableStock = existing.totalIn - existing.totalOut;
      existing.unitRate = entry.unitRate || existing.unitRate;
      existing.totalValue = existing.availableStock * existing.unitRate;

      map.set(key, existing);
    });

    return Array.from(map.values()).filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.productCode.toLowerCase().includes(q) ||
        item.locationName.toLowerCase().includes(q)
      );
    });
  }, [stockLedger, selectedLocation, selectedProject, searchQuery]);

  // Filtered Ledger Transaction Entries
  const filteredLedgerEntries = useMemo(() => {
    return stockLedger.filter((entry) => {
      if (selectedLocation !== 'all' && entry.locationId !== selectedLocation) return false;
      if (selectedProject !== 'all' && entry.projectId !== selectedProject) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.productName.toLowerCase().includes(q) ||
        entry.productCode.toLowerCase().includes(q) ||
        entry.sourceDocumentNumber.toLowerCase().includes(q)
      );
    });
  }, [stockLedger, selectedLocation, selectedProject, searchQuery]);

  // Summary Metrics
  const totalStockValue = locationBalances.reduce((sum, item) => sum + item.totalValue, 0);
  const totalItemCount = locationBalances.length;
  const lowStockCount = locationBalances.filter((item) => item.availableStock <= 10).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Header Banner */}
      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Boxes className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100">Stock Ledger & Location Balances</h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Immutable material stock movements, location balances, and perpetual inventory audit trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'balances' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('balances')}
            className={viewMode === 'balances' ? 'bg-amber-500 text-stone-950 font-bold' : ''}
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            Location Balances
          </Button>
          <Button
            variant={viewMode === 'ledger' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('ledger')}
            className={viewMode === 'ledger' ? 'bg-amber-500 text-stone-950 font-bold' : ''}
          >
            <History className="w-3.5 h-3.5 mr-1" />
            Movement History
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 font-semibold text-[11px]">
            <span>Total Inventory Value</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-extrabold text-stone-900 font-mono">
            ₹{totalStockValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-stone-400">Across {totalItemCount} location product record(s)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 font-semibold text-[11px]">
            <span>Monitored Locations</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-extrabold text-stone-900 font-mono">
            {locations.length} Stores / Sites
          </div>
          <p className="text-[10px] text-stone-400">Central store & project work packages</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 font-semibold text-[11px]">
            <span>Low Stock Alerts</span>
            <RefreshCw className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-extrabold text-rose-700 font-mono">
            {lowStockCount} Item(s)
          </div>
          <p className="text-[10px] text-stone-400">Stock &lt;= 10 units at current location</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, code or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 border border-stone-300 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-stone-800 font-medium text-xs border-none outline-none"
              >
                <option value="all">All Store Locations</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 border border-stone-300 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent text-stone-800 font-medium text-xs border-none outline-none"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName || p.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Balances or Ledger */}
      {viewMode === 'balances' ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Current Available Stock by Location
            </h2>
            <span className="text-stone-500 text-[11px] font-medium">
              Showing {locationBalances.length} stock line(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Material Description</th>
                  <th className="py-3 px-4 text-right">Total In (GRN/Transfer)</th>
                  <th className="py-3 px-4 text-right">Total Out (Issue/Consumption)</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Valuation Rate</th>
                  <th className="py-3 px-4 text-right">Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {locationBalances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-stone-400">
                      <Boxes className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                      <p className="font-semibold text-stone-600">No stock balance records found</p>
                      <p className="text-[11px] mt-1">Post approved GRNs or material transfers to populate stock.</p>
                    </td>
                  </tr>
                ) : (
                  locationBalances.map((item, idx) => (
                    <tr key={`${item.locationId}-${item.productId}-${idx}`} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-medium text-stone-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {item.locationName}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{item.productName}</div>
                        <div className="text-[10px] font-mono text-stone-500">{item.productCode}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                        +{item.totalIn} {item.unitSymbol}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-rose-700 font-semibold">
                        -{item.totalOut} {item.unitSymbol}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-700 bg-amber-50/40">
                        {item.availableStock} {item.unitSymbol}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-stone-600">
                        ₹{item.unitRate.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                        ₹{item.totalValue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              Perpetual Stock Ledger Movements
            </h2>
            <span className="text-stone-500 text-[11px] font-medium">
              Showing {filteredLedgerEntries.length} ledger transaction(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Ref #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-right">In Qty</th>
                  <th className="py-3 px-4 text-right">Out Qty</th>
                  <th className="py-3 px-4 text-right">Unit Rate</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {filteredLedgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-stone-400">
                      <History className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                      <p className="font-semibold text-stone-600">No stock ledger transactions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLedgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-stone-900">{entry.sourceDocumentNumber}</div>
                        <div className="text-[10px] text-stone-500">{entry.entryDate}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold">
                        {entry.inQuantity > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200 font-bold">
                            <ArrowDownLeft className="w-3 h-3" />
                            {entry.entryType.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] border border-rose-200 font-bold">
                            <ArrowUpRight className="w-3 h-3" />
                            {entry.entryType.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-stone-900">{entry.locationName}</td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{entry.productName}</div>
                        <div className="text-[10px] font-mono text-stone-500">{entry.productCode}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {entry.inQuantity > 0 ? `+${entry.inQuantity} ${entry.unitSymbol}` : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                        {entry.outQuantity > 0 ? `-${entry.outQuantity} ${entry.unitSymbol}` : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-stone-600">
                        ₹{entry.unitRate.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-stone-900">
                        ₹{entry.totalValue.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-stone-500 text-[11px]">{entry.recordedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
