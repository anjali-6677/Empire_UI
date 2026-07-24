import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ChevronRight, Search, ArrowRight, Table } from 'lucide-react';
import { useSites } from '../context/SitesContext';
import { useWorkflow } from '../context/WorkflowContext';
import { safeFormatCurrency } from '../utils/formatStatus';
import { ROUTES } from '../config/navigation';

const TABS = [
  'General', 'Tender', 'Progress', 'Bills', 'Extra Items', 
  'Client Payments', 'Material Vendor Payments', 'Labour Vendor Payments', 
  'All Vendor Payments', 'Budget'
];

export const ProjectMap: React.FC = () => {
  const navigate = useNavigate();
  const { sites, setSelectedSiteId } = useSites();
  const { invoices, payments, purchaseOrders } = useWorkflow();
  const [activeTab, setActiveTab] = React.useState('General');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('all');

  const cities = React.useMemo(() => Array.from(new Set(sites.map(s => s.city))), [sites]);

  const filteredSites = React.useMemo(() => {
    return sites.filter(s => {
      const matchCity = selectedCity === 'all' || s.city === selectedCity;
      const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchQuery;
    });
  }, [sites, selectedCity, searchQuery]);

  const handleOpenSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    navigate(ROUTES.SITE_DETAILS);
  };

  const getSiteData = (siteName: string, siteCode: string) => {
    const sInvoices = invoices.filter(i => i.site === siteName);
    const sPayments = payments.filter(p => p.site === siteName);
    const sPOs = purchaseOrders.filter(p => p.site === siteName || p.site === siteCode);

    return {
      totalBilled: sInvoices.reduce((a, c) => a + (c.certifiedAmount || 0), 0),
      totalPaid: sPayments.reduce((a, c) => a + (c.amount || 0), 0),
      totalPurchased: sPOs.reduce((a, c) => a + (c.amount || 0), 0)
    };
  };

  const renderTabularData = () => {
    if (filteredSites.length === 0) {
      return (
        <div className="p-8 text-center bg-white border border-gray-150 rounded-lg">
          <p className="text-gray-500 font-bold mb-2">No projects found matching the criteria.</p>
          <button onClick={() => {setSearchQuery(''); setSelectedCity('all');}} className="px-3 py-1 bg-gray-100 rounded text-gray-700">Clear Filters</button>
        </div>
      );
    }

    const TableWrapper = ({ columns, renderRow }: any) => (
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-x-auto print:shadow-none print:border-none">
        <table className="w-full text-left font-medium text-gray-700 whitespace-nowrap min-w-max">
          <thead className="text-[10px] uppercase text-gray-400 bg-gray-50 border-b border-gray-150 sticky top-0 z-10 hidden sm:table-header-group">
            <tr>
              <th className="px-4 py-3">Site Code</th>
              <th className="px-4 py-3">Project Name</th>
              {columns.map((c: string) => <th key={c} className="px-4 py-3">{c}</th>)}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs flex-1 sm:flex-none">
            {filteredSites.map(site => (
              <tr key={site.id} className="hover:bg-brand-50/30 transition-colors flex flex-col mb-4 sm:mb-0 sm:table-row border border-gray-100 sm:border-0 rounded sm:rounded-none">
                <td className="px-4 py-3 sm:py-2">
                  <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded">{site.code}</span>
                  <div className="sm:hidden font-bold text-sm text-gray-900 mt-1">{site.name}</div>
                </td>
                <td className="px-4 py-3 sm:py-2 hidden sm:table-cell">
                  <div className="font-bold text-gray-900">{site.name}</div>
                  <div className="text-[9.5px] text-gray-500">{site.city}</div>
                </td>
                {renderRow(site)}
                <td className="px-4 py-3 sm:py-2 text-right">
                  <button onClick={() => handleOpenSite(site.id)} className="w-full sm:w-auto px-3 py-1 text-brand-600 font-bold border border-brand-200 rounded hover:bg-brand-50 flex items-center justify-center gap-1">
                    Details <ArrowRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    switch (activeTab) {
      case 'General':
        return <TableWrapper columns={['Client', 'Manager', 'Status']} renderRow={(site: any) => (
          <>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Client:</span>{site.client}</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Manager:</span>{site.manager}</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Status:</span><span className="capitalize text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-100">Live</span></td>
          </>
        )} />;
      case 'Tender':
        return <TableWrapper columns={['Est Value', 'Submitted Value', 'Approved Value', 'Margin']} renderRow={(site: any) => (
          <>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Est Value:</span>{safeFormatCurrency(site.budget * 1.15)}</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Submitted:</span>{safeFormatCurrency(site.budget * 1.05)}</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Approved:</span><span className="text-emerald-700 font-bold">{safeFormatCurrency(site.budget)}</span></td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Margin:</span>14.5%</td>
          </>
        )} />;
      case 'Progress':
        return <TableWrapper columns={['Time Elapsed', 'Execution', 'Billing', 'Budget Auth']} renderRow={(site: any) => (
          <>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Time:</span>65%</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Execution:</span>{site.progress || 50}%</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Billing:</span><span className="text-brand-600 font-bold">45%</span></td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Budget:</span><span className="text-rose-600 font-bold">51%</span></td>
          </>
        )} />;
      case 'Bills':
        return <TableWrapper columns={['Total BOQ', 'Certified Bills', 'Unbilled WIP']} renderRow={(site: any) => {
          const { totalBilled } = getSiteData(site.name, site.code);
          return (
          <>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">BOQ:</span>{safeFormatCurrency(site.budget)}</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Certified:</span><span className="font-bold text-emerald-700">{safeFormatCurrency(totalBilled || site.budget * 0.4)}</span></td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Unbilled:</span>{safeFormatCurrency(site.budget * 0.1)}</td>
          </>
          );
        }} />;
      case 'Extra Items':
        return <TableWrapper columns={['Submitted Additions', 'Approved Additions']} renderRow={(site: any) => (
          <>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Submitted:</span>{safeFormatCurrency(site.budget * 0.05)}</td>
            <td className="px-4 py-2"><span className="sm:hidden text-gray-400 text-[10px] uppercase mr-2">Approved:</span><span className="font-bold text-brand-700">{safeFormatCurrency(site.budget * 0.02)}</span></td>
          </>
        )} />;
      case 'Client Payments':
        return <TableWrapper columns={['Certified Bills', 'Received Recpt', 'Outstanding O/S']} renderRow={(site: any) => {
          const { totalBilled } = getSiteData(site.name, site.code);
          const received = (totalBilled || site.budget * 0.4) * 0.9;
          return (
          <>
            <td className="px-4 py-2">{safeFormatCurrency(totalBilled || site.budget * 0.4)}</td>
            <td className="px-4 py-2"><span className="font-bold text-emerald-700">{safeFormatCurrency(received)}</span></td>
            <td className="px-4 py-2 text-rose-600 font-bold">{safeFormatCurrency((totalBilled || site.budget * 0.4) - received)}</td>
          </>
        );}} />;
      case 'Material Vendor Payments':
        return <TableWrapper columns={['Committed POs', 'Vendor Payments', 'Overdue Liability']} renderRow={(site: any) => {
          const { totalPurchased, totalPaid } = getSiteData(site.name, site.code);
          return (
          <>
            <td className="px-4 py-2">{safeFormatCurrency(totalPurchased || site.budget * 0.6)}</td>
            <td className="px-4 py-2 text-brand-700 font-bold">{safeFormatCurrency(totalPaid || site.budget * 0.4)}</td>
            <td className="px-4 py-2 text-rose-600">{safeFormatCurrency(site.budget * 0.05)}</td>
          </>
        );}} />;
      case 'Labour Vendor Payments':
        return <TableWrapper columns={['Work Orders', 'Certified Labour Invoices', 'Holding Retention']} renderRow={(site: any) => (
          <>
            <td className="px-4 py-2">{safeFormatCurrency(site.budget * 0.25)}</td>
            <td className="px-4 py-2 text-amber-700">{safeFormatCurrency(site.budget * 0.15)}</td>
            <td className="px-4 py-2">{safeFormatCurrency(site.budget * 0.02)}</td>
          </>
        )} />;
      case 'All Vendor Payments':
        return <TableWrapper columns={['Gross Commitments', 'Total Vendor Outflow']} renderRow={(site: any) => {
           const { totalPurchased, totalPaid } = getSiteData(site.name, site.code);
           return (
          <>
            <td className="px-4 py-2 font-bold">{safeFormatCurrency((totalPurchased || site.budget * 0.6) + site.budget * 0.25)}</td>
            <td className="px-4 py-2 font-bold text-rose-700">{safeFormatCurrency((totalPaid || site.budget * 0.4) + site.budget * 0.15)}</td>
          </>
        );}} />;
      case 'Budget':
        return <TableWrapper columns={['Approved BOQ', 'Allocated Costs', 'Net Outlay', 'Available Variance']} renderRow={(site: any) => {
           const { totalPurchased } = getSiteData(site.name, site.code);
           const layout = totalPurchased || site.budget * 0.6;
           return (
          <>
            <td className="px-4 py-2 text-emerald-700 font-bold">{safeFormatCurrency(site.budget)}</td>
            <td className="px-4 py-2">{safeFormatCurrency(layout)}</td>
            <td className="px-4 py-2">{safeFormatCurrency(layout * 0.8)}</td>
            <td className="px-4 py-2 text-brand-600 font-extrabold">{safeFormatCurrency(site.budget - layout)}</td>
          </>
        );}} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full font-sans text-xs pb-14 select-none relative max-w-[1400px] mx-auto overflow-hidden">
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase py-2">
        <Link to="/" className="hover:text-brand-600 p-0.5"><Home className="h-3.5 w-3.5" /></Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-650">Project Portfolio</span>
      </nav>

      <div className="bg-white border border-gray-150 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Table className="h-5 w-5 text-brand-600" />
              Project Portfolio Map
            </h1>
            <p className="text-[10.5px] text-gray-400 mt-1">Unified cross-sectional view of pan-India site data metrics.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-250 rounded bg-white text-xs w-full sm:w-48 font-bold text-gray-800"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 border border-gray-250 rounded bg-white text-xs font-bold text-gray-800"
            >
              <option value="all">All Cities ({sites.length} Sites)</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        {/* Horizontal Scrollable Tabs */}
        <div className="border-t border-gray-150 pt-2 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 font-bold text-[10px] uppercase rounded transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {renderTabularData()}
      </div>
    </div>
  );
};
