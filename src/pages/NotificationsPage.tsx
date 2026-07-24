import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  Home, 
  CheckCircle2
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, markAlertRead, markAllAlertsRead, deleteAlert } = useWorkflow();

  const [userScope, setUserScope] = React.useState<'my' | 'other'>('my');
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread' | 'read' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [toast, setToast] = React.useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAlerts = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

    return alerts.filter((a: any) => {
      const isMyAlert = a.alertFor === 'Amit Dev';
      if (userScope === 'my' && !isMyAlert) return false;
      if (userScope === 'other' && isMyAlert) return false;

      if (activeTab === 'unread') {
        if (a.readStatus !== 'unread') return false;
      } else if (activeTab === 'read') {
        if (a.readStatus !== 'read') return false;
      } else if (activeTab === 'upcoming') {
        if (!a.dueDate || a.dueDate < today || a.dueDate > sevenDaysLater) return false;
      } else if (activeTab === 'past') {
        if (!a.dueDate || a.dueDate >= today) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          (a.alertCode && a.alertCode.toLowerCase().includes(q)) ||
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.relatedSite && a.relatedSite.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [alerts, userScope, activeTab, searchQuery]);

  const unreadCount = React.useMemo(() => {
    return alerts.filter((a: any) => a.alertFor === 'Amit Dev' && a.readStatus === 'unread').length;
  }, [alerts]);

  return (
    <div className="space-y-4 font-sans text-xs pb-12 select-none relative">
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-emerald-700 text-white px-4 py-2.5 rounded shadow-lg font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span>Overview</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-700 font-bold">Notifications & System Alerts</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-600" />
            Notifications & System Alerts Pipeline
          </h1>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            Real-time notifications for rate approvals, budget revisions, GRN exceptions, and client payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* User Scope Toggle */}
          <div className="bg-gray-100 p-0.5 rounded flex items-center border text-[10.5px]">
            <button
              onClick={() => setUserScope('my')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${userScope === 'my' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              My Alerts ({unreadCount})
            </button>
            <button
              onClick={() => setUserScope('other')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${userScope === 'other' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Other User Alerts
            </button>
          </div>

          {markAllAlertsRead && unreadCount > 0 && (
            <button
              onClick={() => {
                markAllAlertsRead();
                triggerToast('Marked all alerts as read.');
              }}
              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded font-bold text-xs flex items-center gap-1.5 border border-brand-200 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Alerts', count: alerts.length },
            { id: 'unread', label: 'Unread Alerts', count: alerts.filter((a: any) => a.readStatus === 'unread').length, color: 'text-rose-600 font-bold' },
            { id: 'read', label: 'Read Alerts', count: alerts.filter((a: any) => a.readStatus === 'read').length },
            { id: 'upcoming', label: 'Upcoming 7 Days', count: alerts.filter((a: any) => a.dueDate && a.dueDate >= new Date().toISOString().split('T')[0]).length },
            { id: 'past', label: 'Past / Expired', count: alerts.filter((a: any) => a.dueDate && a.dueDate < new Date().toISOString().split('T')[0]).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer border ${activeTab === tab.id ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-gray-50/50 border-gray-150 text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label} <span className={`ml-1 px-1.5 py-0.25 rounded text-[9.5px] bg-white border ${tab.color || 'text-gray-700'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full sm:w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-700 font-medium"
          />
        </div>
      </div>

      {/* Notifications Cards / List */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 italic">
            No system notifications found matching your selection.
          </div>
        ) : (
          filteredAlerts.map((a: any) => (
            <div
              key={a.id}
              className={`p-4 bg-white border rounded-lg shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${a.readStatus === 'unread' ? 'border-l-4 border-l-brand-600 border-gray-200 bg-brand-50/10' : 'border-gray-200 opacity-90'}`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-extrabold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                    {a.alertCode || 'ALT-REC'}
                  </span>
                  <h3 className={`text-xs font-extrabold ${a.readStatus === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                    {a.title}
                  </h3>
                  <span className={`px-2 py-0.25 rounded text-[9px] font-extrabold uppercase ${a.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : a.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                    {a.priority || 'Medium'}
                  </span>
                  {a.readStatus === 'unread' && (
                    <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse" title="Unread" />
                  )}
                </div>

                <p className="text-gray-600 font-medium text-[11.5px] leading-snug">
                  {a.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-400 pt-1">
                  <span>Project Site: <strong className="text-gray-700">{a.relatedSite}</strong></span>
                  <span>•</span>
                  <span>Raised By: <strong className="text-gray-700">{a.raisedBy}</strong></span>
                  <span>•</span>
                  <span>Alert Date: <strong className="font-mono text-gray-700">{a.alertDate}</strong></span>
                  {a.dueDate && (
                    <>
                      <span>•</span>
                      <span>Due: <strong className="font-mono text-rose-700">{a.dueDate}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 justify-end">
                {a.readStatus === 'unread' ? (
                  <button
                    onClick={() => {
                      markAlertRead(a.id);
                      triggerToast('Marked notification as read');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-[11px] rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 text-brand-600" /> Mark Read
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold italic px-2">Read</span>
                )}

                {a.relatedRoute && (
                  <button
                    onClick={() => navigate(a.relatedRoute)}
                    className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold text-[11px] rounded flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View Record
                  </button>
                )}

                {deleteAlert && (
                  <button
                    onClick={() => {
                      deleteAlert(a.id);
                      triggerToast('Deleted notification');
                    }}
                    className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Delete Alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
