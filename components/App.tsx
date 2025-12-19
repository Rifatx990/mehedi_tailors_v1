
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';

// Lazy load pages for better performance
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CustomTailoringPage from './pages/CustomTailoringPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AuthPage from './pages/AuthPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsPage from './pages/ReturnsPage';
import SizeGuidePage from './pages/SizeGuidePage';
import TrackOrderPage from './pages/TrackOrderPage';
import GiftCardPage from './pages/GiftCardPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Admin Routes - No Layout */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Customer Routes - With Layout */}
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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/gift-cards" element={<GiftCardPage />} />
                <Route path="*" element={<div className="py-32 text-center text-4xl serif">Coming Soon</div>} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
