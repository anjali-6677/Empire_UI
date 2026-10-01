import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../../store/ERPStoreContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { SummaryKpiCard } from '../../../components/common/SummaryKpiCard';
import { exportToCSV, printReportWindow } from '../../../utils/reportExportHelpers';
import {
  Contact,
  Users,
  Building2,
  Truck,
  HardHat,
  Search,
  Download,
  Printer,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  BadgeCheck,
} from 'lucide-react';

export interface UnifiedContact {
  id: string;
  name: string;
  companyName: string;
  contactType: 'Client' | 'Vendor' | 'Subcontractor' | 'Internal Team' | 'Architect' | 'PMC';
  contactPerson: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  gstin?: string;
  city: string;
  address?: string;
  department?: string;
  designation?: string;
  tradeCategory?: string;
  associatedProjects: string[];
  sourceMaster: 'Client Master' | 'Vendor Master' | 'Subcontractor Master' | 'Employee Master' | 'Architect Master' | 'PMC Master';
  masterPath?: string;
}

export const ContactsDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useERPStore();

  const clients = state.clients || [];
  const vendors = state.vendors || [];
  const subcontractors = state.subcontractors || [];
  const employees = state.employees || [];
  const architects = state.architects || [];
  const pmcs = state.pmcs || [];
  const projects = state.projects || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [alphaFilter, setAlphaFilter] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal State
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);

  // Dynamically compile unified contacts list from Master Data
  const unifiedContactsList: UnifiedContact[] = useMemo(() => {
    const list: UnifiedContact[] = [];

    // 1. Clients
    clients.forEach((c) => {
      list.push({
        id: `client-${c.id}`,
        name: c.contactPerson || c.name || c.companyName,
        companyName: c.companyName || c.name,
        contactType: 'Client',
        contactPerson: c.contactPerson || c.name,
        phone: c.phone || '+91 98201 11223',
        email: c.email || `contact@${(c.companyName || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        gstin: c.gstin,
        city: c.city || 'Mumbai',
        address: c.address,
        associatedProjects: projects.filter((p) => p.clientName === c.name || p.clientId === c.id).map((p) => p.name || 'Unnamed Project'),
        sourceMaster: 'Client Master',
        masterPath: `/masters/clients/${c.id}`,
      });
    });

    // 2. Vendors
    vendors.forEach((v) => {
      list.push({
        id: `vendor-${v.id}`,
        name: v.contactPerson || v.name,
        companyName: v.name || v.companyName || 'Vendor Enterprise',
        contactType: 'Vendor',
        contactPerson: v.contactPerson || v.name,
        phone: v.phone || '+91 98190 44556',
        email: v.email || `sales@${(v.name || 'vendor').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        gstin: v.gstin,
        city: v.city || 'Mumbai',
        address: v.address,
        tradeCategory: v.category,
        associatedProjects: ['Nouveau Penthouse Fitout', 'Grand Hyatt Executive Lounge'],
        sourceMaster: 'Vendor Master',
        masterPath: `/masters/vendors/${v.id}`,
      });
    });

    // 3. Subcontractors
    subcontractors.forEach((s) => {
      list.push({
        id: `subcontractor-${s.id}`,
        name: s.contactPerson || s.name,
        companyName: s.name,
        contactType: 'Subcontractor',
        contactPerson: s.contactPerson || s.name,
        phone: s.phone || '+91 98670 99887',
        email: s.email || `contracts@${(s.name || 'subcontractor').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        gstin: s.gstin,
        city: s.city || 'Mumbai',
        tradeCategory: s.tradeCategory || s.trade,
        associatedProjects: ['Nouveau Penthouse Fitout', 'Imperial Heights Villa'],
        sourceMaster: 'Subcontractor Master',
        masterPath: `/masters/subcontractors/${s.id}`,
      });
    });

    // 4. Employees / Internal Team
    employees.forEach((e) => {
      list.push({
        id: `emp-${e.id}`,
        name: e.name,
        companyName: 'Flutebyte Technologies Pvt. Ltd.',
        contactType: 'Internal Team',
        contactPerson: e.name,
        phone: e.phone || '+91 98450 12345',
        email: e.email || `${e.name.toLowerCase().replace(/\s+/g, '.')}@flutebyte.com`,
        city: 'Mumbai HQ',
        department: e.departmentName || 'Project Execution',
        designation: e.designationName || 'Engineer',
        associatedProjects: ['Nouveau Penthouse Fitout', 'Grand Hyatt Executive Lounge', 'Imperial Heights Villa'],
        sourceMaster: 'Employee Master',
        masterPath: '/administration/users',
      });
    });

    // 5. Architects (if present)
    architects.forEach((a) => {
      list.push({
        id: `arch-${a.id}`,
        name: (a as any).contactPerson || (a as any).name || (a as any).firmName,
        companyName: (a as any).firmName || (a as any).name || 'Architectural Design Studio',
        contactType: 'Architect',
        contactPerson: (a as any).contactPerson || (a as any).name,
        phone: (a as any).phone || '+91 98330 44332',
        email: (a as any).email || 'studio@architects.in',
        city: (a as any).city || 'Mumbai',
        associatedProjects: ['Nouveau Penthouse Fitout'],
        sourceMaster: 'Architect Master',
        masterPath: '/masters/architects',
      });
    });

    // 6. PMCs (if present)
    pmcs.forEach((p) => {
      list.push({
        id: `pmc-${p.id}`,
        name: (p as any).contactPerson || (p as any).name || (p as any).companyName,
        companyName: (p as any).companyName || (p as any).name || 'PMC Consultancy',
        contactType: 'PMC',
        contactPerson: (p as any).contactPerson || (p as any).name,
        phone: (p as any).phone || '+91 98210 66778',
        email: (p as any).email || 'projects@pmcconsult.com',
        city: (p as any).city || 'Mumbai',
        associatedProjects: ['Grand Hyatt Executive Lounge'],
        sourceMaster: 'PMC Master',
        masterPath: '/masters/pmc',
      });
    });

    // Fallback prototype dataset if master lists are limited, ensuring 15-20 data-dense entries
    if (list.length < 12) {
      const fallbackItems: UnifiedContact[] = [
        {
          id: 'fc-1',
          name: 'Rajesh Kumar',
          companyName: 'Flutebyte Technologies Pvt. Ltd.',
          contactType: 'Internal Team',
          contactPerson: 'Rajesh Kumar',
          phone: '+91 98450 12345',
          email: 'rajesh.k@flutebyte.com',
          city: 'Mumbai HQ',
          department: 'Project Execution',
          designation: 'Project Director',
          associatedProjects: ['Nouveau Penthouse Fitout', 'Grand Hyatt Executive Lounge'],
          sourceMaster: 'Employee Master',
          masterPath: '/administration/users',
        },
        {
          id: 'fc-2',
          name: 'Anita Rao',
          companyName: 'Flutebyte Technologies Pvt. Ltd.',
          contactType: 'Internal Team',
          contactPerson: 'Anita Rao',
          phone: '+91 98220 54321',
          email: 'anita.r@flutebyte.com',
          city: 'Mumbai HQ',
          department: 'Project Execution',
          designation: 'Project Manager',
          associatedProjects: ['Nouveau Penthouse Fitout'],
          sourceMaster: 'Employee Master',
          masterPath: '/administration/users',
        },
        {
          id: 'fc-3',
          name: 'Amitabh Sen',
          companyName: 'Flutebyte Technologies Pvt. Ltd.',
          contactType: 'Internal Team',
          contactPerson: 'Amitabh Sen',
          phone: '+91 98110 78901',
          email: 'amitabh.s@flutebyte.com',
          city: 'Mumbai HQ',
          department: 'Procurement',
          designation: 'Procurement Head',
          associatedProjects: ['Nouveau Penthouse Fitout', 'Imperial Heights Villa'],
          sourceMaster: 'Employee Master',
          masterPath: '/administration/users',
        },
        {
          id: 'fc-4',
          name: 'Sneha Kulkarni',
          companyName: 'Flutebyte Technologies Pvt. Ltd.',
          contactType: 'Internal Team',
          contactPerson: 'Sneha Kulkarni',
          phone: '+91 98450 56789',
          email: 'sneha.k@flutebyte.com',
          city: 'Mumbai HQ',
          department: 'Finance & Accounts',
          designation: 'Finance Manager',
          associatedProjects: ['Nouveau Penthouse Fitout', 'Grand Hyatt Executive Lounge'],
          sourceMaster: 'Employee Master',
          masterPath: '/administration/users',
        },
        {
          id: 'fc-5',
          name: 'Vikram Malhotra',
          companyName: 'Oberoi Realty Developers',
          contactType: 'Client',
          contactPerson: 'Vikram Malhotra',
          phone: '+91 98200 99887',
          email: 'v.malhotra@oberoirealty.com',
          gstin: '27AAAC0011B1ZM',
          city: 'Mumbai',
          address: 'Oberoi Commerz II, International Business Park, Goregaon East',
          associatedProjects: ['Nouveau Penthouse Fitout'],
          sourceMaster: 'Client Master',
          masterPath: '/masters/clients',
        },
        {
          id: 'fc-6',
          name: 'Siddharth Merchant',
          companyName: 'Century Plyboards India Ltd',
          contactType: 'Vendor',
          contactPerson: 'Siddharth Merchant',
          phone: '+91 98191 22334',
          email: 's.merchant@centuryply.com',
          gstin: '27AAACC1234A1Z5',
          city: 'Mumbai',
          tradeCategory: 'Wooden Joinery & Millwork',
          address: 'Plot 45, MIDC Industrial Area, Andheri East',
          associatedProjects: ['Nouveau Penthouse Fitout'],
          sourceMaster: 'Vendor Master',
          masterPath: '/masters/vendors',
        },
        {
          id: 'fc-7',
          name: 'Ramesh Carpenter',
          companyName: 'Apex Joinery & Fitout Works',
          contactType: 'Subcontractor',
          contactPerson: 'Ramesh Carpenter',
          phone: '+91 98671 44556',
          email: 'info@apexjoinery.in',
          gstin: '27BCCPV5678D1Z9',
          city: 'Thane',
          tradeCategory: 'Carpentry & Veneer Panelling',
          associatedProjects: ['Nouveau Penthouse Fitout'],
          sourceMaster: 'Subcontractor Master',
          masterPath: '/masters/subcontractors',
        },
        {
          id: 'fc-8',
          name: 'Ketan Shah',
          companyName: 'Philips Lighting India Ltd',
          contactType: 'Vendor',
          contactPerson: 'Ketan Shah',
          phone: '+91 98332 55667',
          email: 'k.shah@philips.com',
          gstin: '27AAAAP9988C1Z2',
          city: 'Mumbai',
          tradeCategory: 'Electrical & Lighting',
          associatedProjects: ['Grand Hyatt Executive Lounge'],
          sourceMaster: 'Vendor Master',
          masterPath: '/masters/vendors',
        },
        {
          id: 'fc-9',
          name: 'Karan Design Lead',
          companyName: 'Studio Lotus Architects',
          contactType: 'Architect',
          contactPerson: 'Karan Design Lead',
          phone: '+91 98100 33445',
          email: 'projects@studiolotus.in',
          city: 'New Delhi',
          associatedProjects: ['Nouveau Penthouse Fitout'],
          sourceMaster: 'Architect Master',
          masterPath: '/masters/architects',
        },
        {
          id: 'fc-10',
          name: 'Alok Gupta',
          companyName: 'Synergy PMC Consultants',
          contactType: 'PMC',
          contactPerson: 'Alok Gupta',
          phone: '+91 98212 77889',
          email: 'a.gupta@synergypmc.com',
          city: 'Mumbai',
          associatedProjects: ['Grand Hyatt Executive Lounge'],
          sourceMaster: 'PMC Master',
          masterPath: '/masters/pmc',
        },
      ];
      list.push(...fallbackItems);
    }

    return list;
  }, [clients, vendors, subcontractors, employees, architects, pmcs, projects]);

  // Cities Options for Filter
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    unifiedContactsList.forEach((c) => set.add(c.city));
    return ['All', ...Array.from(set)];
  }, [unifiedContactsList]);

  // Project Options for Filter
  const projectOptions = useMemo(() => {
    const set = new Set<string>();
    unifiedContactsList.forEach((c) => {
      c.associatedProjects.forEach((p) => set.add(p));
    });
    return ['All', ...Array.from(set)];
  }, [unifiedContactsList]);

  // Alphabet List
  const alphabets = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setProjectFilter('All');
    setCityFilter('All');
    setAlphaFilter('ALL');
    setCurrentPage(1);
  };

  // Filtered Contacts Dataset
  const filteredContacts = useMemo(() => {
    return unifiedContactsList.filter((contact) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        contact.name.toLowerCase().includes(q) ||
        contact.companyName.toLowerCase().includes(q) ||
        contact.contactPerson.toLowerCase().includes(q) ||
        contact.phone.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        (contact.gstin && contact.gstin.toLowerCase().includes(q));

      const matchesType = typeFilter === 'All' || contact.contactType === typeFilter;
      const matchesCity = cityFilter === 'All' || contact.city === cityFilter;
      const matchesProject =
        projectFilter === 'All' || contact.associatedProjects.some((p) => p === projectFilter);

      let matchesAlpha = true;
      if (alphaFilter !== 'ALL') {
        const firstLetter = (contact.contactPerson || contact.companyName).charAt(0).toUpperCase();
        matchesAlpha = firstLetter === alphaFilter;
      }

      return matchesSearch && matchesType && matchesCity && matchesProject && matchesAlpha;
    });
  }, [unifiedContactsList, searchQuery, typeFilter, cityFilter, projectFilter, alphaFilter]);

  // Pagination Calculations
  const totalRecords = filteredContacts.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, currentPage, pageSize]);

  // KPI Calculations
  const totalContactsCount = unifiedContactsList.length;
  const clientContactsCount = unifiedContactsList.filter((c) => c.contactType === 'Client').length;
  const vendorContactsCount = unifiedContactsList.filter((c) => c.contactType === 'Vendor').length;
  const subcontractorContactsCount = unifiedContactsList.filter((c) => c.contactType === 'Subcontractor').length;
  const internalTeamCount = unifiedContactsList.filter((c) => c.contactType === 'Internal Team').length;

  // Type Badge Class Helper
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Client':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Vendor':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Subcontractor':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Internal Team':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Architect':
      case 'PMC':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Company / Firm Name',
      'Contact Person',
      'Contact Type',
      'Phone',
      'Email',
      'City / Address',
      'GSTIN',
      'Source Master',
    ];
    const rows = filteredContacts.map((c) => [
      c.companyName,
      c.contactPerson,
      c.contactType,
      c.phone,
      c.email,
      `${c.city} ${c.address ? '- ' + c.address : ''}`,
      c.gstin || '-',
      c.sourceMaster,
    ]);
    exportToCSV('Contacts_Directory_Report', headers, rows);
  };

  const handlePrintPDF = () => {
    const headers = ['Company Name', 'Contact Person', 'Type', 'Phone', 'Email', 'City', 'Source Master'];
    const rows = filteredContacts.map((c) => [
      c.companyName,
      c.contactPerson,
      c.contactType,
      c.phone,
      c.email,
      c.city,
      c.sourceMaster,
    ]);
    printReportWindow(
      'Flutebyte Business Contacts Directory',
      'Unified Master Data Contacts across Clients, Vendors, Subcontractors & Internal Team',
      headers,
      rows
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="Contacts Directory"
        subtitle="Search business contacts across clients, vendors, subcontractors and internal project teams."
        breadcrumbs={[
          { label: 'Administration' },
          { label: 'Admin Reports' },
          { label: 'Contacts Directory' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500" /> Export CSV
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryKpiCard
          title="TOTAL CONTACTS"
          value={totalContactsCount}
          subtitle="Unified master contacts"
          icon={Contact}
          variant="gold"
        />
        <SummaryKpiCard
          title="CLIENT CONTACTS"
          value={clientContactsCount}
          subtitle="Corporate & owners"
          icon={Building2}
          variant="blue"
        />
        <SummaryKpiCard
          title="VENDOR CONTACTS"
          value={vendorContactsCount}
          subtitle="Suppliers & OEMs"
          icon={Truck}
          variant="active"
        />
        <SummaryKpiCard
          title="SUBCONTRACTORS"
          value={subcontractorContactsCount}
          subtitle="Trade partners"
          icon={HardHat}
          variant="neutral"
        />
        <SummaryKpiCard
          title="INTERNAL TEAM"
          value={internalTeamCount}
          subtitle="Flutebyte personnel"
          icon={Users}
          variant="neutral"
        />
      </div>

      {/* Filter Toolbar & Alphabet Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <label className="block font-semibold text-gray-600 mb-1">Search Contacts</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, company, phone, email, GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570]"
              />
            </div>
          </div>

          {/* Contact Type */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Contact Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              <option value="All">All Contact Types</option>
              <option value="Client">Clients</option>
              <option value="Vendor">Vendors</option>
              <option value="Subcontractor">Subcontractors</option>
              <option value="Internal Team">Internal Team</option>
              <option value="Architect">Architects</option>
              <option value="PMC">PMCs</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Associated Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {projectOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Location / City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alphabet Quick Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-bold text-gray-500 mr-1 uppercase">Index:</span>
            {alphabets.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => {
                  setAlphaFilter(letter);
                  setCurrentPage(1);
                }}
                className={`w-6 h-6 rounded font-extrabold text-[10.5px] transition-colors cursor-pointer flex items-center justify-center ${
                  alphaFilter === letter
                    ? 'bg-[#AB9570] text-slate-950 shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-200">
                <th className="py-3 px-4">Company / Organization</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Source Master</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400">
                    <Contact className="w-8 h-8 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-bold text-sm text-gray-700">No contacts match the filter index.</p>
                    <p className="text-xs text-gray-400">Try clearing index filters or searching another keyword.</p>
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50/70 transition-colors h-14 cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="py-2.5 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {contact.companyName.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900">{contact.companyName}</span>
                          {contact.gstin && (
                            <span className="text-[10px] font-mono text-gray-400 block">GST: {contact.gstin}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${getTypeBadgeClass(
                          contact.contactType
                        )}`}
                      >
                        {contact.contactType}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-gray-800">
                      {contact.contactPerson}
                      {contact.designation && (
                        <span className="block text-[10.5px] font-normal text-gray-400">{contact.designation}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono font-semibold text-amber-800 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-amber-600" />
                        {contact.phone}
                      </a>
                    </td>

                    <td className="py-2.5 px-4">
                      <a
                        href={`mailto:${contact.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-blue-700 hover:underline flex items-center gap-1 max-w-xs truncate"
                      >
                        <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                        {contact.email}
                      </a>
                    </td>

                    <td className="py-2.5 px-4 text-gray-600 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {contact.city}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                        <BadgeCheck className="w-3 h-3 text-amber-600" />
                        {contact.sourceMaster}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="View Contact Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-gray-500">
            <span>
              Showing <strong className="text-gray-900">{filteredContacts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(currentPage * pageSize, filteredContacts.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredContacts.length}</strong> contacts
            </span>

            <div className="flex items-center gap-1.5 ml-4">
              <span className="text-[11px] font-semibold">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs font-bold text-gray-800 bg-white cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-300 rounded-lg text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-300 rounded-lg text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTACT DETAILS MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Contact className="w-5 h-5 text-[#AB9570]" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Contact Profile Overview</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-slate-50 border border-gray-200 p-3.5 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {selectedContact.companyName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedContact.companyName}</h4>
                  <p className="text-gray-500 font-medium">Contact: {selectedContact.contactPerson}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${getTypeBadgeClass(selectedContact.contactType)}`}>
                    {selectedContact.contactType}
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-white border border-gray-200 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Phone Number</span>
                  <a href={`tel:${selectedContact.phone}`} className="font-mono font-bold text-amber-800 hover:underline">
                    {selectedContact.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Email Address</span>
                  <a href={`mailto:${selectedContact.email}`} className="font-bold text-blue-700 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                {selectedContact.gstin && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold uppercase text-[9.5px]">GSTIN</span>
                    <span className="font-mono font-bold text-gray-800">{selectedContact.gstin}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">City / Location</span>
                  <span className="font-bold text-gray-800">{selectedContact.city}</span>
                </div>
                {selectedContact.tradeCategory && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold uppercase text-[9.5px]">Category / Trade</span>
                    <span className="font-bold text-gray-800">{selectedContact.tradeCategory}</span>
                  </div>
                )}
              </div>

              {selectedContact.associatedProjects.length > 0 && (
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[9.5px] block mb-1">Associated Projects</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.associatedProjects.map((p) => (
                      <span key={p} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[10.5px] font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Source: {selectedContact.sourceMaster}
                </span>

                <div className="flex items-center gap-2">
                  {selectedContact.masterPath && (
                    <button
                      type="button"
                      onClick={() => {
                        const path = selectedContact.masterPath!;
                        setSelectedContact(null);
                        navigate(path);
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      Master Record <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsDirectoryPage;
