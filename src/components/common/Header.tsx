import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  ShieldCheck,
  Package,
  Layers,
  ChevronDown,
  LogOut,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useEcommerce, CurrencyCode } from '../../context/EcommerceContext';
import { AISearchBar } from './AISearchBar';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartTotalCount,
    setIsCartOpen,
    wishlist,
    currentUser,
    logout,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    openProfileModal,
    switchDemoRole,
    searchQuery,
    setSearchQuery,
    setSelectedCategoryFilter,
    currency,
    setCurrency,
    resetToDemoData,
  } = useEcommerce();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('shop');
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Announcement & Switcher Bar */}
      <div className="bg-stone-950 px-4 py-1.5 text-xs text-stone-300 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full text-[11px]">
              <Sparkles className="w-3 h-3" />
              Summer Atelier 2026
            </span>
            <span className="hidden sm:inline text-stone-400">
              Complimentary carbon-neutral shipping on orders over $150 • Code: <strong className="text-stone-200">WELCOME10</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Quick Demo Persona Switcher */}
            <div className="flex items-center bg-stone-900 border border-stone-700/70 rounded-full p-0.5">
              <button
                id="role-switch-customer"
                onClick={() => switchDemoRole('customer')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  currentUser?.role === 'customer'
                    ? 'bg-stone-100 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Switch to customer mode"
              >
                Customer
              </button>
              <button
                id="role-switch-admin"
                onClick={() => switchDemoRole('admin')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-400 text-stone-950 shadow-sm font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Switch to admin inventory & sales analytics"
              >
                <ShieldCheck className="w-3 h-3" />
                Admin
              </button>
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-stone-900 text-stone-300 border border-stone-700/70 rounded-md px-2 py-0.5 text-[11px] font-medium cursor-pointer hover:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Demo Reset */}
            <button
              id="reset-demo-button"
              onClick={resetToDemoData}
              className="text-stone-400 hover:text-stone-200 text-[11px] flex items-center gap-1 transition-colors"
              title="Reset catalog, orders, and cart to original demo state"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setActiveTab('home');
                setSelectedCategoryFilter('All');
              }}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black text-lg tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-lg font-bold text-stone-100 flex items-center gap-1">
                  AURA
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-400 -mt-1 font-mono">
                  Atelier & Tech
                </span>
              </div>
            </button>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              <button
                id="nav-link-home"
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'home'
                    ? 'text-amber-400 bg-stone-800'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                Welcome
              </button>
              <button
                id="nav-link-shop"
                onClick={() => setActiveTab('shop')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'shop'
                    ? 'text-amber-400 bg-stone-800'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                Catalog
              </button>
              <button
                id="nav-link-orders"
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                  } else {
                    setActiveTab('orders');
                  }
                }}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'text-amber-400 bg-stone-800'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Package className="w-4 h-4" />
                Orders
              </button>
              <button
                id="nav-link-admin"
                onClick={() => {
                  if (currentUser?.role !== 'admin') {
                    switchDemoRole('admin');
                  } else {
                    setActiveTab('admin');
                  }
                }}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                    : 'text-amber-300/90 hover:text-amber-200 hover:bg-stone-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </button>
            </nav>
          </div>

          {/* AI Predictive Search Bar */}
          <div className="flex-1 max-w-lg mx-2 hidden lg:block">
            <AISearchBar idPrefix="header-desktop" />
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Toggle */}
            <button
              id="mobile-search-toggle"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="lg:hidden p-2 text-stone-300 hover:text-stone-100 rounded-full hover:bg-stone-800"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              onClick={() => {
                openProfileModal('wishlist');
              }}
              className="relative p-2 text-stone-300 hover:text-amber-300 rounded-full hover:bg-stone-800 transition-colors"
              title="View your saved wishlist items"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-100 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">{cartTotalCount}</span>
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-stone-700 bg-stone-800 hover:border-stone-500 transition-colors"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-stone-200 max-w-[90px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 pr-0.5" />
                </button>
              ) : (
                <button
                  id="header-login-btn"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium bg-amber-400 hover:bg-amber-300 text-stone-950 px-3 py-1.5 rounded-full transition-colors font-semibold"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && currentUser && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-stone-800">
                    <p className="text-xs font-semibold text-stone-100">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
                          : 'bg-stone-800 text-stone-300'
                      }`}>
                        {currentUser.role === 'admin' ? 'Store Administrator' : 'Verified Customer'}
                      </span>
                    </div>
                  </div>

                  <button
                    id="dropdown-profile-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openProfileModal('profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:text-stone-100 hover:bg-stone-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                    Account Profile
                  </button>

                  <button
                    id="dropdown-wishlist-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openProfileModal('wishlist');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:text-stone-100 hover:bg-stone-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                      My Wishlist
                    </span>
                    {wishlist.length > 0 && (
                      <span className="bg-amber-400 text-stone-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                        {wishlist.length}
                      </span>
                    )}
                  </button>

                  <button
                    id="dropdown-orders-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveTab('orders');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:text-stone-100 hover:bg-stone-800 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 text-stone-400" />
                    Order History
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      id="dropdown-admin-btn"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-amber-950/40 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Inventory & Sales Command
                    </button>
                  )}

                  <div className="border-t border-stone-800 my-1"></div>

                  <button
                    id="dropdown-logout-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isSearchExpanded && (
          <div className="lg:hidden pb-3 pt-1 border-t border-stone-800">
            <AISearchBar
              idPrefix="header-mobile"
              onSearchComplete={() => setIsSearchExpanded(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};
