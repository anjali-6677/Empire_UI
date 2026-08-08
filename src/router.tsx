import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ProjectMapPage } from './pages/projects/ProjectMapPage';
import { ModulePageRenderer } from './components/ModulePageRenderer';
import { MyTasksPage } from './pages/MyTasksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CalendarPage } from './pages/CalendarPage';
import { MessagesPage } from './pages/MessagesPage';

// Master Data & CRM Pages
import CategoriesFactorsPage from './pages/masters/CategoriesFactorsPage';
import UOMListPage from './pages/masters/UOMListPage';
import ProductsListPage from './pages/masters/ProductsListPage';
import CreateProductPage from './pages/masters/CreateProductPage';
import ProductDetailsPage from './pages/masters/ProductDetailsPage';
import VendorListPage from './pages/masters/VendorListPage';
import CreateVendorPage from './pages/masters/CreateVendorPage';
import VendorDetailsPage from './pages/masters/VendorDetailsPage';
import SubcontractorListPage from './pages/masters/SubcontractorListPage';
import CreateSubcontractorPage from './pages/masters/CreateSubcontractorPage';
import SubcontractorDetailsPage from './pages/masters/SubcontractorDetailsPage';
import ClientListPage from './pages/masters/ClientListPage';
import CreateClientPage from './pages/masters/CreateClientPage';
import ClientDetailsPage from './pages/masters/ClientDetailsPage';
import PaymentTermsPage from './pages/masters/PaymentTermsPage';
import TaxesPage from './pages/masters/TaxesPage';
import StockLocationsPage from './pages/masters/StockLocationsPage';
import UsersEmployeesPage from './pages/masters/UsersEmployeesPage';

import { CRMWorkspacePage } from './pages/crm/CRMWorkspacePage';
import { CreateEnquiryPage } from './pages/crm/CreateEnquiryPage';
import { EnquiryOverviewPage } from './pages/crm/EnquiryOverviewPage';
import { EstimateOverviewPage } from './pages/crm/EstimateOverviewPage';
import { EstimateBuilderPage } from './pages/crm/EstimateBuilderPage';
import { PricingFactorsPage } from './pages/crm/PricingFactorsPage';
import { WonOpportunitiesPage } from './pages/crm/WonOpportunitiesPage';
import { LostOpportunitiesPage } from './pages/crm/LostOpportunitiesPage';
import { RevisionComparisonPage } from './pages/crm/RevisionComparisonPage';

// Project & Planning Pages
import { ProjectsListPage } from './pages/projects/ProjectsListPage';
import { CreateProjectPage } from './pages/projects/CreateProjectPage';
import { ProjectActivationPage } from './pages/projects/ProjectActivationPage';
import { ProjectWorkspacePage } from './pages/projects/ProjectWorkspacePage';

// Procurement Pages
import { CreateMaterialIndentPage } from './pages/procurement/CreateMaterialIndentPage';
import { MaterialIndentListPage } from './pages/procurement/MaterialIndentListPage';
import { MaterialIndentDetailsPage } from './pages/procurement/MaterialIndentDetailsPage';
import { IndentApprovalsInboxPage } from './pages/procurement/IndentApprovalsInboxPage';
import { MaterialRFQsPage } from './pages/procurement/MaterialRFQsPage';
import { CreateRFQPage } from './pages/procurement/CreateRFQPage';
import { RFQDetailsPage } from './pages/procurement/RFQDetailsPage';
import { CreateVendorQuotationPage } from './pages/procurement/CreateVendorQuotationPage';
import { PurchaseOrderListPage } from './pages/procurement/PurchaseOrderListPage';
import { CreatePurchaseOrderPage } from './pages/procurement/CreatePurchaseOrderPage';
import { PurchaseOrderDetailsPage } from './pages/procurement/PurchaseOrderDetailsPage';

// Inventory & Movement Pages
import { GRNListPage } from './pages/inventory/GRNListPage';
import { CreateGRNPage } from './pages/inventory/CreateGRNPage';
import { GRNDetailsPage } from './pages/inventory/GRNDetailsPage';
import { StockLedgerPage } from './pages/inventory/StockLedgerPage';
import { MaterialMovementPage } from './pages/inventory/MaterialMovementPage';
import { CreateMaterialIssuePage } from './pages/inventory/CreateMaterialIssuePage';
import { CreateMaterialReturnPage } from './pages/inventory/CreateMaterialReturnPage';
import { CreateMaterialConsumptionPage } from './pages/inventory/CreateMaterialConsumptionPage';

