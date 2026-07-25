export type SiteScopeMode = 'portfolio' | 'selected_site' | 'involves_selected_site';

/**
 * Shared standalone filtering helper for site-scoped records.
 * Decoupled from React Context to avoid circular imports and allow usage in
 * list pages, dashboard components, and specialized report views.
 *
 * @param records Array of records to filter
 * @param siteScopeMode Mode: 'portfolio' | 'selected_site' | 'involves_selected_site'
 * @param selectedSiteId Currently active site ID ('site-1'..'site-6' or 'all')
 * @returns Array of filtered records
 */
export function filterBySiteScope<T extends Record<string, any>>(
  records: T[],
  siteScopeMode: SiteScopeMode,
  selectedSiteId: string
): T[] {
  if (!records || !Array.isArray(records)) {
    return [];
  }

  // 1. Portfolio mode OR 'all' selected site -> return full portfolio
  if (siteScopeMode === 'portfolio' || selectedSiteId === 'all') {
    return records;
  }

  const cleanSiteId = String(selectedSiteId || '').trim();
  if (!cleanSiteId) {
    return records;
  }

  // 2. Direct site match mode
  if (siteScopeMode === 'selected_site') {
    return records.filter((r) => {
      if (r.siteId && String(r.siteId).trim() === cleanSiteId) {
        return true;
      }
      return false;
    });
  }

  // 3. Involvement mode (matches direct siteId OR sourceSiteId/fromSiteId OR destinationSiteId/toSiteId)
  if (siteScopeMode === 'involves_selected_site') {
    return records.filter((r) => {
      const siteId = String(r.siteId || '').trim();
      const sourceSiteId = String(r.sourceSiteId || r.fromSiteId || '').trim();
      const destSiteId = String(r.destinationSiteId || r.toSiteId || '').trim();

      return siteId === cleanSiteId || sourceSiteId === cleanSiteId || destSiteId === cleanSiteId;
    });
  }

  return records;
}
