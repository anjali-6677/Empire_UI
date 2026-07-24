import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Sites } from './pages/Sites';
import { CreateSite } from './pages/CreateSite';
import { ProjectMap } from './pages/ProjectMap';
import { SiteDetails } from './pages/SiteDetails';
import { PermissionsMatrix } from './pages/PermissionsMatrix';
import { AppSettings } from './pages/AppSettings';
import { ModulePageRenderer } from './components/ModulePageRenderer';
import { UtilitySplitForm } from './pages/UtilitySplitForm';
import { SalarySplitForm } from './pages/SalarySplitForm';
import { MyTasksPage } from './pages/MyTasksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CalendarPage } from './pages/CalendarPage';
import { MessagesPage } from './pages/MessagesPage';
import { ROUTES } from './config/navigation';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Main Core Workflows */}
          <Route index element={<Dashboard />} />
          <Route path="sites" element={<Sites />} />
          <Route path="sites/new" element={<CreateSite />} />
          <Route path="projects/map" element={<ProjectMap />} />

          {/* Overview Communication Routes */}
          <Route path={ROUTES.MY_TASKS.replace(/^\//, '')} element={<MyTasksPage />} />
          <Route path={ROUTES.NOTIFICATIONS.replace(/^\//, '')} element={<NotificationsPage />} />
          <Route path={ROUTES.CALENDAR.replace(/^\//, '')} element={<CalendarPage />} />
          <Route path={ROUTES.MESSAGES.replace(/^\//, '')} element={<MessagesPage />} />

          {/* Projects Routes */}
          <Route path={ROUTES.PROJECTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.SITE_DETAILS.replace(/^\//, '')} element={<SiteDetails />} />
          <Route path={ROUTES.PROJECT_TEAMS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.TENDER_DETAILS.replace(/^\//, '')} element={<ModulePageRenderer />} />

          {/* Procurement Routes */}
          <Route path={ROUTES.INDENTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.INDENTS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.INDENTS.replace(/^\//, '')}/:id`} element={<ModulePageRenderer />} />

          <Route path={ROUTES.RFQS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.RFQS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />

          <Route path={ROUTES.RATE_COMPARISON.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.PURCHASE_ORDERS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.PURCHASE_ORDERS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.PURCHASE_ORDERS.replace(/^\//, '')}/:id`} element={<ModulePageRenderer />} />

          <Route path={ROUTES.WORK_ORDERS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.WORK_ORDERS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.WORK_ORDERS.replace(/^\//, '')}/:id`} element={<ModulePageRenderer />} />

          <Route path={ROUTES.ORDERS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.GRNS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.GRNS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />
          <Route path={ROUTES.INVENTORY.replace(/^\//, '')} element={<ModulePageRenderer />} />

          {/* Finance Routes */}
          <Route path={ROUTES.INVOICES.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.INVOICES.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.INVOICES.replace(/^\//, '')}/:id`} element={<ModulePageRenderer />} />

          <Route path={ROUTES.PAYMENT_REQUESTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.PAYMENTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.PAYMENTS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />

          <Route path={ROUTES.PROJECT_BUDGETS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.PROJECT_BUDGETS.replace(/^\//, '')}/new`} element={<ModulePageRenderer />} />
          <Route path={ROUTES.UTILITY_BILLS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.UTILITY_BILLS.replace(/^\//, '')}/new`} element={<UtilitySplitForm />} />
          <Route path={ROUTES.SALARY.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.SALARY.replace(/^\//, '')}/new`} element={<SalarySplitForm />} />

          {/* Masters Routes */}
          <Route path={ROUTES.CLIENTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.CLIENTS.replace(/^\//, '')}/:id`} element={<ModulePageRenderer />} />
          <Route path={ROUTES.VENDORS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={`${ROUTES.VENDORS.replace(/^\//, '')}/:id`} element={<ModulePageRenderer />} />
          <Route path={ROUTES.EMPLOYEES.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.ITEMS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.ITEM_CATEGORIES.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.UNITS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.COMPANIES.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.BANKS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.DEPARTMENTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.ROLES_MASTER.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.DESIGNATIONS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.MEASUREMENT_CONVERSIONS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.BRANDS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.LOCATIONS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.PMC.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.ARCHITECTS.replace(/^\//, '')} element={<ModulePageRenderer />} />

          {/* Reports Routes */}
          <Route path={ROUTES.PURCHASE_REPORTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.BUDGET_REPORTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.FINANCE_REPORTS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.ADMIN_REPORTS.replace(/^\//, '')} element={<ModulePageRenderer />} />

          {/* Administration Routes */}
          <Route path={ROUTES.USERS.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.ROLES.replace(/^\//, '')} element={<ModulePageRenderer />} />
          <Route path={ROUTES.PERMISSIONS.replace(/^\//, '')} element={<PermissionsMatrix />} />
          <Route path={ROUTES.SETTINGS.replace(/^\//, '')} element={<AppSettings />} />

          {/* Universal Catch-all Route Handler for All Other Sub-Routes */}
          <Route path="*" element={<ModulePageRenderer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default AppRouter;