import CategoryDetailsPage from './pages/masters/CategoryDetailsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected ERP Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sites" element={<Navigate to="/projects" replace />} />
            <Route path="sites/new" element={<Navigate to="/projects/new" replace />} />
            <Route path="map" element={<ProjectMapPage />} />
            <Route path="tasks" element={<MyTasksPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="messages" element={<MessagesPage />} />

            {/* CRM & Commercial Estimation Routes */}
            <Route path="crm" element={<CRMWorkspacePage />} />
            <Route path="crm/enquiries" element={<Navigate to="/crm" replace />} />
            <Route path="crm/enquiries/new" element={<CreateEnquiryPage />} />
            <Route path="crm/enquiries/:enquiryId" element={<EnquiryOverviewPage />} />
            <Route path="crm/estimates" element={<Navigate to="/crm" replace />} />
            <Route path="crm/estimates/:estimateId" element={<EstimateOverviewPage />} />
            <Route path="crm/estimates/builder/:enquiryId" element={<EstimateBuilderPage />} />
            <Route path="crm/pricing-factors" element={<PricingFactorsPage />} />
            <Route path="crm/won" element={<WonOpportunitiesPage />} />
            <Route path="crm/lost" element={<LostOpportunitiesPage />} />
            <Route path="crm/revisions/compare/:enquiryId" element={<RevisionComparisonPage />} />
            <Route path="crm/estimate-versions" element={<Navigate to="/crm" replace />} />
            <Route path="crm/tender-decisions" element={<WonOpportunitiesPage />} />

            {/* Project Setup & Execution Routes */}
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/map" element={<ProjectMapPage />} />
            <Route path="projects/new" element={<CreateProjectPage />} />
            <Route path="projects/activation" element={<ProjectActivationPage />} />
            <Route path="projects/workspace" element={<ProjectWorkspacePage />} />
            <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />

            {/* Procurement & Material Indents Routes */}
            <Route path="procurement/indents" element={<MaterialIndentListPage />} />
            <Route path="procurement/indents/new" element={<CreateMaterialIndentPage />} />
            <Route path="procurement/indents/:indentId" element={<MaterialIndentDetailsPage />} />
            <Route path="procurement/indent-approvals" element={<IndentApprovalsInboxPage />} />

            {/* Procurement RFQ, Quotations & Rate Comparison Routes */}
            <Route path="procurement/rfqs" element={<MaterialRFQsPage />} />
            <Route path="procurement/rfqs/new" element={<CreateRFQPage />} />
            <Route path="procurement/rfqs/:rfqId" element={<RFQDetailsPage />} />
            <Route path="procurement/vendor-quotations" element={<Navigate to="/procurement/rfqs" replace />} />
            <Route path="procurement/vendor-quotations/new" element={<CreateVendorQuotationPage />} />
            <Route path="procurement/rate-comparison" element={<Navigate to="/procurement/rfqs" replace />} />
            <Route path="procurement/rate-comparison/:rfqId" element={<Navigate to="/procurement/rfqs" replace />} />

            {/* Purchase Order Routes */}
            <Route path="procurement/purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="procurement/purchase-orders/new" element={<CreatePurchaseOrderPage />} />
            <Route path="procurement/purchase-orders/:poId" element={<PurchaseOrderDetailsPage />} />

            {/* Goods Received Notes (GRN) Routes */}
            <Route path="inventory/grns" element={<GRNListPage />} />
            <Route path="inventory/grns/new" element={<CreateGRNPage />} />
            <Route path="inventory/grns/:grnId" element={<GRNDetailsPage />} />

            {/* Stock Ledger & Material Movement Routes */}
            <Route path="inventory/stock-ledger" element={<StockLedgerPage />} />
            <Route path="inventory/stock" element={<StockLedgerPage />} />
            <Route path="inventory/material-movement" element={<MaterialMovementPage />} />
            <Route path="inventory/material-issues" element={<MaterialMovementPage />} />
            <Route path="inventory/material-issues/new" element={<CreateMaterialIssuePage />} />
            <Route path="inventory/material-returns/new" element={<CreateMaterialReturnPage />} />
            <Route path="inventory/material-consumptions/new" element={<CreateMaterialConsumptionPage />} />

            {/* Master Data Explicit Routes */}
            <Route path="masters/categories-factors" element={<CategoriesFactorsPage />} />
            <Route path="masters/categories/:id" element={<CategoryDetailsPage />} />
            <Route path="masters/uom font" element={<UOMListPage />} />
            <Route path="masters/uom" element={<UOMListPage />} />

            <Route path="masters/products" element={<ProductsListPage />} />
            <Route path="masters/products/new" element={<CreateProductPage />} />
            <Route path="masters/products/:productId/edit" element={<CreateProductPage />} />
            <Route path="masters/products/:productId" element={<ProductDetailsPage />} />

            <Route path="masters/vendors" element={<VendorListPage />} />
            <Route path="masters/vendors/new" element={<CreateVendorPage />} />
            <Route path="masters/vendors/:vendorId/edit" element={<CreateVendorPage />} />
            <Route path="masters/vendors/:vendorId" element={<VendorDetailsPage />} />

            <Route path="masters/subcontractors" element={<SubcontractorListPage />} />
            <Route path="masters/subcontractors/new" element={<CreateSubcontractorPage />} />
            <Route path="masters/subcontractors/:subcontractorId/edit" element={<CreateSubcontractorPage />} />
            <Route path="masters/subcontractors/:subcontractorId" element={<SubcontractorDetailsPage />} />

            <Route path="masters/clients" element={<ClientListPage />} />
            <Route path="masters/clients/new" element={<CreateClientPage />} />
            <Route path="masters/clients/:clientId/edit" element={<CreateClientPage />} />
            <Route path="masters/clients/:clientId" element={<ClientDetailsPage />} />

            <Route path="masters/payment-terms" element={<PaymentTermsPage />} />
            <Route path="masters/taxes" element={<TaxesPage />} />
            <Route path="masters/stock-locations" element={<StockLocationsPage />} />
            <Route path="masters/employees" element={<UsersEmployeesPage />} />
            <Route path="masters/users" element={<UsersEmployeesPage />} />
            <Route path="masters/categories" element={<CategoriesFactorsPage />} />

            {/* Universal Catch-all Route Handler */}
            <Route path="*" element={<ModulePageRenderer />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default AppRouter;
