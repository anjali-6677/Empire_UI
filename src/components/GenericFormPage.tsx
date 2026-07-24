import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2
} from 'lucide-react';
import { ModuleSchema } from '../config/moduleSchemas';
import { formatIndianCurrency } from '../utils/format';

interface GenericFormPageProps {
  schema: ModuleSchema;
}

export const GenericFormPage: React.FC<GenericFormPageProps> = ({ schema }) => {
  const navigate = useNavigate();
  const [toast, setToast] = React.useState<string | null>(null);

  // Form field values state
  const [formValues, setFormValues] = React.useState<Record<string, any>>({});

  // Items table local state
  const [items, setItems] = React.useState([
    { id: '1', item: 'Plywood 18mm Commercial Grade', unit: 'Sq Ft', qty: 500, rate: 120, amount: 60000 },
    { id: '2', item: 'Teak Wood Veneer 4mm', unit: 'Sheets', qty: 150, rate: 850, amount: 127500 }
  ]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
      navigate(-1);
    }, 1500);
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), item: 'Gypsum Board 12mm Standard', unit: 'Sq Ft', qty: 200, rate: 45, amount: 9000 }
    ]);
  };

  const removeItemRow = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Form submitted successfully');
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-emerald-600 text-white px-4 py-2 rounded shadow-lg font-bold text-xs flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {schema.breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className={idx === schema.breadcrumbs.length - 1 ? 'text-gray-650 font-bold' : 'cursor-pointer'}>{crumb}</span>
          </React.Fragment>
        ))}
      </nav>

      {/* Page Header */}
      <div className="border-b border-gray-150 pb-4">
        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">{schema.title}</h1>
        <p className="text-[10.5px] text-gray-400 font-medium">{schema.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {schema.sections?.map((section) => (
          <div key={section.id} className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
            <div className="border-b pb-2.5">
              <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">{section.title}</h3>
              {section.description && <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">{section.description}</p>}
            </div>

            {/* Standard Form Fields */}
            {section.fields && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.name} className={field.colSpan === 2 ? 'col-span-1 sm:col-span-2' : ''}>
                    <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px] tracking-wider">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={formValues[field.name] || field.defaultValue || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full border border-gray-250 rounded p-2 focus:outline-none focus:border-brand-500 bg-white font-medium text-xs text-gray-800"
                        required={field.required}
                      >
                        <option value="">Select option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formValues[field.name] || field.defaultValue || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-250 rounded p-2 focus:outline-none focus:border-brand-500 bg-white font-medium text-xs text-gray-800"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.name] || field.defaultValue || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-250 rounded p-2 focus:outline-none focus:border-brand-500 bg-white font-medium text-xs text-gray-800"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Has Item Table */}
            {section.hasItemTable && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item Entries</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded font-bold text-[10px] hover:bg-brand-100 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Item Line
                  </button>
                </div>

                <div className="overflow-x-auto border border-gray-150 rounded">
                  <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[600px]">
                    <thead className="bg-gray-50 text-[9px] uppercase font-bold text-gray-500">
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-center">UOM</th>
                        <th className="p-2.5 text-right">Quantity</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                        <th className="p-2.5 text-right">Total Amount</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {items.map((row) => (
                        <tr key={row.id}>
                          <td className="p-2.5">
                            <input type="text" value={row.item} onChange={() => {}} className="w-full bg-white border border-gray-200 rounded p-1 text-xs" />
                          </td>
                          <td className="p-2.5 text-center">{row.unit}</td>
                          <td className="p-2.5 text-right font-mono">{row.qty}</td>
                          <td className="p-2.5 text-right font-mono">{row.rate}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-gray-900">{formatIndianCurrency(row.amount)}</td>
                          <td className="p-2.5 text-center">
                            <button type="button" onClick={() => removeItemRow(row.id)} className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Amount Summary Block */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
          <div>
            <span className="font-bold text-gray-500 block uppercase text-[9px]">Calculated Summary Value:</span>
            <span className="text-lg font-extrabold text-brand-700">{formatIndianCurrency(187500)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-250 bg-white hover:bg-gray-50 rounded font-bold text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => triggerToast('Saved draft successfully')}
              className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded font-bold text-gray-800 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer"
            >
              Submit For Approval
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
