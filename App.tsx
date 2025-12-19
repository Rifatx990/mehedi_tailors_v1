
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.tsx';
import Layout from './components/Layout.tsx';

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

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.tsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.tsx';
import AdminFabricsPage from './pages/admin/AdminFabricsPage.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminCouponsPage from './pages/admin/AdminCouponsPage.tsx';
import AdminBannersPage from './pages/admin/AdminBannersPage.tsx';
import AdminCustomersPage from './pages/admin/AdminCustomersPage.tsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.tsx';
import AdminAppealsPage from './pages/admin/AdminAppealsPage.tsx';
import AdminLabelStudioPage from './pages/admin/AdminLabelStudioPage.tsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.tsx';

// Admin Management
import AdminManagementStaffPage from './pages/admin/AdminManagementStaffPage.tsx';
import AdminManagementWorkerPage from './pages/admin/AdminManagementWorkerPage.tsx';
import AdminManagementCustomerPage from './pages/admin/AdminManagementCustomerPage.tsx';

// Worker Pages
import WorkerDashboardPage from './pages/worker/WorkerDashboardPage.tsx';
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
          {/* Admin Routes - No Layout */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/labels" element={<AdminLabelStudioPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/fabrics" element={<AdminFabricsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          <Route path="/admin/banners" element={<AdminBannersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/appeals" element={<AdminAppealsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/management/admins" element={<AdminManagementStaffPage />} />
          <Route path="/admin/management/workers" element={<AdminManagementWorkerPage />} />
          <Route path="/admin/management/customers" element={<AdminManagementCustomerPage />} />

          {/* Worker Routes - No Layout */}
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
          <Route path="/worker/stations/cutting" element={<WorkerCuttingPage />} />
          <Route path="/worker/stations/stitching" element={<WorkerStitchingPage />} />
          <Route path="/worker/stations/finishing" element={<WorkerFinishingPage />} />
          <Route path="/worker/stations/qc" element={<WorkerQCPage />} />
          <Route path="/worker/measurements" element={<WorkerMeasurementsPage />} />
          <Route path="/worker/history" element={<WorkerHistoryPage />} />
          <Route path="/worker/requisitions" element={<WorkerRequisitionsPage />} />
          <Route path="/worker/profile" element={<WorkerProfilePage />} />

          {/* Customer Routes - With Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/fabrics" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/custom-tailoring" element={<CustomTailoringPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/gift-cards" element={<GiftCardPage />} />
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
