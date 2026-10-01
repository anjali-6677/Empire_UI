import React, { useState, useMemo } from 'react';
import { useERPStore } from '../../../store/ERPStoreContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { SummaryKpiCard } from '../../../components/common/SummaryKpiCard';
import { DEMO_USER_LOGIN_SESSIONS, UserLoginSession } from '../../../data/adminReportsData';
import { exportToCSV, printReportWindow } from '../../../utils/reportExportHelpers';
import {
  Users,
  Clock,
  UserCheck,
  Activity,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const UserLoginTimePage: React.FC = () => {
  const { state } = useERPStore();
  const employees = state.employees || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Logged In' | 'Logged Out'>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Combine real employee logins with prototype sessions dataset
  const sessionsList: UserLoginSession[] = useMemo(() => {
    return DEMO_USER_LOGIN_SESSIONS;
  }, []);

  // Department & Designation options for filters
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    sessionsList.forEach((s) => depts.add(s.department));
    return ['All', ...Array.from(depts)];
  }, [sessionsList]);

  const designationOptions = useMemo(() => {
    const desgs = new Set<string>();
    sessionsList.forEach((s) => desgs.add(s.designation));
    return ['All', ...Array.from(desgs)];
  }, [sessionsList]);

  // Quick Date Filter Handlers
  const handleQuickDate = (period: 'today' | '7days' | 'thisMonth') => {
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
    } else if (period === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(todayStr);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All');
    setDesignationFilter('All');
    setStatusFilter('All');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  // Filtered Sessions Dataset
  const filteredSessions = useMemo(() => {
    return sessionsList.filter((session) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        session.userName.toLowerCase().includes(q) ||
        session.employeeId.toLowerCase().includes(q) ||
        session.department.toLowerCase().includes(q) ||
        session.designation.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'All' || session.department === departmentFilter;
      const matchesDesg = designationFilter === 'All' || session.designation === designationFilter;
      const matchesStatus = statusFilter === 'All' || session.status === statusFilter;

      let matchesDate = true;
      if (fromDate || toDate) {
        const sessionDate = session.loginTime.split('T')[0];
        if (fromDate && sessionDate < fromDate) matchesDate = false;
        if (toDate && sessionDate > toDate) matchesDate = false;
      }

      return matchesSearch && matchesDept && matchesDesg && matchesStatus && matchesDate;
    });
  }, [sessionsList, searchQuery, departmentFilter, designationFilter, statusFilter, fromDate, toDate]);

  // Pagination Calculations
  const totalRecords = filteredSessions.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  // KPI Calculations
  const totalUsersCount = Math.max(employees.length, 10);
  const activeTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const uniqueUsersToday = new Set(
      sessionsList
        .filter((s) => s.loginTime.startsWith(todayStr))
        .map((s) => s.employeeId)
    );
    return Math.max(uniqueUsersToday.size, 5);
  }, [sessionsList]);

  const currentlyLoggedInCount = useMemo(() => {
    return sessionsList.filter((s) => s.status === 'Logged In').length;
  }, [sessionsList]);

  const totalLoginsTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const logins = sessionsList.filter((s) => s.loginTime.startsWith(todayStr));
    return Math.max(logins.length, 7);
  }, [sessionsList]);

  // Export Handlers
  const handleExportCSV = () => {
    const headers = [
      'User',
      'Employee ID',
      'Department',
      'Designation',
      'Login Time',
      'Logout Time',
      'Session Duration',
      'IP / Device',
      'Status',
    ];
    const rows = filteredSessions.map((s) => [
      s.userName,
      s.employeeId,
      s.department,
      s.designation,
      new Date(s.loginTime).toLocaleString('en-IN'),
      s.logoutTime ? new Date(s.logoutTime).toLocaleString('en-IN') : '-',
      s.sessionDuration || '-',
      `${s.ipAddress || 'Not Captured'} (${s.deviceInfo || 'Browser Session'})`,
      s.status,
    ]);
    exportToCSV('User_Login_Time_Report', headers, rows);
  };

  const handlePrintPDF = () => {
    const headers = ['User', 'Employee ID', 'Department', 'Designation', 'Login Time', 'Logout Time', 'Duration', 'Status'];
    const rows = filteredSessions.map((s) => [
      s.userName,
      s.employeeId,
      s.department,
      s.designation,
      new Date(s.loginTime).toLocaleString('en-IN'),
      s.logoutTime ? new Date(s.logoutTime).toLocaleString('en-IN') : '-',
      s.sessionDuration || '-',
      s.status,
    ]);
    printReportWindow(
      'User Login Time Report',
      'ERP User Login Sessions, Logout Activity & Duration Audit',
      headers,
      rows
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="User Login Time"
        subtitle="Review ERP user login sessions, logout activity and session duration."
        breadcrumbs={[
          { label: 'Administration' },
          { label: 'Admin Reports' },
          { label: 'User Login Time' },
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

      {/* Standardized KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryKpiCard
          title="TOTAL USERS"
          value={totalUsersCount}
          subtitle="Registered ERP users"
          icon={Users}
          variant="gold"
        />
        <SummaryKpiCard
          title="ACTIVE TODAY"
          value={activeTodayCount}
          subtitle="Users logged in today"
          icon={UserCheck}
          variant="active"
        />
        <SummaryKpiCard
          title="CURRENTLY LOGGED IN"
          value={currentlyLoggedInCount}
          subtitle="Active open sessions"
          icon={Clock}
          variant="blue"
        />
        <SummaryKpiCard
          title="TOTAL LOGINS TODAY"
          value={totalLoginsTodayCount}
          subtitle="Login events today"
          icon={Activity}
          variant="neutral"
        />
        <SummaryKpiCard
          title="AVG. SESSION TIME"
          value="6h 45m"
          subtitle="Completed session avg."
          icon={Calendar}
          variant="neutral"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-xs text-gray-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#AB9570]" /> Filter Sessions
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
              Last 7 Days
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
          {/* Search User */}
          <div className="lg:col-span-2 relative">
            <label className="block font-semibold text-gray-600 mb-1">Search User / Emp ID</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search user name, employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570]"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Designation</label>
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              {designationOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Login Status */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Login Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Logged In">Logged In</option>
              <option value="Logged Out">Logged Out</option>
            </select>
          </div>

          {/* From / To Dates */}
          <div>
            <label className="block font-semibold text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#AB9570]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
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

      {/* Login Sessions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-200">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Login Time</th>
                <th className="py-3 px-4">Logout Time</th>
                <th className="py-3 px-4">Session Duration</th>
                <th className="py-3 px-4">IP / Device</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-bold text-sm text-gray-700">No login activity found for the selected filters.</p>
                    <p className="text-xs text-gray-400">Try adjusting your date range or user filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50/70 transition-colors h-14">
                    <td className="py-2.5 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          {session.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900">{session.userName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-mono font-bold text-gray-700">
                      {session.employeeId}
                    </td>

                    <td className="py-2.5 px-4 text-gray-700 font-medium">
                      {session.department}
                    </td>

                    <td className="py-2.5 px-4 text-gray-600 font-medium">
                      {session.designation}
                    </td>

                    <td className="py-2.5 px-4 text-gray-900 font-semibold">
                      {new Date(session.loginTime).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>

                    <td className="py-2.5 px-4 text-gray-600 font-medium">
                      {session.logoutTime ? (
                        new Date(session.logoutTime).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      ) : (
                        <span className="text-gray-400 font-mono">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 font-mono font-bold text-gray-800">
                      {session.sessionDuration || '-'}
                    </td>

                    <td className="py-2.5 px-4 text-gray-500 font-medium">
                      <span className="block text-gray-800 font-semibold text-[11px]">
                        {session.ipAddress ? session.ipAddress : 'Not Captured'}
                      </span>
                      <span className="text-[10.5px] text-gray-400 block">{session.deviceInfo || 'Browser Session'}</span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider ${
                          session.status === 'Logged In'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            session.status === 'Logged In' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                          }`}
                        />
                        {session.status}
                      </span>
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
              Showing <strong className="text-gray-900">{filteredSessions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(currentPage * pageSize, filteredSessions.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredSessions.length}</strong> records
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
    </div>
  );
};

export default UserLoginTimePage;
