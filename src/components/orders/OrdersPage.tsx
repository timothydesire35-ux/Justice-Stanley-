import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Radio,
  Copy,
  Check,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';
import { Order, OrderStatus } from '../../types/ecommerce';
import { OrderProgressBar, getStatusProgress } from './OrderProgressBar';
import { ReceiptModal } from './ReceiptModal';
import { printOrderReceipt } from '../../utils/receiptGenerator';

interface CheckpointLog {
  id: string;
  status: OrderStatus;
  title: string;
  location: string;
  timestamp: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const OrdersPage: React.FC = () => {
  const {
    orders,
    currentUser,
    formatPrice,
    addToCart,
    setIsCartOpen,
    setActiveTab,
    addToast,
    updateOrderStatus,
  } = useEcommerce();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLiveAutoTracking, setIsLiveAutoTracking] = useState<boolean>(false);
  const [nextPingSeconds, setNextPingSeconds] = useState<number>(10);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Find currently selected order from live state
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || orders[0] || null;
  }, [orders, selectedOrderId]);

  // Keep selectedOrderId valid if orders list changes
  useEffect(() => {
    if (!orders.some((o) => o.id === selectedOrderId) && orders.length > 0) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  // Filter orders based on status tab and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = order.orderNumber.toLowerCase().includes(q);
        const matchTrk = order.trackingNumber.toLowerCase().includes(q);
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchCity = order.shippingDetails.city.toLowerCase().includes(q);
        const matchItems = order.items.some(
          (i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
        );
        if (!matchNum && !matchTrk && !matchName && !matchCity && !matchItems) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Counts for tabs
  const orderCounts = useMemo(() => {
    return {
      all: orders.length,
      processing: orders.filter((o) => o.status === 'Processing' || o.status === 'Pending').length,
      shipped: orders.filter((o) => o.status === 'Shipped').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
    };
  }, [orders]);

  // Real-time Live Simulation Ticker
  useEffect(() => {
    if (!isLiveAutoTracking || !selectedOrder || selectedOrder.status === 'Delivered') {
      return;
    }

    const interval = setInterval(() => {
      setNextPingSeconds((prev) => {
        if (prev <= 1) {
          // Advance status automatically
          handleAdvanceStatus(selectedOrder);
          setLastRefreshedAt(new Date());
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveAutoTracking, selectedOrder]);

  const handleAdvanceStatus = (order: Order) => {
    let nextStatus: OrderStatus = 'Processing';
    if (order.status === 'Pending') nextStatus = 'Processing';
    else if (order.status === 'Processing') nextStatus = 'Shipped';
    else if (order.status === 'Shipped') nextStatus = 'Delivered';
    else if (order.status === 'Delivered') {
      addToast('info', 'Order Complete', `Order #${order.orderNumber} is already marked as Delivered.`);
      return;
    }

    updateOrderStatus(order.id, nextStatus);
    addToast(
      'success',
      'Real-Time Status Updated',
      `Order #${order.orderNumber} advanced to "${nextStatus}".`
    );
  };

  const handleSetStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    setLastRefreshedAt(new Date());
  };

  const handleCopyTracking = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setIsCopied(true);
    addToast('info', 'Copied to Clipboard', `Tracking number ${trackingNumber} copied.`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRefreshPing = () => {
    setLastRefreshedAt(new Date());
    addToast('info', 'Telemetry Ping Sent', 'Latest GPS coordinates & courier checkpoint refreshed.');
  };

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.productId,
          sku: item.sku,
          name: item.name,
          subtitle: '',
          description: '',
          category: 'Audio & Tech',
          price: item.price,
          costPrice: item.price * 0.4,
          stock: 10,
          lowStockThreshold: 2,
          rating: 5,
          reviewCount: 1,
          images: [item.image],
          tags: [],
          specs: {},
          createdAt: new Date().toISOString(),
        },
        item.quantity,
        item.selectedColor,
        item.selectedSize
      );
    });
    setIsCartOpen(true);
    addToast(
      'success',
      'Added to Bag',
      `Added ${order.items.length} items from Order #${order.orderNumber} to your shopping bag.`
    );
  };

  // Generate realistic courier checkpoints based on order status and creation date
  const generateCheckpoints = (order: Order): CheckpointLog[] => {
    const createdDate = new Date(order.createdAt);
    const formatDate = (date: Date, hoursOffset = 0) => {
      const d = new Date(date.getTime() + hoursOffset * 3600000);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const isPending = order.status === 'Pending';
    const isProcessing = order.status === 'Processing';
    const isShipped = order.status === 'Shipped';
    const isDelivered = order.status === 'Delivered';

    return [
      {
        id: 'cp-1',
        status: 'Pending',
        title: 'Order Confirmed & Payment Settled',
        location: 'AURA Digital Atelier Checkout',
        timestamp: formatDate(createdDate, 0),
        description: 'Payment authorized and verified. Order routed to fulfillment queue.',
        isCompleted: true,
        isCurrent: isPending,
      },
      {
        id: 'cp-2',
        status: 'Processing',
        title: 'Vault Inspection & Anti-Tamper Packaging',
        location: 'San Francisco Fulfillment Vault #4',
        timestamp: formatDate(createdDate, 3),
        description: 'Master horology & acoustics quality verification passed. Serial logged.',
        isCompleted: isProcessing || isShipped || isDelivered,
        isCurrent: isProcessing,
      },
      {
        id: 'cp-3',
        status: 'Shipped',
        title: 'Courier Dispatched • Air Transit In Progress',
        location: 'SFO International Gateway Hub',
        timestamp: formatDate(createdDate, 8),
        description: `${order.shippingMethod} courier manifest accepted. Scanned on Line-Haul Flight AF-812.`,
        isCompleted: isShipped || isDelivered,
        isCurrent: isShipped,
      },
      {
        id: 'cp-4',
        status: 'Delivered',
        title: 'Out for Final Delivery & Safe Drop Handover',
        location: `${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zipCode}`,
        timestamp: isDelivered ? formatDate(createdDate, 26) : `Est: ${order.estimatedDeliveryDate}`,
        description: isDelivered
          ? 'Package delivered to recipient front entrance. Direct contactless signature recorded.'
          : `Scheduled for delivery to destination by end of day.`,
        isCompleted: isDelivered,
        isCurrent: isDelivered,
      },
    ];
  };

  return (
    <div id="orders-page" className="bg-stone-950 text-stone-100 min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="border-b border-stone-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Package className="w-4 h-4" />
              <span>Real-Time Order Tracking & Courier Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Purchases & Live Transit Radar
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Monitor active courier transit with real-time visual progress bars, GPS checkpoints, and order invoices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Auto-Tracker Simulation Toggle */}
            <button
              id="live-auto-tracking-toggle"
              onClick={() => {
                const nextState = !isLiveAutoTracking;
                setIsLiveAutoTracking(nextState);
                if (nextState) {
                  addToast(
                    'info',
                    'Live Telemetry Activated',
                    'Simulated real-time status updates and radar pings enabled.'
                  );
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                isLiveAutoTracking
                  ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
              }`}
              title="Toggle automatic real-time simulation"
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveAutoTracking ? 'animate-pulse text-stone-950' : 'text-amber-400'}`} />
              <span>{isLiveAutoTracking ? `Live Radar ON (${nextPingSeconds}s)` : 'Simulate Live Updates'}</span>
            </button>

            <button
              id="orders-shop-more-btn"
              onClick={() => setActiveTab('shop')}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Shop Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Orders Empty State */}
        {orders.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-4 max-w-lg mx-auto shadow-2xl">
            <Package className="w-14 h-14 text-stone-600 mx-auto" />
            <h3 className="text-xl font-bold text-stone-200 font-serif">No Order History Found</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              You haven't completed any atelier orders yet. Discover our curated collection of acoustic engineering and Swiss horology to begin.
            </p>
            <button
              onClick={() => setActiveTab('shop')}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold px-6 py-2.5 rounded-xl shadow transition-transform active:scale-95"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Filter Tabs & Orders List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Filter Tabs & Search Bar */}
              <div className="bg-stone-900/80 border border-stone-800/90 rounded-2xl p-3.5 space-y-3">
                {/* Search in Orders */}
                <div className="relative">
                  <input
                    id="orders-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order #, SKU, city, item..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2 pl-8 pr-8 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-100 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Filter Chips */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'All', label: 'All Orders', count: orderCounts.all },
                    { id: 'Processing', label: 'Processing', count: orderCounts.processing },
                    { id: 'Shipped', label: 'In Transit', count: orderCounts.shipped },
                    { id: 'Delivered', label: 'Delivered', count: orderCounts.delivered },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      id={`orders-filter-tab-${tab.id.toLowerCase()}`}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all ${
                        statusFilter === tab.id
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                          : 'bg-stone-950 text-stone-400 hover:text-stone-200 hover:bg-stone-850 border border-stone-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          statusFilter === tab.id
                            ? 'bg-stone-950/20 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 space-y-2">
                  <Package className="w-8 h-8 text-stone-600 mx-auto" />
                  <p className="text-xs font-semibold text-stone-300">No matching orders found</p>
                  <p className="text-[11px] text-stone-400">Try changing your search keywords or filter tab.</p>
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setSearchQuery('');
                    }}
                    className="text-xs text-amber-400 hover:underline pt-1 block mx-auto"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        id={`order-list-card-${order.id}`}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 relative group ${
                          isSelected
                            ? 'bg-stone-900 border-amber-400 shadow-xl ring-2 ring-amber-400/20'
                            : 'bg-stone-900/60 border-stone-800/90 hover:border-stone-700 hover:bg-stone-900'
                        }`}
                      >
                        {/* Card Top: Order Number, Date, Status */}
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-stone-400 ml-2 font-mono">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              id={`order-print-quick-btn-${order.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptModalOrder(order);
                                setIsReceiptModalOpen(true);
                              }}
                              className="p-1 rounded-md text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
                              title="Generate & Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : order.status === 'Shipped'
                                  ? 'bg-sky-950/80 text-sky-300 border-sky-800 animate-pulse'
                                  : order.status === 'Cancelled'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-400'
                                    : order.status === 'Shipped'
                                    ? 'bg-sky-400'
                                    : 'bg-amber-400'
                                }`}
                              />
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar for this Order (COMPACT) */}
                        <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                          <OrderProgressBar
                            status={order.status}
                            size="compact"
                            isSimulating={isLiveAutoTracking && isSelected}
                          />
                        </div>

                        {/* Card Bottom: Product Thumbnails & Summary */}
                        <div className="flex items-center gap-3 pt-1 border-t border-stone-800/60">
                          <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.name}
                                className="inline-block h-9 w-9 rounded-lg object-cover ring-2 ring-stone-900 bg-stone-950"
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="h-9 w-9 rounded-lg bg-stone-800 ring-2 ring-stone-900 text-[10px] font-bold flex items-center justify-center text-stone-300">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-xs">
                            <div className="text-stone-300 truncate font-medium">
                              {order.items.map((i) => i.name).join(', ')}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • To {order.shippingDetails.city}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-xs text-amber-400">
                              {formatPrice(order.total)}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {order.shippingMethod}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Selected Order Detailed Real-Time Tracking (7 cols) */}
            {selectedOrder ? (
              <div
                id="order-detail-tracking-hub"
                className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300"
              >
                {/* Detailed View Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 font-mono">Order Tracking ID</span>
                      <span className="text-[10px] bg-stone-950 border border-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-mono">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold font-mono text-stone-100 mt-1">
                      {selectedOrder.orderNumber}
                    </h3>
                  </div>

                  {/* Actions: Buy Again, Print Invoice */}
                  <div className="flex items-center gap-2">
                    <button
                      id="order-buy-again-btn"
                      onClick={() => handleBuyAgain(selectedOrder)}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Re-Order</span>
                    </button>

                    <button
                      id="order-print-invoice-btn"
                      onClick={() => {
                        setReceiptModalOrder(selectedOrder);
                        setIsReceiptModalOpen(true);
                      }}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Generate Official Receipt / Tax Invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                </div>

                {/* PRIMARY VISUAL PROGRESS BAR & REAL-TIME TRACKER CARD */}
                <div className="bg-stone-950 border border-stone-800/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-inner relative overflow-hidden">
                  {/* Card Title & Courier ID */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-850 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                            Courier Dispatch Status
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            GPS Beacon Active
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Carrier: <strong className="text-stone-200">FedEx White-Glove Atelier Express</strong> • {selectedOrder.shippingMethod}
                        </p>
                      </div>
                    </div>

                    {/* Tracking ID & Copy */}
                    <div className="flex items-center gap-2">
                      <button
                        id="copy-tracking-id-btn"
                        onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                        className="bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors group"
                        title="Click to copy tracking ID"
                      >
                        <span className="text-amber-400 font-bold">{selectedOrder.trackingNumber}</span>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* FULL MULTI-STAGE VISUAL PROGRESS BAR */}
                  <div className="py-2">
                    <OrderProgressBar
                      status={selectedOrder.status}
                      size="full"
                      isSimulating={isLiveAutoTracking}
                    />
                  </div>

                  {/* Real-Time Simulation & Stage Advancement Controls */}
                  <div className="pt-3 border-t border-stone-850 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Status Controller:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Advance Step Button */}
                      <button
                        id="order-advance-status-btn"
                        onClick={() => handleAdvanceStatus(selectedOrder)}
                        disabled={selectedOrder.status === 'Delivered'}
                        className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 fill-stone-950" />
                        <span>Advance Stage</span>
                      </button>

                      {/* Manual Quick Status Chips */}
                      {(['Processing', 'Shipped', 'Delivered'] as OrderStatus[]).map((st) => (
                        <button
                          key={st}
                          id={`order-set-status-${st.toLowerCase()}`}
                          onClick={() => handleSetStatus(selectedOrder.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            selectedOrder.status === st
                              ? 'bg-stone-800 text-amber-400 border-amber-400 font-bold'
                              : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}

                      {/* Ping Courier Satellite */}
                      <button
                        id="order-refresh-ping-btn"
                        onClick={handleRefreshPing}
                        className="bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 p-1.5 rounded-lg border border-stone-800 transition-colors"
                        title="Ping Courier Satellite for latest GPS coordinates"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* REAL-TIME COURIER CHECKPOINT LOGS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-semibold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Real-Time Courier Checkpoints & Telemetry
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Last Radar Ping: {lastRefreshedAt.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    {generateCheckpoints(selectedOrder).map((cp, idx, arr) => (
                      <div key={cp.id} className="flex items-start gap-3 relative">
                        {/* Timeline Connector Line */}
                        {idx !== arr.length - 1 && (
                          <div
                            className={`absolute left-3.5 top-7 bottom-0 w-0.5 -translate-x-1/2 ${
                              cp.isCompleted ? 'bg-emerald-500/40' : 'bg-stone-800'
                            }`}
                          />
                        )}

                        {/* Node Icon */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 transition-colors ${
                            cp.isCompleted
                              ? 'bg-emerald-500 text-stone-950 font-bold'
                              : cp.isCurrent
                              ? 'bg-amber-400 text-stone-950 animate-pulse font-bold'
                              : 'bg-stone-900 border border-stone-800 text-stone-600'
                          }`}
                        >
                          {cp.isCompleted ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : cp.isCurrent ? (
                            <Radio className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span className="font-mono text-[10px]">{idx + 1}</span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 text-xs space-y-0.5">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span
                              className={`font-bold ${
                                cp.isCurrent
                                  ? 'text-amber-300'
                                  : cp.isCompleted
                                  ? 'text-stone-200'
                                  : 'text-stone-500'
                              }`}
                            >
                              {cp.title}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {cp.timestamp}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-400 font-mono">
                            {cp.location}
                          </div>

                          <p className="text-[11px] text-stone-400 leading-relaxed pt-0.5">
                            {cp.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchased Pieces Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Purchased Pieces ({selectedOrder.items.length})
                  </h4>

                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-stone-900 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-100">{item.name}</div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono">SKU: {item.sku}</span>
                              {item.selectedColor && (
                                <span className="bg-stone-900 px-1.5 py-0.5 rounded text-[10px] text-stone-300">
                                  {item.selectedColor}
                                </span>
                              )}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="font-bold text-stone-100">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {formatPrice(item.price)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destination & Settlement Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-800 text-xs">
                  {/* Shipping Address */}
                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-1">
                    <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                      Shipping Destination
                    </span>
                    <div className="font-bold text-stone-200">
                      {selectedOrder.shippingDetails.fullName}
                    </div>
                    <div className="text-stone-400 leading-relaxed text-[11px]">
                      {selectedOrder.shippingDetails.address}
                      {selectedOrder.shippingDetails.apartment && `, ${selectedOrder.shippingDetails.apartment}`}
                      <br />
                      {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state}{' '}
                      {selectedOrder.shippingDetails.zipCode}
                      <br />
                      <span className="text-stone-400 font-mono text-[10px]">{selectedOrder.shippingDetails.phone}</span>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-1.5 text-stone-400">
                    <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block mb-1">
                      Payment Settlement ({selectedOrder.paymentMethod})
                    </span>
                    <div className="flex justify-between text-[11px]">
                      <span>Subtotal</span>
                      <span className="font-mono text-stone-200">
                        {formatPrice(selectedOrder.subtotal)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-[11px] text-emerald-400">
                        <span>Discount ({selectedOrder.couponCode})</span>
                        <span className="font-mono">-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px]">
                      <span>Courier Shipping</span>
                      <span className="font-mono text-stone-200">
                        {selectedOrder.shippingFee === 0 ? 'FREE' : formatPrice(selectedOrder.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-stone-100 border-t border-stone-800 pt-1.5">
                      <span>Total Settled</span>
                      <span className="font-mono text-amber-400 text-sm">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Interactive Print Receipt Generator Modal */}
      <ReceiptModal
        order={receiptModalOrder}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
