import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Download,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Layers,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Zap,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useEcommerce } from '../../context/EcommerceContext';
import { Product, ProductCategory, Order, OrderStatus } from '../../types/ecommerce';
import { ReceiptModal } from '../orders/ReceiptModal';
import { printOrderReceipt } from '../../utils/receiptGenerator';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Audio & Tech',
  'Apparel & Wear',
  'Accessories',
  'Home & Living',
  'Wellness & Care',
];

const COLORS = ['#fbbf24', '#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#f87171'];

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    orders,
    updateOrderStatus,
    formatPrice,
    setSelectedProductForModal,
    addToast,
    switchDemoRole,
  } = useEcommerce();

  const [activeTab, setActiveTab] = useState<'inventory' | 'analytics' | 'orders'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');

  // Add/Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    subtitle: '',
    description: '',
    category: 'Audio & Tech' as ProductCategory,
    price: 199,
    originalPrice: 249,
    costPrice: 90,
    stock: 20,
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    tags: 'Best Seller, Wireless, Premium',
    specKeys: 'Driver Size, Battery Life, Connectivity',
    specVals: '40mm Titanium, 45 Hours, Bluetooth 5.3',
  });

  // Selected Order for Inspection Modal
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Quick Restock Custom State
  const [customRestockId, setCustomRestockId] = useState<string | null>(null);
  const [customRestockQty, setCustomRestockQty] = useState<number>(10);

  // --------------------------------------------------------------------------
  // Financial & Analytics Calculations
  // --------------------------------------------------------------------------
  const totalGrossRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.status !== 'Cancelled' ? order.total : 0), 0);
  }, [orders]);

  const totalUnitsSold = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum +
        (order.status !== 'Cancelled'
          ? order.items.reduce((iSum, item) => iSum + item.quantity, 0)
          : 0),
      0
    );
  }, [orders]);

  const totalCost = useMemo(() => {
    let cost = 0;
    orders.forEach((order) => {
      if (order.status !== 'Cancelled') {
        order.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const itemCost = prod ? prod.costPrice : item.price * 0.45;
          cost += itemCost * item.quantity;
        });
      }
    });
    return cost;
  }, [orders, products]);

  const grossProfit = Math.max(0, totalGrossRevenue - totalCost);
  const profitMarginPercent =
    totalGrossRevenue > 0 ? Math.round((grossProfit / totalGrossRevenue) * 100) : 0;
  const averageOrderValue =
    orders.length > 0 ? totalGrossRevenue / Math.max(1, orders.filter((o) => o.status !== 'Cancelled').length) : 0;

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 0).length;
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.stock, 0);
  }, [products]);

  // Chart 1: Revenue Timeline
  const salesTimelineData = useMemo(() => {
    const data = [
      { date: 'Aug 08', revenue: 640, profit: 380, orders: 2 },
      { date: 'Aug 09', revenue: 980, profit: 540, orders: 4 },
      { date: 'Aug 10', revenue: 1420, profit: 820, orders: 5 },
      { date: 'Aug 11', revenue: 1150, profit: 690, orders: 3 },
      { date: 'Aug 12', revenue: 1890, profit: 1140, orders: 6 },
      { date: 'Aug 13', revenue: 1640, profit: 990, orders: 4 },
      {
        date: 'Today',
        revenue: Math.round(totalGrossRevenue * 0.4) + 850,
        profit: Math.round(grossProfit * 0.4) + 480,
        orders: orders.length,
      },
    ];
    return data;
  }, [totalGrossRevenue, grossProfit, orders.length]);

  // Chart 2: Category Breakdown
  const categorySalesData = useMemo(() => {
    const catMap: Record<string, number> = {};
    products.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + p.stock * p.price;
    });
    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [products]);

  // Chart 3: Top SKUs by Value & Volume
  const topProductsData = useMemo(() => {
    return products
      .map((p) => ({
        name: p.name.split(' ').slice(0, 3).join(' '),
        stock: p.stock,
        revenue: p.price * (50 - Math.min(45, p.stock)),
        margin: Math.round(((p.price - p.costPrice) / p.price) * 100),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [products]);

  // Filtered Products for Inventory Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (stockStatusFilter === 'low' && (p.stock <= 0 || p.stock > p.lowStockThreshold)) return false;
      if (stockStatusFilter === 'out' && p.stock > 0) return false;
      if (stockStatusFilter === 'healthy' && p.stock <= p.lowStockThreshold) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mSku = p.sku.toLowerCase().includes(q);
        const mCat = p.category.toLowerCase().includes(q);
        if (!mName && !mSku && !mCat) return false;
      }
      return true;
    });
  }, [products, categoryFilter, stockStatusFilter, searchQuery]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setFormData({
      sku: `AUR-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      subtitle: '',
      description: '',
      category: 'Audio & Tech',
      price: 199,
      originalPrice: 249,
      costPrice: 85,
      stock: 25,
      lowStockThreshold: 5,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      tags: 'New Drop, Handcrafted',
      specKeys: 'Material, Warranty, Origin',
      specVals: 'Aerospace Grade, 2 Years, Switzerland',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    const specEntries = Object.entries(prod.specs);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      subtitle: prod.subtitle,
      description: prod.description,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || Math.round(prod.price * 1.2),
      costPrice: prod.costPrice,
      stock: prod.stock,
      lowStockThreshold: prod.lowStockThreshold,
      imageUrl: prod.images[0] || '',
      tags: prod.tags.join(', '),
      specKeys: specEntries.map((e) => e[0]).join(', '),
      specVals: specEntries.map((e) => e[1]).join(', '),
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    // Parse specs
    const keys = formData.specKeys.split(',').map((s) => s.trim());
    const vals = formData.specVals.split(',').map((s) => s.trim());
    const specsObj: Record<string, string> = {};
    keys.forEach((k, i) => {
      if (k) specsObj[k] = vals[i] || 'Standard';
    });

    const tagsArr = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProductId) {
      updateProduct(editingProductId, {
        sku: formData.sku,
        name: formData.name,
        subtitle: formData.subtitle,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        images: [formData.imageUrl],
        tags: tagsArr,
        specs: specsObj,
      });
    } else {
      addProduct({
        sku: formData.sku,
        name: formData.name,
        subtitle: formData.subtitle,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        images: [formData.imageUrl],
        tags: tagsArr,
        specs: specsObj,
        rating: 5.0,
        reviewCount: 1,
        featured: true,
      });
    }

    setIsProductModalOpen(false);
  };

  // CSV Export for Inventory
  const handleExportInventoryCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Price', 'Cost Price', 'Stock Level', 'Margin %'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.costPrice,
      p.stock,
      `${Math.round(((p.price - p.costPrice) / p.price) * 100)}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AURA_Inventory_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Report Exported', 'Inventory CSV downloaded successfully.');
  };

  // CSV Export for Orders
  const handleExportOrdersCSV = () => {
    const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Items Count', 'Total ($)', 'Status', 'Date'];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerEmail}"`,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.total,
      `"${o.status}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AURA_Orders_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Orders Exported', 'Customer orders CSV downloaded successfully.');
  };

  // Real-time sale simulation
  const handleSimulateSale = () => {
    const inStock = products.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      addToast('warning', 'All Out of Stock', 'No in-stock items available to simulate sales.');
      return;
    }
    const randProd = inStock[Math.floor(Math.random() * inStock.length)];
    restockProduct(randProd.id, -1);
    addToast('info', 'Live Real-Time Event', `Customer order incoming: 1x ${randProd.name}. Stock auto-decremented.`);
  };

  return (
    <div id="admin-dashboard-page" className="bg-stone-950 text-stone-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Fast Mode Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrative Operations & Executive Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 flex items-center gap-3">
              Inventory & Sales Command Center
              <span className="text-xs font-mono font-normal bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full font-bold">
                REAL-TIME LIVE
              </span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Real-time stock level synchronization, catalog CRUD management, and order fulfillment.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              id="admin-simulate-sale-btn"
              onClick={handleSimulateSale}
              className="bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700 hover:border-amber-400/80 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Simulate a real-time sale to observe reactive stock decrement"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Live Sale</span>
            </button>

            <button
              id="admin-add-product-btn"
              onClick={handleOpenAddProduct}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards Grid (5 KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Gross Sales */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Gross Sales</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-100">
              {formatPrice(totalGrossRevenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% this cycle</span>
            </div>
          </div>

          {/* Card 2: Net Profit & Margin */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Net Gross Margin</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {formatPrice(grossProfit)}
            </div>
            <div className="text-[11px] text-stone-400 font-mono">
              Margin Rate: <strong className="text-stone-200">{profitMarginPercent}%</strong>
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Orders Processed</span>
              <Package className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-100">
              {orders.length} <span className="text-xs text-stone-400 font-normal">({totalUnitsSold} pcs)</span>
            </div>
            <div className="text-[11px] text-stone-400">
              AOV: <strong className="text-stone-200 font-mono">{formatPrice(averageOrderValue)}</strong>
            </div>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className={`bg-stone-900 border rounded-2xl p-4.5 space-y-1.5 ${
            lowStockCount > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-stone-800'
          }`}>
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Low Stock Alerts</span>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-stone-100'}`}>
              {lowStockCount} <span className="text-xs text-stone-400 font-normal">SKUs</span>
            </div>
            <div className="text-[11px] text-stone-400">
              {lowStockCount > 0 ? 'Requires vendor reorder' : 'All stocks optimal'}
            </div>
          </div>

          {/* Card 5: Catalog Value */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Inventory Asset Value</span>
              <Boxes className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-100">
              {formatPrice(totalInventoryValue)}
            </div>
            <div className="text-[11px] text-stone-400">
              Across <strong className="text-stone-200">{products.length}</strong> active SKUs
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 gap-2 sm:gap-6 text-xs font-semibold">
          <button
            id="admin-tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Live Stock & Inventory Table</span>
            <span className="bg-stone-800 text-stone-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {products.length}
            </span>
          </button>

          <button
            id="admin-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sales Analytics & Margins</span>
          </button>

          <button
            id="admin-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order Fulfillment Hub</span>
            <span className="bg-stone-800 text-stone-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {orders.length}
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: INVENTORY & STOCK MANAGER                                    */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <input
                    id="admin-inventory-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by SKU, product name..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                </div>

                {/* Category Select */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Stock Status Pills */}
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setStockStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      stockStatusFilter === 'all'
                        ? 'bg-stone-800 text-stone-100 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('low')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      stockStatusFilter === 'low'
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    Low ({lowStockCount})
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('out')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      stockStatusFilter === 'out'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    Out ({outOfStockCount})
                  </button>
                </div>
              </div>

              {/* Export Action */}
              <button
                id="export-inventory-csv-btn"
                onClick={handleExportInventoryCSV}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Stock CSV</span>
              </button>
            </div>

            {/* Products Inventory Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 border-b border-stone-800 text-[11px] uppercase tracking-wider text-stone-400 font-mono">
                    <tr>
                      <th className="py-3.5 px-4">Item & SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right">Retail / Cost</th>
                      <th className="py-3.5 px-4 text-right">Margin</th>
                      <th className="py-3.5 px-4 text-center">Live Stock</th>
                      <th className="py-3.5 px-4 text-center">Quick Restock</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80 font-normal">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-stone-500">
                          No matching inventory items found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const isOut = product.stock <= 0;
                        const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;
                        const marginPercent = Math.round(
                          ((product.price - product.costPrice) / product.price) * 100
                        );

                        return (
                          <tr
                            key={product.id}
                            id={`inventory-row-${product.id}`}
                            className="hover:bg-stone-850/60 transition-colors"
                          >
                            {/* Title & SKU */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-11 h-11 rounded-lg object-cover bg-stone-950 border border-stone-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div
                                    onClick={() => setSelectedProductForModal(product)}
                                    className="font-bold text-stone-100 hover:text-amber-400 transition-colors cursor-pointer truncate max-w-[220px]"
                                  >
                                    {product.name}
                                  </div>
                                  <div className="text-[11px] font-mono text-amber-400/90">
                                    {product.sku}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4 text-stone-300">
                              <span className="bg-stone-950 border border-stone-800 px-2 py-0.5 rounded-md text-[11px]">
                                {product.category}
                              </span>
                            </td>

                            {/* Price / Cost */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="font-mono font-bold text-stone-100">
                                {formatPrice(product.price)}
                              </div>
                              <div className="font-mono text-[10px] text-stone-500">
                                Cost: {formatPrice(product.costPrice)}
                              </div>
                            </td>

                            {/* Profit Margin */}
                            <td className="py-3.5 px-4 text-right">
                              <span className="font-mono font-semibold text-emerald-400">
                                {marginPercent}%
                              </span>
                            </td>

                            {/* Stock Badge */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                                  isOut
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : isLow
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {isOut ? '0 (OUT)' : `${product.stock} units`}
                              </span>
                            </td>

                            {/* Quick Restock Buttons */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  id={`restock-5-${product.id}`}
                                  onClick={() => restockProduct(product.id, 5)}
                                  className="bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 px-2 py-1 rounded text-[10px] font-mono transition-colors"
                                  title="Add 5 units"
                                >
                                  +5
                                </button>
                                <button
                                  id={`restock-10-${product.id}`}
                                  onClick={() => restockProduct(product.id, 10)}
                                  className="bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 px-2 py-1 rounded text-[10px] font-mono transition-colors"
                                  title="Add 10 units"
                                >
                                  +10
                                </button>
                                <button
                                  id={`restock-25-${product.id}`}
                                  onClick={() => restockProduct(product.id, 25)}
                                  className="bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 px-2 py-1 rounded text-[10px] font-mono transition-colors"
                                  title="Add 25 units"
                                >
                                  +25
                                </button>
                              </div>
                            </td>

                            {/* Actions (Edit / Delete) */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  id={`edit-prod-${product.id}`}
                                  onClick={() => handleOpenEditProduct(product)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                                  title="Edit product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`delete-prod-${product.id}`}
                                  onClick={() => {
                                    if (confirm(`Remove "${product.name}" from catalog?`)) {
                                      deleteProduct(product.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: SALES ANALYTICS & CHARTS                                    */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Chart Grid: Area Chart + Category Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue & Profit Timeline (8 cols) */}
              <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold font-serif text-base text-stone-100">
                      Revenue vs. Net Margin Velocity
                    </h3>
                    <p className="text-xs text-stone-400">
                      Daily order authorization volume and estimated gross profit
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-stone-950 border border-stone-800 px-3 py-1 rounded-lg text-amber-400">
                    Trailing 7 Days
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTimelineData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={11} />
                      <YAxis stroke="#78716c" fontSize={11} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Gross Sales ($)"
                        stroke="#fbbf24"
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name="Net Margin ($)"
                        stroke="#34d399"
                        fillOpacity={1}
                        fill="url(#colorProf)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Inventory Share (4 cols) */}
              <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold font-serif text-base text-stone-100">
                    Category Capital Weight
                  </h3>
                  <p className="text-xs text-stone-400">Inventory valuation across ateliers</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categorySalesData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '12px',
                          fontSize: '11px',
                        }}
                        formatter={(value: any) => [`$${value}`, 'Valuation']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1 text-xs">
                  {categorySalesData.map((cat, idx) => (
                    <div key={cat.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-stone-300">{cat.name}</span>
                      </div>
                      <span className="font-mono text-stone-400">${cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing SKU Bar Chart */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-serif text-base text-stone-100">
                    Top Grossing Masterpiece SKUs
                  </h3>
                  <p className="text-xs text-stone-400">
                    Product revenue ranking and gross margin percentage
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="name" stroke="#78716c" fontSize={11} />
                    <YAxis stroke="#78716c" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        borderColor: '#44403c',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="revenue" name="Estimated Revenue ($)" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: ORDER FULFILLMENT MANAGER                                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-serif text-base text-stone-100">
                  Customer Orders Ledger & Dispatch Queue
                </h3>
                <p className="text-xs text-stone-400">
                  {orders.length} total dispatches recorded in ledger
                </p>
              </div>

              <button
                id="export-orders-csv-btn"
                onClick={handleExportOrdersCSV}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Orders CSV</span>
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 border-b border-stone-800 text-[11px] uppercase tracking-wider text-stone-400 font-mono">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Items / Qty</th>
                      <th className="py-3.5 px-4 text-right">Total</th>
                      <th className="py-3.5 px-4 text-center">Fulfillment Status</th>
                      <th className="py-3.5 px-4">Tracking Code</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80 font-normal">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-850/60 transition-colors">
                        {/* Order Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-100">
                          {order.orderNumber}
                          <div className="text-[10px] text-stone-500 font-normal">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-100">{order.customerName}</div>
                          <div className="text-[11px] text-stone-400">{order.customerEmail}</div>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-stone-300 truncate max-w-[200px]">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            Method: {order.shippingMethod}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                          {formatPrice(order.total)}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : order.status === 'Shipped'
                                ? 'bg-sky-950 text-sky-300 border-sky-800'
                                : order.status === 'Processing'
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : order.status === 'Cancelled'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-stone-800 text-stone-300 border-stone-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Tracking */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400">
                          {order.trackingNumber}
                        </td>

                        {/* Detail Modal Trigger & Print */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`admin-order-receipt-btn-${order.id}`}
                              onClick={() => {
                                setReceiptModalOrder(order);
                                setIsReceiptModalOpen(true);
                              }}
                              className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 p-1.5 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                              title="Print Invoice / Packing Slip"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Receipt</span>
                            </button>

                            <button
                              onClick={() => setInspectedOrder(order)}
                              className="bg-stone-800 hover:bg-stone-700 text-stone-200 p-1.5 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ADD / EDIT PRODUCT                                          */}
      {/* ------------------------------------------------------------------ */}
      {isProductModalOpen && (
        <div
          id="product-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProductModalOpen(false);
          }}
        >
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <h3 className="text-base font-bold font-serif text-stone-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>{editingProductId ? 'Edit Product Item' : 'Add New Atelier Piece'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-stone-100 p-1.5 rounded-full hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="overflow-y-auto p-6 space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Masterwork Chronograph"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 uppercase font-mono focus:outline-none focus:border-amber-400"
                    placeholder="AUR-001"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Subtitle / Line Tag</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="Precision engineered with titanium..."
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Retail Selling Price ($)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Cost of Goods / COGS ($)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-medium mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="Architectural background, acoustic precision, and materials..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-medium mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="Best Seller, Eco-friendly, Limited Edition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="save-product-form-submit-btn"
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-6 py-2 rounded-xl text-xs shadow"
                >
                  {editingProductId ? 'Update Piece' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: INSPECT CUSTOMER ORDER                                      */}
      {/* ------------------------------------------------------------------ */}
      {inspectedOrder && (
        <div
          id="order-detail-inspect-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectedOrder(null);
          }}
        >
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 text-stone-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base font-serif text-stone-100">
                  Order Inspection: {inspectedOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-stone-400">
                  Placed on {new Date(inspectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setInspectedOrder(null)}
                className="text-stone-400 hover:text-stone-100 p-1.5 rounded-full hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs space-y-1">
              <div className="font-semibold text-stone-200">{inspectedOrder.customerName}</div>
              <div className="text-stone-400">{inspectedOrder.customerEmail}</div>
              <div className="text-stone-400">
                {inspectedOrder.shippingDetails.address}, {inspectedOrder.shippingDetails.city},{' '}
                {inspectedOrder.shippingDetails.state} {inspectedOrder.shippingDetails.zipCode}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inspectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-stone-100">{item.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-800 pt-3 flex justify-between items-center text-xs">
              <span className="text-stone-400">Total Settled Amount</span>
              <span className="font-mono font-bold text-amber-400 text-base">
                {formatPrice(inspectedOrder.total)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                id="admin-inspect-print-btn"
                onClick={() => {
                  setReceiptModalOrder(inspectedOrder);
                  setIsReceiptModalOpen(true);
                }}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Invoice / Slip</span>
              </button>

              <button
                onClick={() => setInspectedOrder(null)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Receipt / Invoice Generator Modal */}
      <ReceiptModal
        order={receiptModalOrder}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
