import * as React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Key, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ModulePerm {
  id: string;
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
  delete: boolean;
}

export const PermissionsMatrix: React.FC = () => {
  const [toast, setToast] = React.useState<string | null>(null);

  const [perms, setPerms] = React.useState<ModulePerm[]>([
    { id: '1', module: 'Projects & Sites', view: true, create: true, edit: true, approve: true, delete: false },
    { id: '2', module: 'Material Indents', view: true, create: true, edit: true, approve: true, delete: true },
    { id: '3', module: 'RFQs & Rate Comparison', view: true, create: true, edit: true, approve: true, delete: false },
    { id: '4', module: 'Purchase Orders', view: true, create: true, edit: true, approve: true, delete: false },
    { id: '5', module: 'Work Orders', view: true, create: true, edit: true, approve: true, delete: false },
    { id: '6', module: 'Invoices & Payments', view: true, create: true, edit: true, approve: true, delete: false },
    { id: '7', module: 'Project Budgets', view: true, create: true, edit: true, approve: true, delete: false },
    { id: '8', module: 'Master Registries', view: true, create: true, edit: true, approve: false, delete: false }
  ]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleRight = (id: string, field: keyof Omit<ModulePerm, 'id' | 'module'>) => {
    setPerms((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = !p[field];
          triggerToast(`Updated ${p.module} -> ${field.toUpperCase()} permission to ${updated ? 'Enabled' : 'Disabled'}`);
          return { ...p, [field]: updated };
        }
        return p;
      })
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-brand-650 text-white px-4 py-2 rounded shadow-lg font-bold text-xs flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-brand-200" />
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span>Administration</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 font-bold">Permissions Matrix</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-600" />
            Module Permission Matrix & Feature Access Toggles
          </h1>
          <p className="text-[10.5px] text-gray-400 font-medium">Granular View, Create, Edit, Approve, and Delete rights per module group.</p>
        </div>

        <button
          onClick={() => triggerToast('Saved permission matrix settings')}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer"
        >
          Save Permissions Matrix
        </button>
      </div>

      {/* Permission Table */}
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[650px]">
            <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
              <tr>
                <th className="p-3">Module Scope</th>
                <th className="p-3 text-center">View</th>
                <th className="p-3 text-center">Create</th>
                <th className="p-3 text-center">Edit</th>
                <th className="p-3 text-center">Approve</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {perms.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-500" />
                    {p.module}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.view}
                      onChange={() => toggleRight(p.id, 'view')}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.create}
                      onChange={() => toggleRight(p.id, 'create')}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.edit}
                      onChange={() => toggleRight(p.id, 'edit')}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.approve}
                      onChange={() => toggleRight(p.id, 'approve')}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.delete}
                      onChange={() => toggleRight(p.id, 'delete')}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
