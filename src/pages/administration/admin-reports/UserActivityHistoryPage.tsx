import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { SummaryKpiCard } from '../../../components/common/SummaryKpiCard';
import { DEMO_USER_ACTIVITIES, UserActivityRecord } from '../../../data/adminReportsData';
import { exportToCSV, printReportWindow } from '../../../utils/reportExportHelpers';
import {
  History,
  Activity,
  CheckCircle,
  FilePlus,
  Edit,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Eye,
  X,
  UserCheck,
} from 'lucide-react';

export const UserActivityHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal State
  const [selectedActivity, setSelectedActivity] = useState<UserActivityRecord | null>(null);

  // Activity dataset
  const activityList: UserActivityRecord[] = useMemo(() => {
    return DEMO_USER_ACTIVITIES;
  }, []);

  // Filter Option Lists
  const userOptions = useMemo(() => {
    const set = new Set<string>();
    activityList.forEach((a) => set.add(a.userName));
    return ['All', ...Array.from(set)];
  }, [activityList]);

  const projectOptions = useMemo(() => {
    const set = new Set<string>();
    activityList.forEach((a) => {
      if (a.projectName) set.add(a.projectName);
    });
    return ['All', ...Array.from(set)];
  }, [activityList]);

  const moduleOptions = useMemo(() => {
    const set = new Set<string>();
    activityList.forEach((a) => set.add(a.module));
    return ['All', ...Array.from(set)];
  }, [activityList]);

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    activityList.forEach((a) => set.add(a.action));
    return ['All', ...Array.from(set)];
  }, [activityList]);

  // Quick Date Handlers
  const handleQuickDate = (period: 'today' | '7days' | '30days' | 'thisMonth') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (period === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (period === '7days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (period === '30days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (period === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(todayStr);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setUserFilter('All');
    setProjectFilter('All');
    setModuleFilter('All');
    setActionFilter('All');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activityList.filter((act) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        act.userName.toLowerCase().includes(q) ||
        act.referenceNumber.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        (act.projectName && act.projectName.toLowerCase().includes(q));

      const matchesUser = userFilter === 'All' || act.userName === userFilter;
      const matchesProject = projectFilter === 'All' || act.projectName === projectFilter;
      const matchesModule = moduleFilter === 'All' || act.module === moduleFilter;
      const matchesAction = actionFilter === 'All' || act.action === actionFilter;

      let matchesDate = true;
      if (fromDate || toDate) {
        const actDate = act.dateTime.split('T')[0];
        if (fromDate && actDate < fromDate) matchesDate = false;
        if (toDate && actDate > toDate) matchesDate = false;
      }

      return matchesSearch && matchesUser && matchesProject && matchesModule && matchesAction && matchesDate;
    });
  }, [activityList, searchQuery, userFilter, projectFilter, moduleFilter, actionFilter, fromDate, toDate]);

  // Pagination Calculations
  const totalRecords = filteredActivities.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  // KPI Calculations
  const totalActivitiesCount = activityList.length;
  const activitiesTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return activityList.filter((a) => a.dateTime.startsWith(todayStr)).length;
  }, [activityList]);

  const activeUsersTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const unique = new Set(activityList.filter((a) => a.dateTime.startsWith(todayStr)).map((a) => a.userName));
    return unique.size || 5;
  }, [activityList]);

  const createdRecordsCount = useMemo(() => {
    return activityList.filter((a) => a.action === 'Created' || a.action === 'Submitted').length;
  }, [activityList]);

  const updatedRecordsCount = useMemo(() => {
    return activityList.filter((a) => a.action === 'Updated' || a.action === 'Status Changed').length;
  }, [activityList]);

  const approvalActionsCount = useMemo(() => {
    return activityList.filter((a) => a.action === 'Approved' || a.action === 'Rejected').length;
  }, [activityList]);

  // Action Badge Color Helper
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Created':
      case 'Submitted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Updated':
      case 'Status Changed':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Payment Recorded':
      case 'Receipt Recorded':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Export Handlers
  const handleExportCSV = () => {
    const headers = ['Date & Time', 'User', 'Employee ID', 'Project / Site', 'Module', 'Action', 'Reference No', 'Description'];
    const rows = filteredActivities.map((a) => [
      new Date(a.dateTime).toLocaleString('en-IN'),
      a.userName,
      a.employeeId,
      a.projectName || 'General Enterprise',
      a.module,
      a.action,
      a.referenceNumber,
      a.description,
    ]);
    exportToCSV('User_Activity_History_Report', headers, rows);
  };

  const handlePrintPDF = () => {
    const headers = ['Date & Time', 'User', 'Project', 'Module', 'Action', 'Reference No', 'Description'];
    const rows = filteredActivities.map((a) => [
      new Date(a.dateTime).toLocaleString('en-IN'),
      a.userName,
      a.projectName || 'General Enterprise',
      a.module,
      a.action,
      a.referenceNumber,
      a.description,
    ]);
    printReportWindow(
      'User Activity History Report',
      'System Audit Trail & Business Transaction Log',
      headers,
      rows
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="User Activity History"
        subtitle="Audit ERP activity across users, projects, modules and business transactions."
        breadcrumbs={[
          { label: 'Administration' },
          { label: 'Admin Reports' },
          { label: 'User Activity History' },
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <SummaryKpiCard
          title="TOTAL ACTIVITIES"
          value={totalActivitiesCount}
          subtitle="All audit records"
          icon={History}
          variant="gold"
        />
        <SummaryKpiCard
          title="ACTIVITIES TODAY"
          value={activitiesTodayCount}
          subtitle="Logged events today"
          icon={Activity}
          variant="active"
        />
        <SummaryKpiCard
          title="USERS ACTIVE TODAY"
          value={activeUsersTodayCount}
          subtitle="Active team members"
          icon={UserCheck}
          variant="blue"
        />
        <SummaryKpiCard
          title="CREATED RECORDS"
          value={createdRecordsCount}
          subtitle="New & submitted entries"
          icon={FilePlus}
          variant="neutral"
        />
        <SummaryKpiCard
          title="UPDATED RECORDS"
          value={updatedRecordsCount}
          subtitle="Modifications & revisions"
          icon={Edit}
          variant="neutral"
        />
        <SummaryKpiCard
          title="APPROVAL ACTIONS"
          value={approvalActionsCount}
          subtitle="Approved or rejected"
          icon={CheckCircle}
          variant="neutral"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-xs text-gray-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#AB9570]" /> Filter Audit Trail
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">Quick Periods:</span>
            <button
              type="button"
              onClick={() => handleQuickDate('today')}
              className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate('7days')}
              className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors cursor-pointer"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate('30days')}
              className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors cursor-pointer"
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate('thisMonth')}
              className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors cursor-pointer"
            >
              This Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search Query */}
          <div className="lg:col-span-2 relative">
            <label className="block font-semibold text-gray-600 mb-1">Search User / Ref / Detail</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search user, ref no, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570]"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">User</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {userOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Project / Site</label>
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

          {/* Module Filter */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {moduleOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {actionOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1 border border-gray-300 rounded-lg focus:outline-hidden"
            />
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1 border border-gray-300 rounded-lg focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-200">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Project / Site</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4 text-center">Action</th>
                <th className="py-3 px-4">Reference Document</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400">
                    <History className="w-8 h-8 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-bold text-sm text-gray-700">No activity logs found for selected criteria.</p>
                    <p className="text-xs text-gray-400">Try broadening your date range or clearing filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50/80 transition-colors h-14 cursor-pointer"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <td className="py-2.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      {new Date(activity.dateTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {activity.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900">{activity.userName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{activity.employeeId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-medium text-gray-700">
                      {activity.projectName || <span className="italic text-gray-400">General Enterprise</span>}
                    </td>

                    <td className="py-2.5 px-4 font-bold text-gray-800">
                      {activity.module}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${getActionBadgeClass(
                          activity.action
                        )}`}
                      >
                        {activity.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      {activity.referencePath ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(activity.referencePath!);
                          }}
                          className="font-mono font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                        >
                          {activity.referenceNumber}
                          <ExternalLink className="w-3 h-3 text-amber-700" />
                        </button>
                      ) : (
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                          {activity.referenceNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate font-medium">
                      {activity.description}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(activity);
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="View Full Audit Details"
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-gray-500">
            <span>
              Showing <strong className="text-gray-900">{filteredActivities.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(currentPage * pageSize, filteredActivities.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredActivities.length}</strong> activity records
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

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#AB9570]" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">System Audit Log Record</h3>
                  <p className="text-[10.5px] text-gray-500 font-medium">Activity ID: {selectedActivity.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">User Name</span>
                  <span className="font-bold text-slate-900">{selectedActivity.userName} ({selectedActivity.employeeId})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Timestamp</span>
                  <span className="font-mono font-bold text-slate-900">
                    {new Date(selectedActivity.dateTime).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Module / Domain</span>
                  <span className="font-bold text-slate-900">{selectedActivity.module}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Project / Site</span>
                  <span className="font-medium text-slate-900">{selectedActivity.projectName || 'General Enterprise'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Action Type</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeClass(selectedActivity.action)}`}>
                    {selectedActivity.action}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[9.5px]">Reference No</span>
                  <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {selectedActivity.referenceNumber}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-bold uppercase text-[9.5px] block mb-1">Description</span>
                <p className="text-gray-800 font-medium bg-white border border-gray-200 p-3 rounded-xl leading-relaxed">
                  {selectedActivity.description}
                </p>
              </div>

              {(selectedActivity.previousValue || selectedActivity.newValue) && (
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[9.5px] block mb-1">State / Value Transition</span>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Previous State</span>
                      <span className="font-mono font-bold text-rose-700 block mt-0.5">{selectedActivity.previousValue || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">New State</span>
                      <span className="font-mono font-bold text-emerald-700 block mt-0.5">{selectedActivity.newValue || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                {selectedActivity.referencePath ? (
                  <button
                    type="button"
                    onClick={() => {
                      const path = selectedActivity.referencePath!;
                      setSelectedActivity(null);
                      navigate(path);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    View Reference Document <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityHistoryPage;
