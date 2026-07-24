import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { MODULE_SCHEMAS, ModuleSchema } from '../config/moduleSchemas';
import { GenericListPage } from './GenericListPage';
import { GenericFormPage } from './GenericFormPage';
import { GenericDetailsPage } from './GenericDetailsPage';
import { GenericReportPage } from './GenericReportPage';
import { AlertCircle } from 'lucide-react';
import { runRouteAudit } from '../config/routeAudit';

export const ModulePageRenderer: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  React.useEffect(() => {
    runRouteAudit();
  }, []);

  const schema: ModuleSchema | null = React.useMemo(() => {
    // 0. Handle query-based report routes e.g. /reports?module=purchase
    const searchParams = new URLSearchParams(location.search);
    const moduleParam = searchParams.get('module');
    if ((path === '/reports' || path === '/reports/') && moduleParam) {
      const canonicalPath = `/reports/${moduleParam === 'admin' ? 'administration' : moduleParam}`;
      if (MODULE_SCHEMAS[canonicalPath]) {
        return MODULE_SCHEMAS[canonicalPath];
      }
    }

    // 1. Exact match in MODULE_SCHEMAS
    if (MODULE_SCHEMAS[path]) {
      return MODULE_SCHEMAS[path];
    }

    // 2. Parameterized Form Sub-Routes (e.g., /procurement/indents/new)
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const parentPath = `/${segments.slice(0, segments.length - 1).join('/')}`;
      const lastSegment = segments[segments.length - 1];

      if (lastSegment === 'new' || lastSegment === 'create') {
        const parentSchema = MODULE_SCHEMAS[parentPath];
        return {
          id: `gen-form-${segments.join('-')}`,
          route: path,
          pageType: 'form',
          title: `Create ${parentSchema ? parentSchema.title : segments[0].toUpperCase()} Record`,
          description: `Input entry form for ${parentSchema ? parentSchema.title : path}.`,
          breadcrumbs: parentSchema ? [...parentSchema.breadcrumbs, 'New Entry'] : ['ERP Core', path, 'New Entry'],
          sections: parentSchema?.sections || [
            {
              id: 'sec-main',
              title: 'Primary Information',
              fields: [
                { name: 'siteId', label: 'Project Site', type: 'select', required: true, options: [{ label: 'SITE-2026-001 (Nexus Tech Park)', value: 'site-1' }] },
                { name: 'refCode', label: 'Reference Number', type: 'text', defaultValue: 'REF-2026-099' },
                { name: 'entryDate', label: 'Entry Date', type: 'date', defaultValue: '2026-07-24' },
                { name: 'note', label: 'Operational Remarks', type: 'textarea', colSpan: 2 }
              ]
            },
            {
              id: 'sec-items',
              title: 'Line Items',
              hasItemTable: true,
              itemTableType: 'material'
            }
          ]
        };
      }

      // 3. Parameterized Detail Sub-Routes (e.g., /procurement/indents/IND-2026-001)
      if (MODULE_SCHEMAS[parentPath]) {
        const parentSchema = MODULE_SCHEMAS[parentPath];
        const cleanTitle = parentSchema.title.replace(/\s+(List|Registry|Management|Overview|Dashboard)$/i, '');
        return {
          id: `gen-detail-${segments.join('-')}`,
          route: path,
          pageType: 'details',
          title: cleanTitle === 'Indent & Material Requisitions' ? 'Indent Details' : `${cleanTitle} Details`,
          description: cleanTitle === 'Indent & Material Requisitions' 
            ? 'Material and service request details, approval status and requested items.' 
            : `Detailed record overview for ${lastSegment}.`,
          breadcrumbs: [...parentSchema.breadcrumbs.map(b => b.replace(/\s+List$/i, '')), lastSegment]
        };
      }
    }

    return null;
  }, [path]);

  // If no schema found, show visible development error banner
  if (!schema) {
    return (
      <div className="p-8 my-6 border border-rose-200 bg-rose-50 rounded-lg text-rose-900 font-sans space-y-3 shadow-sm select-none">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <h2 className="text-base font-extrabold tracking-tight">Module configuration not found for this route</h2>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed font-medium">
          Route path <code className="font-mono bg-white px-2 py-0.5 border border-rose-200 rounded font-bold">{path}</code> has no registered schema in <code className="font-mono bg-white px-2 py-0.5 border border-rose-200 rounded font-bold">src/config/moduleSchemas.ts</code> or matching parent list route.
        </p>
        <div className="text-[11px] text-rose-700 pt-2 border-t border-rose-200 font-semibold">
          Check <code className="font-mono">src/config/navigation.ts</code> and <code className="font-mono">src/config/moduleSchemas.ts</code> to ensure exact path mapping.
        </div>
      </div>
    );
  }

  if (schema.pageType === 'form') {
    return <GenericFormPage schema={schema} />;
  }
  if (schema.pageType === 'details') {
    return <GenericDetailsPage schema={schema} />;
  }
  if (schema.pageType === 'report') {
    return <GenericReportPage schema={schema} />;
  }

  return <GenericListPage schema={schema} />;
};
