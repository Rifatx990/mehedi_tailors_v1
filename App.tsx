
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.tsx';
import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Page components
import HomePage from './pages/HomePage.tsx';
import ShopPage from './pages/ShopPage.tsx';
import CustomTailoringPage from './pages/CustomTailoringPage.tsx';
import CartPage from './pages/CartPage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';
import ProductDetailsPage from './pages/ProductDetailsPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import ShippingPolicyPage from './pages/ShippingPolicyPage.tsx';
import ReturnsPage from './pages/ReturnsPage.tsx';
import SizeGuidePage from './pages/SizeGuidePage.tsx';
import TrackOrderPage from './pages/TrackOrderPage.tsx';
import GiftCardPage from './pages/GiftCardPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import InvoicePage from './pages/InvoicePage.tsx';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminFabricsPage from './pages/admin/AdminFabricsPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminCouponsPage from './pages/admin/AdminCouponsPage.tsx';
import AdminBannersPage from './pages/admin/AdminBannersPage.tsx';
import AdminPartnersPage from './pages/admin/AdminPartnersPage.tsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.tsx';
import AdminCatalogPage from './pages/admin/AdminCatalogPage.tsx';
import AdminCustomersPage from './pages/admin/AdminCustomersPage.tsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.tsx';
import AdminAppealsPage from './pages/admin/AdminAppealsPage.tsx';
import AdminLabelStudioPage from './pages/admin/AdminLabelStudioPage.tsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.tsx';
import AdminMaterialRequestsPage from './pages/admin/AdminMaterialRequestsPage.tsx';

// Admin Management
import AdminManagementStaffPage from './pages/admin/AdminManagementStaffPage.tsx';
import AdminManagementWorkerPage from './pages/admin/AdminManagementWorkerPage.tsx';
import AdminManagementCustomerPage from './pages/admin/AdminManagementCustomerPage.tsx';

// Worker Pages
import WorkerDashboardPage from './pages/worker/WorkerDashboardPage.tsx';
import WorkerTasksPage from './pages/worker/WorkerTasksPage.tsx';
import WorkerMeasurementsPage from './pages/worker/WorkerMeasurementsPage.tsx';
import WorkerHistoryPage from './pages/worker/WorkerHistoryPage.tsx';
import WorkerRequisitionsPage from './pages/worker/WorkerRequisitionsPage.tsx';
import WorkerProfilePage from './pages/worker/WorkerProfilePage.tsx';

// Worker Station Pages
import WorkerCuttingPage from './pages/worker/WorkerCuttingPage.tsx';
import WorkerStitchingPage from './pages/worker/WorkerStitchingPage.tsx';
import WorkerFinishingPage from './pages/worker/WorkerFinishingPage.tsx';
import WorkerQCPage from './pages/worker/WorkerQCPage.tsx';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Public & Global Invoice */}
          <Route path="/invoice/:orderId" element={<InvoicePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <Routes>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="catalog" element={<AdminCatalogPage />} />
                <Route path="labels" element={<AdminLabelStudioPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="fabrics" element={<AdminFabricsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="banners" element={<AdminBannersPage />} />
                <Route path="partners" element={<AdminPartnersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="appeals" element={<AdminAppealsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="requisitions" element={<AdminMaterialRequestsPage />} />
                <Route path="management/admins" element={<AdminManagementStaffPage />} />
                <Route path="management/workers" element={<AdminManagementWorkerPage />} />
                <Route path="management/customers" element={<AdminManagementCustomerPage />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Protected Worker Routes */}
          <Route path="/worker/*" element={
            <ProtectedRoute role="worker">
              <Routes>
                <Route path="dashboard" element={<WorkerDashboardPage />} />
                <Route path="tasks" element={<WorkerTasksPage />} />
                <Route path="stations/cutting" element={<WorkerCuttingPage />} />
                <Route path="stations/stitching" element={<WorkerStitchingPage />} />
                <Route path="stations/finishing" element={<WorkerFinishingPage />} />
                <Route path="stations/qc" element={<WorkerQCPage />} />
                <Route path="measurements" element={<WorkerMeasurementsPage />} />
                <Route path="history" element={<WorkerHistoryPage />} />
                <Route path="requisitions" element={<WorkerRequisitionsPage />} />
                <Route path="profile" element={<WorkerProfilePage />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Public & Customer Routes - With Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/fabrics" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/custom-tailoring" element={<CustomTailoringPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/gift-cards" element={<GiftCardPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute role="customer">
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<div className="py-32 text-center text-4xl serif">Page Not Found</div>} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
