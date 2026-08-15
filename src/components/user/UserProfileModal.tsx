import React from 'react';
import {
  X,
  Package,
  ShieldCheck,
  UserCheck,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Heart,
  ShoppingBag,
  Trash2,
  Eye,
  Star,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';
import { OrderProgressBar } from '../orders/OrderProgressBar';
import { printOrderReceipt } from '../../utils/receiptGenerator';

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    activeProfileTab,
    setActiveProfileTab,
    currentUser,
    products,
    wishlist,
    removeFromWishlist,
    clearWishlist,
    moveWishlistToCart,
    addAllWishlistToCart,
    orders,
    formatPrice,
    logout,
    switchDemoRole,
    setActiveTab,
    setSelectedProductForModal,
    setIsCartOpen,
  } = useEcommerce();

  if (!isProfileModalOpen || !currentUser) return null;

  // Filter orders for this user or show all demo customer orders
  const userOrders = orders.filter(
    (o) => o.userId === currentUser.id || o.customerEmail === currentUser.email || currentUser.role === 'admin'
  );

  // Filter wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const totalWishlistValue = wishlistProducts.reduce((sum, p) => sum + p.price, 0);
  const inStockWishlistCount = wishlistProducts.filter((p) => p.stock > 0).length;

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsProfileModalOpen(false);
      }}
    >
      <div
        id="profile-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-400/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-stone-100">{currentUser.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'Store Administrator' : 'Verified Member'}
                </span>
              </div>
              <p className="text-xs text-stone-400">{currentUser.email}</p>
            </div>
          </div>

          <button
            id="profile-modal-close-btn"
            onClick={() => setIsProfileModalOpen(false)}
            className="text-stone-400 hover:text-stone-100 p-1.5 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-950 px-4 sm:px-6 pt-2 border-b border-stone-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            id="profile-tab-btn-overview"
            onClick={() => setActiveProfileTab('profile')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeProfileTab === 'profile'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile & Account</span>
          </button>

          <button
            id="profile-tab-btn-wishlist"
            onClick={() => setActiveProfileTab('wishlist')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeProfileTab === 'wishlist'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeProfileTab === 'wishlist' ? 'fill-amber-400' : 'text-rose-400'}`} />
            <span>Wishlist</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeProfileTab === 'wishlist'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              {wishlist.length}
            </span>
          </button>

          <button
            id="profile-tab-btn-orders"
            onClick={() => setActiveProfileTab('orders')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeProfileTab === 'orders'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Order History</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeProfileTab === 'orders'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              {userOrders.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: PROFILE & ACCOUNT */}
          {activeProfileTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Persona Switch Helper */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-stone-200">Active Mode: {currentUser.role.toUpperCase()}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {currentUser.role === 'admin'
                      ? 'You have complete control over live inventory, product catalogs, and sales analytics.'
                      : 'You have verified access to personal checkout, order tracking, and wishlist synchronization.'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    id="profile-switch-role-btn"
                    onClick={() => {
                      switchDemoRole(currentUser.role === 'admin' ? 'customer' : 'admin');
                      setIsProfileModalOpen(false);
                    }}
                    className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {currentUser.role === 'admin' ? <UserCheck className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                    Switch to {currentUser.role === 'admin' ? 'Customer' : 'Admin'}
                  </button>
                </div>
              </div>

              {/* Quick Jump Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Wishlist Quick Card */}
                <div
                  onClick={() => setActiveProfileTab('wishlist')}
                  className="bg-stone-950 border border-stone-800 hover:border-amber-400/50 rounded-2xl p-4 cursor-pointer transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                      <Heart className="w-4 h-4 fill-rose-500/30" />
                    </div>
                    <div>
                      <h5 className="font-bold text-stone-200 group-hover:text-amber-300 transition-colors">
                        Saved Wishlist
                      </h5>
                      <p className="text-[11px] text-stone-400">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-300 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Orders Quick Card */}
                <div
                  onClick={() => setActiveProfileTab('orders')}
                  className="bg-stone-950 border border-stone-800 hover:border-amber-400/50 rounded-2xl p-4 cursor-pointer transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-stone-200 group-hover:text-amber-300 transition-colors">
                        Order History
                      </h5>
                      <p className="text-[11px] text-stone-400">
                        {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'} placed
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Saved Addresses (if available) */}
              {currentUser.savedAddresses && currentUser.savedAddresses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Default Shipping Destination
                  </h4>
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-300 space-y-1">
                    <div className="font-medium text-stone-100">{currentUser.savedAddresses[0].fullName}</div>
                    <div>{currentUser.savedAddresses[0].address}, {currentUser.savedAddresses[0].apartment}</div>
                    <div>{currentUser.savedAddresses[0].city}, {currentUser.savedAddresses[0].state} {currentUser.savedAddresses[0].zipCode}</div>
                    <div className="text-stone-400 text-[11px] pt-1">{currentUser.savedAddresses[0].phone}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEDICATED WISHLIST SECTION */}
          {activeProfileTab === 'wishlist' && (
            <div className="space-y-4 animate-in fade-in duration-200" id="profile-wishlist-section">
              {/* Wishlist Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 border border-stone-800 rounded-2xl p-4">
                <div>
                  <h4 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    Saved Items ({wishlistProducts.length})
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {wishlistProducts.length > 0
                      ? `Total estimated catalog value: ${formatPrice(totalWishlistValue)}`
                      : 'Save products you love to inspect or purchase later.'}
                  </p>
                </div>

                {wishlistProducts.length > 0 && (
                  <div className="flex items-center gap-2">
                    {inStockWishlistCount > 0 && (
                      <button
                        id="wishlist-add-all-btn"
                        onClick={addAllWishlistToCart}
                        className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add All Available ({inStockWishlistCount})</span>
                      </button>
                    )}

                    <button
                      id="wishlist-clear-all-btn"
                      onClick={clearWishlist}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 px-3 py-1.5 rounded-xl text-xs transition-colors"
                      title="Remove all items from wishlist"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist Content */}
              {wishlistProducts.length === 0 ? (
                <div
                  id="profile-wishlist-empty"
                  className="bg-stone-950 border border-stone-800 rounded-2xl p-8 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-200 font-serif">Your Wishlist is Empty</h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Explore our curated collection of luxury acoustics, horology, and apparel. Click the heart icon on any piece to save it for later.
                  </p>
                  <button
                    id="wishlist-empty-browse-btn"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setActiveTab('shop');
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow mt-2"
                  >
                    <span>Explore Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3" id="profile-wishlist-items-list">
                  {wishlistProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

                    return (
                      <div
                        key={product.id}
                        id={`wishlist-item-${product.id}`}
                        className="bg-stone-950 border border-stone-800 hover:border-stone-700 rounded-2xl p-3.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Left: Thumbnail & Details */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setIsProfileModalOpen(false);
                            }}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-900 shrink-0 cursor-pointer border border-stone-800 group-hover:border-amber-400/50 transition-colors"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.discountPercent && (
                              <span className="absolute top-1 left-1 bg-rose-500 text-white font-bold text-[9px] px-1 rounded">
                                -{product.discountPercent}%
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                                {product.category}
                              </span>
                              <div className="flex items-center gap-0.5 text-stone-400 text-[10px]">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{product.rating}</span>
                              </div>
                            </div>

                            <h5
                              onClick={() => {
                                setSelectedProductForModal(product);
                                setIsProfileModalOpen(false);
                              }}
                              className="font-bold text-stone-100 group-hover:text-amber-300 transition-colors truncate cursor-pointer text-xs sm:text-sm font-serif"
                              title={product.name}
                            >
                              {product.name}
                            </h5>

                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-bold font-mono text-stone-100">
                                  {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-[10px] line-through text-stone-500 font-mono">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                              </div>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  isOutOfStock
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : isLowStock
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${product.stock} left` : 'In Stock'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800/80">
                          <button
                            id={`wishlist-inspect-btn-${product.id}`}
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setIsProfileModalOpen(false);
                            }}
                            className="bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-stone-100 p-2 rounded-xl border border-stone-700 transition-colors"
                            title="Inspect product specifications"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            id={`wishlist-move-cart-btn-${product.id}`}
                            onClick={() => moveWishlistToCart(product.id)}
                            disabled={isOutOfStock}
                            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 flex-1 sm:flex-initial justify-center"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? 'Out of Stock' : 'Move to Bag'}</span>
                          </button>

                          <button
                            id={`wishlist-remove-btn-${product.id}`}
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-stone-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/20 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDER HISTORY */}
          {activeProfileTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  Your Order Logs ({userOrders.length})
                </h4>
                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setActiveTab('orders');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-0.5 font-medium"
                >
                  Open Dedicated Portal
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 space-y-2">
                  <Package className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  <p className="font-semibold text-stone-300">No orders placed yet.</p>
                  <p className="text-[11px]">Once you checkout, your tracking details and receipts will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-stone-950 border border-stone-800 rounded-2xl p-4 hover:border-stone-700 transition-colors space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
                        <div>
                          <span className="font-mono font-bold text-stone-100 text-xs sm:text-sm">{order.orderNumber}</span>
                          <span className="text-stone-500 text-[11px] ml-2">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : order.status === 'Shipped'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="font-bold text-stone-100 font-mono">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-850">
                        <OrderProgressBar status={order.status} size="compact" />
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {order.items.map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.name}
                                className="inline-block h-8 w-8 rounded-lg object-cover ring-2 ring-stone-900"
                              />
                            ))}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            id={`profile-order-print-btn-${order.id}`}
                            onClick={() => printOrderReceipt(order)}
                            className="text-[11px] text-stone-300 hover:text-amber-400 font-semibold flex items-center gap-1 bg-stone-900 hover:bg-stone-850 px-2.5 py-1 rounded-lg border border-stone-800 transition-colors"
                            title="Print Official Tax Receipt"
                          >
                            <Printer className="w-3 h-3 text-amber-400" />
                            <span>Receipt</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileModalOpen(false);
                              setActiveTab('orders');
                            }}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-stone-900 hover:bg-stone-850 px-2.5 py-1 rounded-lg border border-stone-800 transition-colors"
                          >
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Track Live</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between">
          <button
            id="profile-logout-btn"
            onClick={() => {
              setIsProfileModalOpen(false);
              logout();
            }}
            className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

