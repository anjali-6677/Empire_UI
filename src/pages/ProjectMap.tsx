import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Search, 
  ArrowRight, 
  Table,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSites } from '../context/SitesContext';
import { safeFormatCurrency } from '../utils/formatStatus';
import { ROUTES } from '../config/navigation';
import { SiteSchema } from '../types';

const TABS = [
  'General', 'Tender', 'Progress', 'Bills', 'Extra Items', 
  'Client Payments', 'Material Vendor Payments', 'Labour Vendor Payments', 
  'All Vendor Payments', 'Budget'
];

interface MobileExpandedState {
  [siteId: string]: boolean;
}

export const ProjectMap: React.FC = () => {
  const navigate = useNavigate();
  const { sites, setSelectedSiteId } = useSites();

  const [activeTab, setActiveTab] = React.useState('General');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('all');
  const [mobileExpanded, setMobileExpanded] = React.useState<MobileExpandedState>({});

  const cities = React.useMemo(() => Array.from(new Set(sites.map(s => s.city))), [sites]);

  const filteredSites = React.useMemo(() => {
    return sites.filter(s => {
      const matchCity = selectedCity === 'all' || s.city === selectedCity;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
                         s.name.toLowerCase().includes(q) || 
                         s.code.toLowerCase().includes(q) ||
                         (s.client && s.client.toLowerCase().includes(q)) ||
                         (s.manager && s.manager.toLowerCase().includes(q)) ||
                         (s.city && s.city.toLowerCase().includes(q));
      return matchCity && matchQuery;
    });
  }, [sites, selectedCity, searchQuery]);

  const toggleMobileExpand = (siteId: string) => {
    setMobileExpanded(prev => ({ ...prev, [siteId]: !prev[siteId] }));
  };

  const handleOpenDetails = (siteId: string, destTab: string) => {
    setSelectedSiteId(siteId);
    navigate(ROUTES.SITE_DETAILS, { state: { tab: destTab } });
  };

  const getDestTabForMapTab = (tab: string): string => {
    switch (tab) {
      case 'General': return 'Overview';
      case 'Tender': return 'Tender';
      case 'Progress': return 'Progress';
      case 'Bills': return 'Billing';
      case 'Extra Items': return 'Extra Items';
      case 'Client Payments': return 'Payments';
      case 'Material Vendor Payments': return 'Payments';
      case 'Labour Vendor Payments': return 'Payments';
      case 'All Vendor Payments': return 'Payments';
      case 'Budget': return 'Overview';
      default: return 'Overview';
    }
  };

  // ─── DESKTOP TABLE COLUMNS DEFINITION ──────────────────────────────────────
  const getTabHeaders = (tab: string): string[] => {
    switch (tab) {
      case 'General':
        return ['Client', 'Location', 'Company Entity', 'Project Head', 'Project Manager', 'Architect', 'PMC', 'Start Date', 'Target Completion', 'Status', 'Progress', 'Days Left', 'Updated By'];
      case 'Tender':
        return ['Tender Ref', 'Type', 'Scope', 'Revision', 'Start Date', 'Submission Date', 'Expected Response', 'Est Value', 'Submitted Value', 'Approved Value', 'Margin %', 'Margin Amt', 'Tender Status', 'Days Pending'];
      case 'Progress':
        return ['Project Team', 'Work Status', 'Activity Status', 'Start Date', 'Target Completion', 'Project Area', 'Approved Scope', 'Submitted Bill', 'Unsubmitted WIP', 'Time %', 'Execution %', 'Billing %', 'Days Left'];
      case 'Bills':
        return ['Billing Engineer', 'Main Tender', 'Extra Items', 'Total Scope', 'Submitted Bill', 'Approved Bill', 'Held Amount', 'Unbilled WIP', 'Billing %', 'Bill Status', 'Expected Pay Date', 'Days Pending'];
      case 'Extra Items':
        return ['Extra Item Ref', 'Scope Description', 'Revision', 'Submitted Date', 'Est Value', 'Submitted Value', 'Approved Value', 'Status', 'Response Date', 'Target Date', 'Days Pending', 'Remarks'];
      case 'Client Payments':
        return ['Client', 'Approved Bill', 'Received Amount', 'Outstanding O/S', 'Retention', 'Payment %', 'Latest Date', 'Payment Mode', 'Txn Ref', 'Status', 'Days O/S'];
      case 'Material Vendor Payments':
        return ['Purchase Team', 'Accounts Team', 'Material Vendor', 'Certified Invoice', 'Paid Amount', 'Outstanding O/S', 'Retention', 'Payment %', 'Oldest Pending Date', 'Payment Status'];
      case 'Labour Vendor Payments':
        return ['Contractor', 'Accounts Team', 'Certified Invoice', 'Paid Amount', 'Outstanding O/S', 'Retention', 'Payment %', 'Oldest Pending Date', 'Payment Status'];
      case 'All Vendor Payments':
        return ['Total Certified Invoices', 'Material Invoices', 'Labour Invoices', 'Utility Costs', 'Salary Costs', 'Total Paid', 'Total Outstanding', 'Retention', 'Overall Payment %', 'Oldest Pending Date'];
      case 'Budget':
        return ['Est Budget', 'Approved Budget', 'Approved Revisions', 'Transfers In', 'Transfers Out', 'Committed Amount', 'Actual Outlay', 'Available Budget', 'Utilisation %', 'Budget Status', 'Last Revision'];
      default:
        return [];
    }
  };

  // ─── CALCULATE DETAILED RECORD PER SITE ──────────────────────────────────
  const getSiteMapData = (site: SiteSchema, tab: string) => {
    const isNotStarted = site.executionStatus === 'not_started' || site.workflowStatus === 'draft';
    const b = isNotStarted ? 0 : site.budget;

    switch (tab) {
      case 'General':
        return {
          client: site.client,
          location: site.city,
          company: 'Flutebyte Technologies Contracting Pvt Ltd',
          projectHead: 'Rajesh Kumar',
          projectManager: site.manager,
          architect: 'Stantec Architecture Pvt Ltd',
          pmc: 'Synergy Property Development',
          startDate: site.startDate,
          targetCompletion: site.targetCompletion,
          status: site.executionStatus.toUpperCase().replace('_', ' '),
          progress: `${site.progress || 0}%`,
          daysLeft: isNotStarted ? 'TBD' : '128 Days',
          updatedBy: 'System Admin'
        };

      case 'Tender':
        return {
          tenderRef: `TND-2026-0${site.id.split('-')[1] || '1'}`,
          type: 'Turnkey Commercial Fit-Out',
          scope: 'Main Interior Fit-Out & Joinery Execution',
          revision: 'Rev 2',
          startDate: site.startDate,
          submissionDate: '2026-02-15',
          expectedResponse: '2026-03-01',
          estValue: safeFormatCurrency(site.budget * 1.15),
          submittedValue: safeFormatCurrency(site.budget * 1.05),
          approvedValue: safeFormatCurrency(b),
          marginPct: isNotStarted ? '0%' : '14.5%',
          marginAmt: safeFormatCurrency(b * 0.145),
          tenderStatus: isNotStarted ? 'Draft' : 'Approved',
          daysPending: '0 Days'
        };

      case 'Progress':
        return {
          projectTeam: 'Execution Team Alpha',
          workStatus: site.executionStatus.toUpperCase().replace('_', ' '),
          activityStatus: isNotStarted ? 'Mobilization Pending' : 'On Track',
          startDate: site.startDate,
          targetCompletion: site.targetCompletion,
          projectArea: '45,000 Sq Ft',
          approvedScope: safeFormatCurrency(b),
          submittedBill: safeFormatCurrency(b * 0.45),
          unsubmittedWIP: safeFormatCurrency(b * 0.12),
          timeProgress: isNotStarted ? '0%' : '52.5%',
          executionProgress: `${site.progress || 0}%`,
          billingProgress: isNotStarted ? '0%' : '42.0%',
          daysLeft: isNotStarted ? 'TBD' : '128 Days'
        };

      case 'Bills':
        return {
          billingEngineer: 'Ankit Sharma (Senior Billing Eng)',
          mainTender: safeFormatCurrency(b * 0.92),
          extraItems: safeFormatCurrency(b * 0.08),
          totalScope: safeFormatCurrency(b),
          submittedBill: safeFormatCurrency(b * 0.45),
          approvedBill: safeFormatCurrency(b * 0.40),
          heldAmount: safeFormatCurrency(b * 0.03),
          unbilledWIP: safeFormatCurrency(b * 0.12),
          billingProgress: isNotStarted ? '0%' : '40.0%',
          billStatus: isNotStarted ? 'Unbilled' : 'Certified',
          expectedPayDate: '2026-08-10',
          daysPending: isNotStarted ? '0 Days' : '14 Days'
        };

      case 'Extra Items':
        return {
          extraItemRef: `EXI-2026-0${site.id.split('-')[1] || '1'}`,
          scope: 'Additional Acoustic Wall Panelling & Veneers',
          revision: 'Rev 1',
          submittedDate: '2026-06-18',
          estValue: safeFormatCurrency(b * 0.10),
          submittedValue: safeFormatCurrency(b * 0.08),
          approvedValue: safeFormatCurrency(b * 0.06),
          status: isNotStarted ? 'Draft' : 'Approved',
          responseDate: '2026-07-02',
          targetDate: '2026-08-15',
          daysPending: '0 Days',
          remarks: 'Client change request approved by Architect'
        };

      case 'Client Payments':
        const appBill = b * 0.40;
        const recPay = b * 0.32;
        return {
          client: site.client,
          approvedBill: safeFormatCurrency(appBill),
          receivedAmount: safeFormatCurrency(recPay),
          outstanding: safeFormatCurrency(appBill - recPay),
          retention: safeFormatCurrency(b * 0.05),
          paymentProgress: isNotStarted ? '0%' : '80.0%',
          latestDate: isNotStarted ? 'N/A' : '2026-07-20',
          paymentMode: isNotStarted ? 'N/A' : 'RTGS / Bank Transfer',
          txnRef: isNotStarted ? 'N/A' : 'TXN-2026-904',
          status: isNotStarted ? 'Unbilled' : 'Partially Paid',
          daysOutstanding: isNotStarted ? '0 Days' : '12 Days'
        };

      case 'Material Vendor Payments':
        const matInv = b * 0.22;
        const matPaid = b * 0.16;
        return {
          purchaseTeam: 'Procurement Desk 1',
          accountsTeam: 'Accounts Payable Desk',
          materialVendor: 'Asian Paints / Century Ply',
          certifiedInvoice: safeFormatCurrency(matInv),
          paidAmount: safeFormatCurrency(matPaid),
          outstanding: safeFormatCurrency(matInv - matPaid),
          retention: safeFormatCurrency(b * 0.01),
          paymentProgress: isNotStarted ? '0%' : '72.7%',
          oldestPendingDate: isNotStarted ? 'N/A' : '2026-07-05',
          paymentStatus: isNotStarted ? 'No Bills' : 'Partially Paid'
        };

      case 'Labour Vendor Payments':
        const labInv = b * 0.12;
        const labPaid = b * 0.09;
        return {
          contractor: 'DecoCeil Infra Solutions',
          accountsTeam: 'Payroll & Subcontract Desk',
          certifiedInvoice: safeFormatCurrency(labInv),
          paidAmount: safeFormatCurrency(labPaid),
          outstanding: safeFormatCurrency(labInv - labPaid),
          retention: safeFormatCurrency(b * 0.02),
          paymentProgress: isNotStarted ? '0%' : '75.0%',
          oldestPendingDate: isNotStarted ? 'N/A' : '2026-07-10',
          paymentStatus: isNotStarted ? 'No Bills' : 'Partially Paid'
        };

      case 'All Vendor Payments':
        const totCert = b * 0.38;
        const totPaid = b * 0.28;
        return {
          totalCertified: safeFormatCurrency(totCert),
          materialInvoices: safeFormatCurrency(b * 0.22),
          labourInvoices: safeFormatCurrency(b * 0.12),
          utilityCosts: safeFormatCurrency(b * 0.02),
          salaryCosts: safeFormatCurrency(b * 0.02),
          totalPaid: safeFormatCurrency(totPaid),
          totalOutstanding: safeFormatCurrency(totCert - totPaid),
          retention: safeFormatCurrency(b * 0.03),
          overallPaymentProgress: isNotStarted ? '0%' : '73.7%',
          oldestPendingDate: isNotStarted ? 'N/A' : '2026-07-05'
        };

      case 'Budget':
        const appB = site.approvedValue || site.budget;
        const estB = (site as any).estimatedValue || (site.budget * 1.10);
        const com = isNotStarted ? 0 : b * 0.70;
        const out = isNotStarted ? 0 : b * 0.44;
        const rev = isNotStarted ? 0 : b * 0.05;
        const trIn = isNotStarted ? 0 : b * 0.02;
        const trOut = 0;
        const avail = isNotStarted ? 0 : (appB + rev + trIn - trOut - com);

        return {
          estBudget: safeFormatCurrency(estB),
          approvedBudget: safeFormatCurrency(isNotStarted ? 0 : appB),
          approvedRevisions: safeFormatCurrency(rev),
          transfersIn: safeFormatCurrency(trIn),
          transfersOut: safeFormatCurrency(trOut),
          committedAmount: safeFormatCurrency(com),
          actualOutlay: safeFormatCurrency(out),
          availableBudget: safeFormatCurrency(avail),
          utilisation: isNotStarted ? '0%' : '44.0%',
          budgetStatus: isNotStarted ? 'Draft' : 'Healthy',
          lastRevision: '2026-07-15'
        };

      default:
        return {};
    }
  };

  const renderDesktopTable = () => {
    const headers = getTabHeaders(activeTab);
    const destTab = getDestTabForMapTab(activeTab);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto relative max-w-full">
        <table className="w-full text-left font-medium text-gray-700 whitespace-nowrap text-xs border-collapse">
          <thead className="text-[9.5px] uppercase font-bold text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
            <tr>
              {/* Sticky Left Column 1: Site Code */}
              <th className="px-3.5 py-3 sticky left-0 bg-gray-50 z-40 border-r border-gray-200 min-w-[100px] w-[100px] shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                Site Code
              </th>
              {/* Sticky Left Column 2: Project Name */}
              <th className="px-3.5 py-3 sticky left-[100px] bg-gray-50 z-40 border-r border-gray-200 min-w-[200px] w-[200px] shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                Project Name
              </th>
              {/* Dynamic Columns */}
              {headers.map((h) => (
                <th key={h} className="px-3.5 py-3 border-r border-gray-150">
                  {h}
                </th>
              ))}
              {/* Sticky Right Column: Action */}
              <th className="px-3.5 py-3 sticky right-0 bg-gray-50 z-40 border-l border-gray-200 text-right min-w-[100px] w-[100px] shadow-[-2px_0_5px_rgba(0,0,0,0.04)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 font-medium text-gray-800">
            {filteredSites.map((site) => {
              const dataObj = getSiteMapData(site, activeTab);
              const fields = Object.values(dataObj);

              return (
                <tr key={site.id} className="hover:bg-brand-50/30 transition-colors">
                  {/* Sticky Site Code */}
                  <td className="px-3.5 py-2.5 sticky left-0 bg-white z-20 border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                    <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-150 px-1.5 py-0.5 rounded text-[11px]">
                      {site.code}
                    </span>
                  </td>
                  {/* Sticky Project Name */}
                  <td className="px-3.5 py-2.5 sticky left-[100px] bg-white z-20 border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                    <div className="font-extrabold text-gray-900 truncate max-w-[180px]">{site.name}</div>
                    <div className="text-[9.5px] text-gray-400 font-semibold">{site.city}</div>
                  </td>

                  {/* Field Values */}
                  {fields.map((val, idx) => (
                    <td key={idx} className="px-3.5 py-2.5 border-r border-gray-100 text-[11px]">
                      {String(val).startsWith('₹') ? (
                        <span className="font-mono font-bold text-gray-900">{val}</span>
                      ) : (
                        <span>{val}</span>
                      )}
                    </td>
                  ))}

                  {/* Sticky Action Button */}
                  <td className="px-3.5 py-2.5 sticky right-0 bg-white z-20 border-l border-gray-200 text-right shadow-[-2px_0_5px_rgba(0,0,0,0.04)]">
                    <button
                      onClick={() => handleOpenDetails(site.id, destTab)}
                      className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMobileCards = () => {
    const headers = getTabHeaders(activeTab);
    const destTab = getDestTabForMapTab(activeTab);

    return (
      <div className="space-y-3 font-sans">
        {filteredSites.map((site) => {
          const isExpanded = !!mobileExpanded[site.id];
          const dataObj = getSiteMapData(site, activeTab);
          const entries = Object.entries(dataObj);

          // Top key metrics to display when collapsed
          const topEntries = entries.slice(0, 3);
          const remainingEntries = entries.slice(3);

          return (
            <div key={site.id} className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-sm space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-150 pb-2.5">
                <div>
                  <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-1.5 py-0.5 rounded inline-block mb-1">
                    {site.code}
                  </span>
                  <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{site.name}</h3>
                  <span className="text-[10px] text-gray-400 font-semibold">{site.city} • {site.client}</span>
                </div>
                <button
                  onClick={() => handleOpenDetails(site.id, destTab)}
                  className="px-2 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded font-bold text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Primary Key Metrics (Collapsed View) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {topEntries.map(([key, val], idx) => {
                  const label = headers[idx] || key;
                  return (
                    <div key={key} className="p-2 bg-gray-50/60 rounded border border-gray-150">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">{label}</span>
                      <span className="font-bold text-gray-800 text-[11px] block mt-0.5">{String(val)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Card Fields */}
              {isExpanded && remainingEntries.length > 0 && (
                <div className="pt-2 border-t border-gray-150 space-y-2 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {remainingEntries.map(([key, val], idx) => {
                      const label = headers[idx + 3] || key;
                      return (
                        <div key={key} className="p-2 bg-gray-50/60 rounded border border-gray-150">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block">{label}</span>
                          <span className="font-bold text-gray-800 text-[11px] block mt-0.5">{String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expand / Collapse Toggle Button */}
              {remainingEntries.length > 0 && (
                <button
                  onClick={() => toggleMobileExpand(site.id)}
                  className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-600 font-bold text-[10.5px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" /> Collapse Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" /> Expand Details ({remainingEntries.length} more fields)
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full font-sans text-xs pb-14 select-none relative max-w-[1400px] mx-auto overflow-hidden">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase py-2">
        <Link to="/" className="hover:text-brand-600 p-0.5">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650">Project Portfolio</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-900 font-bold">Project Map</span>
      </nav>

      {/* Header & Controls Card */}
      <div className="bg-white border border-gray-150 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Table className="h-5 w-5 text-brand-600" />
              Project Portfolio Map
            </h1>
            <p className="text-[10.5px] text-gray-400 mt-0.5 font-medium">
              Unified cross-sectional view of pan-India site execution, tender, billing, and budget metrics.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search site code, project, client..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-250 rounded bg-white text-xs w-full sm:w-56 font-bold text-gray-800 focus:outline-none focus:border-brand-500"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 border border-gray-250 rounded bg-white text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Cities ({sites.length} Sites)</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        {/* Horizontal Scrollable Tabs */}
        <div className="border-t border-gray-150 pt-2 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-1.5">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 font-bold text-[10.5px] uppercase rounded transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tabular / Card Data Render Container */}
      <div className="flex-1 w-full relative">
        {filteredSites.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-150 rounded-lg">
            <p className="text-gray-500 font-bold mb-2">No projects found matching the selected search or city filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCity('all'); }}
              className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded text-xs font-bold hover:bg-brand-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table (Visible on md and above) */}
            <div className="hidden md:block">
              {renderDesktopTable()}
            </div>

            {/* Mobile Card Grid (Visible on screens below md) */}
            <div className="md:hidden">
              {renderMobileCards()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
