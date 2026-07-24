import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Eye,
  Play,
  Check,
  X,
  Home
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { useSites } from '../context/SitesContext';
import { StatusBadge } from '../components/StatusBadge';

export const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, reassignTask, addRecord } = useWorkflow();
  const { sites } = useSites();

  // Filters & State
  const [userScope, setUserScope] = React.useState<'my' | 'other'>('my');
  const [activeTab, setActiveTab] = React.useState<'all' | 'overdue' | 'upcoming' | 'in_progress' | 'pending_acceptance' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [reassignModalTask, setReassignModalTask] = React.useState<any>(null);
  const [reassignTarget, setReassignTarget] = React.useState('Rohan Verma');
  const [toast, setToast] = React.useState<string | null>(null);

  // New Task Form State
  const [newSubject, setNewSubject] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newAssignedTo, setNewAssignedTo] = React.useState('Amit Dev');
  const newAssignedBy = 'Amit Dev';
  const [newSite, setNewSite] = React.useState(sites[0]?.name || 'Nexus Tech Park');
  const newModule = 'Procurement';
  const newRecord = 'PO-2026-101';
  const [newPriority, setNewPriority] = React.useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [newDueDate, setNewDueDate] = React.useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filter Tasks
  const filteredTasks = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

    return tasks.filter((t: any) => {
      // User scope filter
      const isMyTask = t.assignedTo === 'Amit Dev';
      if (userScope === 'my' && !isMyTask) return false;
      if (userScope === 'other' && isMyTask) return false;

      // Status / tab filter
      if (activeTab === 'overdue') {
        if (t.status !== 'overdue' && (t.status === 'completed' || t.dueDate >= today)) return false;
      } else if (activeTab === 'upcoming') {
        if (t.dueDate < today || t.dueDate > sevenDaysLater || t.status === 'completed') return false;
      } else if (activeTab === 'in_progress') {
        if (t.status !== 'in_progress') return false;
      } else if (activeTab === 'pending_acceptance') {
        if (t.status !== 'pending_acceptance') return false;
      } else if (activeTab === 'completed') {
        if (t.status !== 'completed') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          (t.taskCode && t.taskCode.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.relatedSite && t.relatedSite.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [tasks, userScope, activeTab, searchQuery]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newTask = {
      id: `t-${Date.now()}`,
      taskCode: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      subject: newSubject.trim(),
      description: newDescription.trim(),
      assignedTo: newAssignedTo,
      assignedBy: newAssignedBy,
      relatedSite: newSite,
      relatedModule: newModule,
      relatedRecord: newRecord,
      relatedRoute: '/overview/my-tasks',
      priority: newPriority,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      status: 'in_progress',
      readDate: new Date().toISOString().split('T')[0]
    };

    addRecord('tasks', newTask);
    triggerToast(`Task ${newTask.taskCode} created successfully!`);
    setIsCreateOpen(false);
    setNewSubject('');
    setNewDescription('');
  };

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalTask) return;
    if (reassignTask) {
      reassignTask(reassignModalTask.id, reassignTarget);
    }
    triggerToast(`Reassigned ${reassignModalTask.taskCode} to ${reassignTarget}`);
    setReassignModalTask(null);
  };

  const getOverdueDays = (dueDate: string, status?: string) => {
    if (status === 'completed') return 0;
    const due = new Date(dueDate).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - due) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  };

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
        <span className="text-gray-700 font-bold">My Tasks & Action Items</span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-brand-600" />
            My Assigned Tasks & Action Items
          </h1>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            Track urgent site tasks, approval signoffs and deliverable milestones assigned to your account.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* User Scope Toggle */}
          <div className="bg-gray-100 p-0.5 rounded flex items-center border text-[10.5px]">
            <button
              onClick={() => setUserScope('my')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${userScope === 'my' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setUserScope('other')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${userScope === 'other' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Other User Tasks
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-lg">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'overdue', label: 'Overdue', count: tasks.filter((t: any) => t.status === 'overdue' || (t.status !== 'completed' && t.dueDate < new Date().toISOString().split('T')[0])).length, color: 'text-rose-600' },
            { id: 'upcoming', label: 'Upcoming 7 Days', count: tasks.filter((t: any) => t.status === 'upcoming').length, color: 'text-blue-600' },
            { id: 'in_progress', label: 'In Progress', count: tasks.filter((t: any) => t.status === 'in_progress').length, color: 'text-amber-600' },
            { id: 'pending_acceptance', label: 'Completion Acceptance Pending', count: tasks.filter((t: any) => t.status === 'pending_acceptance').length, color: 'text-purple-600' },
            { id: 'completed', label: 'Completed', count: tasks.filter((t: any) => t.status === 'completed').length, color: 'text-emerald-700' }
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

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 text-gray-700 font-medium"
          />
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/80 text-gray-400 uppercase text-[9.5px] font-extrabold border-b border-gray-200">
              <th className="p-3">Task ID</th>
              <th className="p-3">Subject & Description</th>
              <th className="p-3">Project Site</th>
              <th className="p-3">Assigned To / By</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-xs font-medium text-gray-700">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                  No tasks match the active scope and filter criteria.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t: any) => {
                const overdueDays = getOverdueDays(t.dueDate, t.status);
                return (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-700">{t.taskCode}</td>
                    <td className="p-3 max-w-[280px]">
                      <span className="font-bold text-gray-900 block truncate">{t.subject}</span>
                      <span className="text-[10.5px] text-gray-500 truncate block mt-0.5">{t.description || 'No description available'}</span>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">{t.relatedSite}</td>
                    <td className="p-3">
                      <span className="block font-bold text-gray-800">{t.assignedTo}</span>
                      <span className="text-[9.5px] text-gray-400 block">By: {t.assignedBy}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-semibold block">{t.dueDate}</span>
                      {overdueDays > 0 && (
                        <span className="text-[9px] font-bold text-rose-600 block mt-0.5">{overdueDays} days overdue</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${t.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : t.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTask(t)}
                          title="View Details"
                          aria-label="View Details"
                          className="p-1 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded cursor-pointer transition-colors focus:ring-1 focus:ring-brand-500"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {t.status !== 'completed' && (
                          <>
                            {t.status !== 'in_progress' && (
                              <button
                                onClick={() => {
                                  updateTaskStatus(t.id, 'in_progress');
                                  triggerToast(`Started task ${t.taskCode}`);
                                }}
                                title="Start Task"
                                aria-label="Start Task"
                                className="p-1 hover:bg-blue-50 text-blue-600 rounded cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                updateTaskStatus(t.id, 'pending_acceptance');
                                triggerToast(`Submitted ${t.taskCode} for completion acceptance`);
                              }}
                              title="Complete Task"
                              aria-label="Complete Task"
                              className="p-1 hover:bg-purple-50 text-purple-600 rounded cursor-pointer transition-colors focus:ring-1 focus:ring-purple-500"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            {t.status === 'pending_acceptance' && (
                              <button
                                onClick={() => {
                                  updateTaskStatus(t.id, 'completed');
                                  triggerToast(`Accepted completion for ${t.taskCode}`);
                                }}
                                title="Accept Completion"
                                aria-label="Accept Completion"
                                className="p-1 hover:bg-emerald-50 text-emerald-700 rounded cursor-pointer font-bold transition-colors focus:ring-1 focus:ring-emerald-500"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </button>
                            )}
                            <button
                              onClick={() => setReassignModalTask(t)}
                              title="Reassign Task"
                              aria-label="Reassign Task"
                              className="p-1 hover:bg-amber-50 text-amber-600 rounded cursor-pointer transition-colors focus:ring-1 focus:ring-amber-500"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Task View Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white rounded-lg border max-w-lg w-full p-5 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded text-xs">{selectedTask.taskCode}</span>
                <h3 className="font-extrabold text-sm text-gray-900">{selectedTask.subject}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Description</span>
                <p className="text-gray-700 font-medium mt-0.5 bg-gray-50 p-2.5 rounded border border-gray-150">{selectedTask.description || 'No detailed description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded border border-gray-150">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Assigned To</span>
                  <span className="font-bold text-gray-800">{selectedTask.assignedTo}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Assigned By</span>
                  <span className="font-bold text-gray-800">{selectedTask.assignedBy}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Project Site</span>
                  <span className="font-semibold text-gray-800">{selectedTask.relatedSite}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Related Record</span>
                  <span className="font-mono font-bold text-brand-700">{selectedTask.relatedRecord}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Assigned Date</span>
                  <span className="font-mono font-semibold">{selectedTask.assignedDate}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Due Date</span>
                  <span className="font-mono font-bold text-rose-700">{selectedTask.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              {selectedTask.relatedRoute ? (
                <button
                  onClick={() => navigate(selectedTask.relatedRoute)}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Related Record
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="relative bg-white rounded-lg border max-w-md w-full p-5 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-600" /> Create New Action Task
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="E.g. Verify Vendor Rates for Flooring"
                  className="w-full border rounded p-2 bg-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Task instructions and details..."
                  rows={3}
                  className="w-full border rounded p-2 bg-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Assigned To</label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full border rounded p-1.5 bg-white text-xs font-bold"
                  >
                    <option value="Amit Dev">Amit Dev</option>
                    <option value="Rajesh Kumar">Rajesh Kumar</option>
                    <option value="Rohan Verma">Rohan Verma</option>
                    <option value="Anita Rao">Anita Rao</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full border rounded p-1.5 bg-white text-xs font-bold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Project Site</label>
                  <select
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                    className="w-full border rounded p-1.5 bg-white text-xs font-medium"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full border rounded p-1.5 bg-white text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3.5 py-1.5 border rounded font-bold hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 font-bold text-white rounded shadow-sm cursor-pointer">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignModalTask && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setReassignModalTask(null)} />
          <div className="relative bg-white rounded-lg border max-w-xs w-full p-4 shadow-xl space-y-3 font-sans text-xs">
            <h4 className="font-extrabold text-sm text-gray-900">Reassign {reassignModalTask.taskCode}</h4>
            <form onSubmit={handleReassign} className="space-y-3">
              <div>
                <label className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Select User</label>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="w-full border rounded p-2 bg-white text-xs font-bold"
                >
                  <option value="Amit Dev">Amit Dev</option>
                  <option value="Rajesh Kumar">Rajesh Kumar</option>
                  <option value="Rohan Verma">Rohan Verma</option>
                  <option value="Anita Rao">Anita Rao</option>
                  <option value="Sanjay Mehta">Sanjay Mehta</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setReassignModalTask(null)} className="px-3 py-1 border rounded font-bold hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-3.5 py-1 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded cursor-pointer">
                  Confirm Reassign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
