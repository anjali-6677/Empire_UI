import { NAVIGATION_CONFIG, ROUTES } from './navigation';
import { MODULE_SCHEMAS } from './moduleSchemas';

export interface RouteAuditResult {
  totalNavigationRoutes: number;
  totalSchemas: number;
  missingSchemas: string[];
  duplicateSchemaIds: string[];
  unknownPageTypes: string[];
  isValid: boolean;
}

export function runRouteAudit(): RouteAuditResult {
  const navPaths: string[] = [];
  
  NAVIGATION_CONFIG.forEach((group) => {
    group.items.forEach((item) => {
      navPaths.push(item.path);
    });
  });

  const schemaKeys = Object.keys(MODULE_SCHEMAS);
  const schemaIds = Object.values(MODULE_SCHEMAS).map((s) => s.id);

  const missingSchemas: string[] = [];
  const duplicateSchemaIds: string[] = [];
  const unknownPageTypes: string[] = [];

  // Special routes handled by dedicated custom components
  const customRoutes = [ROUTES.DASHBOARD, ROUTES.SITES, ROUTES.CREATE_SITE, ROUTES.PROJECT_MAP];

  navPaths.forEach((path) => {
    if (!customRoutes.includes(path as any) && !MODULE_SCHEMAS[path]) {
      missingSchemas.push(path);
    }
  });

  const seenIds = new Set<string>();
  schemaIds.forEach((id) => {
    if (seenIds.has(id)) {
      duplicateSchemaIds.push(id);
    }
    seenIds.add(id);
  });

  Object.values(MODULE_SCHEMAS).forEach((schema) => {
    if (!['list', 'form', 'details', 'report', 'custom'].includes(schema.pageType)) {
      unknownPageTypes.push(`${schema.id} (${schema.pageType})`);
    }
  });

  const isValid = missingSchemas.length === 0 && duplicateSchemaIds.length === 0 && unknownPageTypes.length === 0;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Route Audit] Complete ERP Route Audit Result:', {
      totalNavigationRoutes: navPaths.length,
      totalSchemas: schemaKeys.length,
      missingSchemas,
      duplicateSchemaIds,
      unknownPageTypes,
      status: isValid ? 'SUCCESS - All Routes Configured' : 'FAILED - Missing Configuration'
    });
  }

  return {
    totalNavigationRoutes: navPaths.length,
    totalSchemas: schemaKeys.length,
    missingSchemas,
    duplicateSchemaIds,
    unknownPageTypes,
    isValid
  };
}
