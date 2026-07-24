import * as React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  ArrowLeft, 
  Edit
} from 'lucide-react';
import { ModuleSchema } from '../config/moduleSchemas';
import { StatusBadge } from './StatusBadge';
import { formatIndianCurrency } from '../utils/format';

interface GenericDetailsPageProps {
  schema: ModuleSchema;
}

export const GenericDetailsPage: React.FC<GenericDetailsPageProps> = ({ schema }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Resolve matching row from schema.mockRows if available
  const activeRecord = React.useMemo(() => {
    if (schema.mockRows && schema.mockRows.length > 0) {
      const match = schema.mockRows.find((r) => String(r.id) === String(id) || String(r.code) === String(id) || String(r.indentNo) === String(id) || String(r.poNo) === String(id) || String(r.invoiceNo) === String(id));
      if (match) return match;
      return schema.mockRows[0];
    }
    return null;
  }, [schema.mockRows, id]);

  const recordCode = activeRecord?.code || activeRecord?.indentNo || activeRecord?.poNo || activeRecord?.invoiceNo || activeRecord?.vendorCode || activeRecord?.clientCode || activeRecord?.empCode || id?.toUpperCase() || 'REC-2026-001';
  const recordTitle = activeRecord?.name || activeRecord?.title || activeRecord?.clientName || activeRecord?.vendor || `${schema.title} Record`;
  const recordStatus = activeRecord?.status || 'approved';

  // Parent return path for Back to List button
  const parentListPath = schema.route.includes('/:') ? schema.route.split('/:')[0] : schema.route.replace(/\/new$/, '').replace(/\/edit.*$/, '');

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(parentListPath)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-600 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
                {recordCode}
              </span>
              <StatusBadge status={recordStatus as any} />
            </div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight mt-1">{recordTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(parentListPath)}
            className="px-3 py-1.5 border border-gray-250 bg-white rounded font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Back to List
          </button>
          <button
            onClick={() => navigate(`${parentListPath}/new`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" /> Edit Record
          </button>
        </div>
      </div>

      {/* Dynamic Detail Attributes */}
      <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {activeRecord ? (
            Object.entries(activeRecord)
              .filter(([k]) => !['id', 'items', 'status'].includes(k))
              .slice(0, 8)
              .map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-400 block text-[9.5px] uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold text-gray-900">
                    {typeof value === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('spend') || key.toLowerCase().includes('val') || key.toLowerCase().includes('budget')
                      ? formatIndianCurrency(value)
                      : String(value)}
                  </span>
                </div>
              ))
          ) : (
            <>
              <div>
                <span className="text-gray-400 block text-[9.5px] uppercase font-bold">Module Scope:</span>
                <span className="font-bold text-gray-900">{schema.title}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9.5px] uppercase font-bold">Record Reference:</span>
                <span className="font-bold text-gray-900">{recordCode}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9.5px] uppercase font-bold">Last Modified:</span>
                <span className="font-mono font-bold text-gray-800">2026-07-24</span>
              </div>
            </>
          )}
        </div>

        {/* Item Table if present */}
        {activeRecord?.items && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Associated Line Items</h4>
            <table className="w-full text-left text-xs border border-gray-150 rounded divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[9px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">UOM</th>
                  <th className="p-2.5 text-right">Quantity</th>
                  <th className="p-2.5 text-right">Rate</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {activeRecord.items.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-gray-800">{it.item}</td>
                    <td className="p-2.5 text-center">{it.unit}</td>
                    <td className="p-2.5 text-right font-mono">{it.qty}</td>
                    <td className="p-2.5 text-right font-mono">{it.rate}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-gray-900">{formatIndianCurrency(it.total || it.amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
