import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ExternalLink, 
  Home, 
  X
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { calendarEvents, tasks, alerts } = useWorkflow();

  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 6, 1)); // July 2026
  const [viewMode, setViewMode] = React.useState<'month' | 'agenda'>('month');
  const [userScope, setUserScope] = React.useState<'my' | 'other'>('my');
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);

  // Combine calendarEvents + Tasks + Alerts for full event coverage
  const allEvents = React.useMemo(() => {
    const combined: any[] = [...calendarEvents];

    tasks.forEach((t: any) => {
      combined.push({
        id: `task-evt-${t.id}`,
        title: `[Task] ${t.subject}`,
        date: t.dueDate,
        type: 'task',
        userScope: t.assignedTo === 'Amit Dev' ? 'my' : 'other',
        relatedSite: t.relatedSite,
        relatedRecord: t.taskCode,
        relatedRoute: '/overview/my-tasks',
        details: `Assigned By: ${t.assignedBy} | Priority: ${t.priority.toUpperCase()}`
      });
    });

    alerts.forEach((a: any) => {
      if (a.dueDate) {
        combined.push({
          id: `alert-evt-${a.id}`,
          title: `[Alert] ${a.title}`,
          date: a.dueDate,
          type: 'alert',
          userScope: a.alertFor === 'Amit Dev' ? 'my' : 'other',
          relatedSite: a.relatedSite,
          relatedRecord: a.alertCode,
          relatedRoute: '/overview/notifications',
          details: a.description
        });
      }
    });

    return combined.filter((e) => {
      if (userScope === 'my' && e.userScope !== 'my') return false;
      if (userScope === 'other' && e.userScope !== 'other') return false;
      return true;
    });
  }, [calendarEvents, tasks, alerts, userScope]);

  // Calendar Month Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(2026, 6, 24)); // Fixed ERP date anchor

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter((e) => e.date === dayStr);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'alert': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'delivery': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'invoice': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'tender': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'milestone': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs pb-12 select-none relative">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span>Overview</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-700 font-bold">Project & Execution Calendar</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-brand-600" />
            Project & Deliverables Calendar
          </h1>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            Consolidated timeline of task due dates, material delivery arrivals, invoice settlements, and tender deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* User Scope Toggle */}
          <div className="bg-gray-100 p-0.5 rounded flex items-center border text-[10.5px]">
            <button
              onClick={() => setUserScope('my')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${userScope === 'my' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              My Calendar
            </button>
            <button
              onClick={() => setUserScope('other')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${userScope === 'other' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Other Users
            </button>
          </div>

          {/* View Toggle */}
          <div className="bg-gray-100 p-0.5 rounded flex items-center border text-[10.5px]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${viewMode === 'month' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${viewMode === 'agenda' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Agenda List
            </button>
          </div>

          <button
            onClick={() => navigate('/overview/my-tasks')}
            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Task or Alert
          </button>
        </div>
      </div>

      {/* Month Navigation Control Bar */}
      <div className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-bold rounded cursor-pointer"
          >
            Today (Jul 24)
          </button>
        </div>

        <h2 className="text-sm font-extrabold text-gray-900 tracking-wide uppercase">{monthName}</h2>

        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-gray-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Task</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Alert</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Delivery</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Invoice</span>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'month' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center font-extrabold uppercase text-[10px] text-gray-400 py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-150 min-h-[500px]">
            {/* Empty Offset Boxes */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-gray-50/40 p-2 min-h-[90px]" />
            ))}

            {/* Day Boxes */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayEvts = getEventsForDay(day);
              const isToday = day === 24 && month === 6;

              return (
                <div key={day} className={`p-1.5 min-h-[90px] flex flex-col justify-start transition-colors ${isToday ? 'bg-brand-50/20 ring-1 ring-inset ring-brand-400' : 'hover:bg-gray-50/50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center font-extrabold text-[11px] ${isToday ? 'bg-brand-600 text-white' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {dayEvts.length > 0 && (
                      <span className="text-[9px] font-bold text-gray-400">{dayEvts.length} event{dayEvts.length > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                    {dayEvts.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className={`w-full text-left p-1 rounded border text-[9.5px] font-bold truncate block transition-transform hover:scale-[1.01] cursor-pointer ${getEventBadgeColor(e.type)}`}
                      >
                        {e.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View List */
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
          <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider border-b pb-2">Upcoming Deliverables & Events Agenda</h3>
          <div className="divide-y divide-gray-150">
            {allEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-400 italic">No events recorded in agenda calendar.</div>
            ) : (
              allEvents.map((e) => (
                <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 px-2 rounded">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded text-center shrink-0 border w-[70px]">
                      <span className="font-mono font-bold text-xs text-brand-700 block">{e.date}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.25 rounded text-[9px] font-extrabold uppercase border ${getEventBadgeColor(e.type)}`}>
                          {e.type}
                        </span>
                        <h4 className="font-extrabold text-xs text-gray-900">{e.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{e.details}</p>
                      <span className="text-[9.5px] font-bold text-gray-400 block mt-1">Site: {e.relatedSite}</span>
                    </div>
                  </div>

                  {e.relatedRoute && (
                    <button
                      onClick={() => navigate(e.relatedRoute)}
                      className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold border border-brand-200 rounded flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Record
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white rounded-lg border max-w-sm w-full p-4 shadow-2xl space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase border ${getEventBadgeColor(selectedEvent.type)}`}>
                {selectedEvent.type}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-gray-900">{selectedEvent.title}</h3>
              <p className="text-gray-600 font-medium text-[11px] mt-1 bg-gray-50 p-2 rounded border">{selectedEvent.details}</p>
            </div>

            <div className="space-y-1 bg-gray-50 p-2.5 rounded border text-[11px]">
              <div><strong className="text-gray-400 uppercase text-[9px]">Event Date:</strong> <span className="font-mono font-bold text-gray-800">{selectedEvent.date}</span></div>
              <div><strong className="text-gray-400 uppercase text-[9px]">Project Site:</strong> <span className="font-bold text-gray-800">{selectedEvent.relatedSite}</span></div>
              {selectedEvent.relatedRecord && <div><strong className="text-gray-400 uppercase text-[9px]">Record Ref:</strong> <span className="font-mono font-bold text-brand-700">{selectedEvent.relatedRecord}</span></div>}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              {selectedEvent.relatedRoute ? (
                <button
                  onClick={() => navigate(selectedEvent.relatedRoute)}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Related Record
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
