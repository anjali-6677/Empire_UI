import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { useSites } from '../context/SitesContext';
import { formatIndianCurrency } from '../utils/format';

export const ProjectMap: React.FC = () => {
  const navigate = useNavigate();
  const { sites, setSelectedSiteId } = useSites();
  const [selectedCity, setSelectedCity] = React.useState<string>('all');

  const cities = React.useMemo(() => {
    const list = sites.map((s) => s.city);
    return Array.from(new Set(list));
  }, [sites]);

  const filteredSites = React.useMemo(() => {
    return sites.filter((s) => selectedCity === 'all' || s.city === selectedCity);
  }, [sites, selectedCity]);

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span>Projects</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 font-bold">Interactive Project Map</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">Pan-India Construction Site Map</h1>
          <p className="text-[10.5px] text-gray-400 font-medium">Geographic distribution and active execution status across metro regions.</p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400">Filter Region:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border border-gray-250 rounded p-1.5 bg-white font-bold text-xs text-gray-800 focus:outline-none"
          >
            <option value="all">All Cities ({sites.length} Sites)</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Abstract Map Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden min-h-[320px] flex flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(#ab9570_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between text-slate-300 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-400" />
            <span className="font-extrabold text-sm text-white">EMPIRE INTERIOR SITE NETWORK</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">ACTIVE REGIONAL HUBS: BENGALURU • MUMBAI • GOA • DELHI</span>
        </div>

        {/* Map Location Nodes */}
        <div className="relative z-10 my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              onClick={() => {
                setSelectedSiteId(site.id);
                navigate('/');
              }}
              className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-brand-500 rounded-lg p-3 cursor-pointer transition-all space-y-2 group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-brand-400 bg-brand-950/60 border border-brand-800/60 px-1.5 py-0.5 rounded">
                  {site.code}
                </span>
                <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {site.city}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-xs text-white group-hover:text-brand-300 transition-colors truncate">{site.name}</h3>
                <span className="text-[9.5px] text-slate-400 block">{site.client}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px]">
                <span className="text-slate-400">Budget: <strong className="text-slate-200">{formatIndianCurrency(site.budget)}</strong></span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800 pt-3">
          Click any site node to load its operational dashboard context
        </div>
      </div>

      {/* Site Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">Regional Site Directory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSites.map((site) => (
            <div key={site.id} className="p-4 border border-gray-150 rounded-lg bg-white shadow-sm space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
                  {site.code}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{site.city}</span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{site.name}</h4>
                <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">Client: {site.client} • Category: {site.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded text-[10.5px] font-medium">
                <div>
                  <span className="text-gray-400 block text-[8.5px] uppercase">Manager:</span>
                  <span className="font-bold text-gray-800">{site.manager}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[8.5px] uppercase">Budget:</span>
                  <span className="font-bold text-brand-700">{formatIndianCurrency(site.budget)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSiteId(site.id);
                  navigate('/');
                }}
                className="w-full py-1.5 bg-gray-900 hover:bg-black text-white font-bold rounded text-[10.5px] transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                Open Site Dashboard <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
