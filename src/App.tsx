import React from 'react';
import { EcommerceProvider, useEcommerce } from './context/EcommerceContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { HomePage } from './components/home/HomePage';
import { ShopCatalog } from './components/shop/ShopCatalog';
import { OrdersPage } from './components/orders/OrdersPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/user/UserProfileModal';

const AppContent: React.FC = () => {
  const { activeTab } = useEcommerce();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Top Universal Navigation & Role Controls */}
      <Header />

      {/* Dynamic View Router */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'shop' && <ShopCatalog />}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer with trust markers and quick links */}
      <Footer />

      {/* Global Drawers, Modals & Toast Notifications */}
      <CartDrawer />
      <CheckoutModal />
      <ProductDetailModal />
      <AuthModal />
      <UserProfileModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <EcommerceProvider>
      <AppContent />
    </EcommerceProvider>
  );
}
