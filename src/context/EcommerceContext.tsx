import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  Coupon,
  OrderStatus,
  OrderShippingDetails,
  AISearchResponse,
  AISearchResultItem,
} from '../types/ecommerce';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_COUPONS, DEMO_USERS } from '../data/initialProducts';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

interface CurrencyRate {
  symbol: string;
  rate: number;
  prefix: boolean;
}

const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
  USD: { symbol: '$', rate: 1.0, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: true },
  GBP: { symbol: '£', rate: 0.79, prefix: true },
};

interface EcommerceContextType {
  // Navigation
  activeTab: 'home' | 'shop' | 'admin' | 'orders';
  setActiveTab: (tab: 'home' | 'shop' | 'admin' | 'orders') => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // AI Predictive Natural Language Search
  aiSearchResponse: AISearchResponse | null;
  isAiSearching: boolean;
  runAiSearch: (query: string, autoNavigate?: boolean) => Promise<AISearchResponse | null>;
  clearAiSearch: () => void;
  isAiSearchActive: boolean;

  // Products & Inventory
  products: Product[];
  addProduct: (newProd: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, quantityToAdd: number) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (prod: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotalCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  moveWishlistToCart: (productId: string) => void;
  addAllWishlistToCart: () => void;
  isInWishlist: (productId: string) => boolean;

  // Auth / User
  currentUser: User | null;
  login: (email: string, role?: 'admin' | 'customer', name?: string) => void;
  logout: () => void;
  switchDemoRole: (role: 'admin' | 'customer') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  activeProfileTab: 'profile' | 'wishlist' | 'orders';
  setActiveProfileTab: (tab: 'profile' | 'wishlist' | 'orders') => void;
  openProfileModal: (initialTab?: 'profile' | 'wishlist' | 'orders') => void;

  // Checkout & Orders
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orders: Order[];
  createOrder: (
    shippingDetails: OrderShippingDetails,
    shippingMethod: 'Standard' | 'Expedited' | 'Priority Express',
    paymentMethod: 'Credit Card' | 'Apple Pay' | 'Google Pay' | 'PayPal',
    last4?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  latestCreatedOrder: Order | null;
  setLatestCreatedOrder: (order: Order | null) => void;

  // Currency & Formatter
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;

  // Notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Reset
  resetToDemoData: () => void;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'aura_store_products_v1',
  CART: 'aura_store_cart_v1',
  ORDERS: 'aura_store_orders_v1',
  USER: 'aura_store_user_v1',
  WISHLIST: 'aura_store_wishlist_v1',
  COUPON: 'aura_store_coupon_v1',
  CURRENCY: 'aura_store_currency_v1',
};

export const EcommerceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'admin' | 'orders'>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Predictive Search State
  const [aiSearchResponse, setAiSearchResponse] = useState<AISearchResponse | null>(null);
  const [isAiSearching, setIsAiSearching] = useState<boolean>(false);

  const runAiSearch = async (query: string, autoNavigate: boolean = true): Promise<AISearchResponse | null> => {
    const trimmed = query.trim();
    if (!trimmed) {
      clearAiSearch();
      return null;
    }

    setIsAiSearching(true);
    setSearchQuery(trimmed);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          catalog: products,
        }),
      });

      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }

      const data: AISearchResponse = await res.json();
      setAiSearchResponse(data);

      if (autoNavigate) {
        setActiveTab('shop');
      }

      return data;
    } catch (err) {
      console.warn('AI search API error, applying local semantic fallback:', err);
      // Construct an in-memory fallback
      const q = trimmed.toLowerCase();
      const matched = products
        .filter((p) => {
          const full = `${p.name} ${p.subtitle || ''} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
          return full.includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
        })
        .map((p) => ({
          productId: p.id,
          score: 85,
          reason: `Matches "${trimmed}" in ${p.category}`,
          highlightedFeatures: p.tags.slice(0, 2),
        }));

      const fallback: AISearchResponse = {
        matchedProductIds: matched.map((m) => m.productId),
        results: matched,
        suggestedQueries: [
          'Lightweight summer styles',
          'Noise cancelling headphones',
          'Horology and leather accessories',
        ],
        detectedIntent: trimmed,
        detectedCategory: null,
      };

      setAiSearchResponse(fallback);
      if (autoNavigate) {
        setActiveTab('shop');
      }
      return fallback;
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setAiSearchResponse(null);
    setSearchQuery('');
  };

  const isAiSearchActive = Boolean(aiSearchResponse && aiSearchResponse.matchedProductIds.length > 0);

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'wishlist' | 'orders'>('profile');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [latestCreatedOrder, setLatestCreatedOrder] = useState<Order | null>(null);

  const openProfileModal = (initialTab: 'profile' | 'wishlist' | 'orders' = 'profile') => {
    if (!currentUser) {
      addToast('info', 'Sign In Required', 'Please sign in to access your profile and saved wishlist.');
      setIsAuthModalOpen(true);
      return;
    }
    setActiveProfileTab(initialTab);
    setIsProfileModalOpen(true);
  };

  // Currency
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return (saved as CurrencyCode) || 'USD';
  });

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  };

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved cart', e);
      }
    }
    return [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedColor: 'Matte Obsidian',
      }
    ];
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved wishlist', e);
      }
    }
    return ['prod-1', 'prod-7'];
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    return INITIAL_ORDERS;
  });

  // User Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEMO_USERS.customer; // Start as Alex Mercer (customer) with quick switcher
  });

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPON);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved coupon', e);
      }
    }
    return null;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Sync wishlist to user-specific and global storage
  useEffect(() => {
    if (currentUser) {
      const userWishlistKey = `${STORAGE_KEYS.WISHLIST}_${currentUser.id}`;
      localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist, currentUser?.id]);

  // Load user-specific wishlist when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userWishlistKey = `${STORAGE_KEYS.WISHLIST}_${currentUser.id}`;
      const savedUserWishlist = localStorage.getItem(userWishlistKey);
      if (savedUserWishlist) {
        try {
          setWishlist(JSON.parse(savedUserWishlist));
          return;
        } catch (e) {
          console.error('Failed to parse user wishlist', e);
        }
      } else if (currentUser.id === DEMO_USERS.customer.id) {
        setWishlist(['prod-1', 'prod-7']);
        return;
      } else if (currentUser.id === DEMO_USERS.admin.id) {
        setWishlist(['prod-2', 'prod-6']);
        return;
      } else {
        setWishlist([]);
        return;
      }
    } else {
      setWishlist([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(STORAGE_KEYS.COUPON, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(STORAGE_KEYS.COUPON);
    }
  }, [appliedCoupon]);

  // Pricing helper
  const formatPrice = (amountInUSD: number): string => {
    const conf = CURRENCIES[currency];
    const converted = amountInUSD * conf.rate;
    return `${conf.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    // Check product stock
    const currentStock = product.stock;
    if (currentStock <= 0) {
      addToast('error', 'Out of Stock', `${product.name} is currently out of stock.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > currentStock) {
          addToast('warning', 'Stock Limit Reached', `Only ${currentStock} units available in stock.`);
          return prev;
        }

        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
        };
        addToast('success', 'Cart Updated', `Updated quantity for ${product.name} (${newQty})`);
        return next;
      }

      if (quantity > currentStock) {
        addToast('warning', 'Stock Limit Reached', `Only ${currentStock} units available in stock.`);
        return prev;
      }

      addToast('success', 'Added to Cart', `${product.name} added to your shopping bag.`);
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: color || product.colors?.[0]?.name,
          selectedSize: size || product.sizes?.[0],
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stock) {
      addToast('warning', 'Stock Limit', `Maximum available stock is ${prod.stock}.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedColor === color &&
          item.selectedSize === size
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedColor === color &&
            item.selectedSize === size
          )
      )
    );
    addToast('info', 'Item Removed', 'Item was removed from your bag.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minSpend && cartSubtotal < appliedCoupon.minSpend) {
      return 0;
    }
    return (cartSubtotal * appliedCoupon.discountPercent) / 100;
  }, [appliedCoupon, cartSubtotal]);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === trimmed);

    if (!found) {
      addToast('error', 'Invalid Coupon', `Coupon code "${code}" is not recognized.`);
      return { success: false, message: 'Invalid coupon code.' };
    }

    if (found.minSpend && cartSubtotal < found.minSpend) {
      const msg = `Minimum spend of $${found.minSpend} required for this code.`;
      addToast('warning', 'Minimum Spend Required', msg);
      return { success: false, message: msg };
    }

    setAppliedCoupon(found);
    addToast('success', 'Coupon Applied', `Successfully applied ${found.code} (${found.discountPercent}% OFF)`);
    return { success: true, message: `Applied ${found.code}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('info', 'Coupon Removed', 'Discount removed from order.');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const name = prod?.name || 'Product';

    if (!currentUser) {
      addToast('warning', 'Sign In Required', `Please sign in or create an account to save "${name}" to your personal wishlist.`);
      setIsAuthModalOpen(true);
      return;
    }

    const isSaved = wishlist.includes(productId);
    if (isSaved) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      addToast('info', 'Removed from Wishlist', `${name} removed from your saved items.`);
    } else {
      setWishlist((prev) => [...prev, productId]);
      addToast('success', 'Saved to Wishlist', `${name} added to your wishlist.`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setWishlist((prev) => prev.filter((id) => id !== productId));
    addToast('info', 'Removed from Wishlist', `${prod?.name || 'Item'} removed from your saved items.`);
  };

  const clearWishlist = () => {
    setWishlist([]);
    addToast('info', 'Wishlist Cleared', 'All saved items were removed from your wishlist.');
  };

  const moveWishlistToCart = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (prod.stock <= 0) {
      addToast('error', 'Out of Stock', `${prod.name} is currently sold out and cannot be added.`);
      return;
    }
    addToCart(prod, 1);
    setWishlist((prev) => prev.filter((id) => id !== productId));
    addToast('success', 'Moved to Bag', `${prod.name} moved from wishlist into your bag.`);
  };

  const addAllWishlistToCart = () => {
    if (wishlist.length === 0) return;
    const inStockItems = products.filter((p) => wishlist.includes(p.id) && p.stock > 0);
    if (inStockItems.length === 0) {
      addToast('warning', 'No Available Items', 'None of your saved wishlist items are currently in stock.');
      return;
    }
    inStockItems.forEach((p) => {
      addToCart(p, 1);
    });
    addToast('success', 'Wishlist Added to Bag', `Added ${inStockItems.length} available items to your shopping bag.`);
    setIsCartOpen(true);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Auth
  const login = (email: string, role: 'admin' | 'customer' = 'customer', name?: string) => {
    const newUser: User = {
      id: `user-${Math.random().toString(36).substring(2, 8)}`,
      name: name || (role === 'admin' ? 'Admin Team' : email.split('@')[0]),
      email,
      role,
      avatar: role === 'admin' ? DEMO_USERS.admin.avatar : DEMO_USERS.customer.avatar,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    addToast('success', 'Welcome Back', `Logged in as ${newUser.name} (${role.toUpperCase()})`);
  };

  const logout = () => {
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
    addToast('info', 'Logged Out', 'You have been signed out successfully.');
  };

  const switchDemoRole = (role: 'admin' | 'customer') => {
    const targetUser = role === 'admin' ? DEMO_USERS.admin : DEMO_USERS.customer;
    setCurrentUser(targetUser);
    if (role === 'admin') {
      setActiveTab('admin');
      addToast('success', 'Admin Access Activated', 'Switched to Sarah Chen (Inventory Lead). Full administrative tools available.');
    } else {
      setActiveTab('shop');
      addToast('success', 'Customer View Activated', 'Switched to Alex Mercer. Shopping & checkout mode enabled.');
    }
  };

  // Inventory & Product Management
  const addProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [product, ...prev]);
    addToast('success', 'Product Created', `Added "${product.name}" with SKU ${product.sku} to catalog.`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    addToast('success', 'Product Updated', 'Product details saved successfully.');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Product Deleted', `Removed "${target?.name || 'Product'}" from catalog.`);
  };

  const restockProduct = (id: string, quantityToAdd: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + quantityToAdd);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    const item = products.find((p) => p.id === id);
    addToast('success', 'Stock Adjusted', `Added +${quantityToAdd} units to ${item?.name || 'Product'}.`);
  };

  // Orders and Checkout
  const createOrder = (
    shippingDetails: OrderShippingDetails,
    shippingMethod: 'Standard' | 'Expedited' | 'Priority Express',
    paymentMethod: 'Credit Card' | 'Apple Pay' | 'Google Pay' | 'PayPal',
    last4 = '4242'
  ): Order => {
    const shippingFee =
      shippingMethod === 'Priority Express' ? 25 : shippingMethod === 'Expedited' ? 15 : 0;
    const tax = Math.round((cartSubtotal - cartDiscount) * 0.08 * 100) / 100;
    const total = Math.max(0, cartSubtotal - cartDiscount + shippingFee + tax);

    const orderNum = `AUR-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNum = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}-US`;

    // Deduct stock for all items
    setProducts((prev) =>
      prev.map((p) => {
        const matchingCartItem = cart.find((ci) => ci.product.id === p.id);
        if (matchingCartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - matchingCartItem.quantity),
          };
        }
        return p;
      })
    );

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: currentUser?.id,
      customerName: shippingDetails.fullName,
      customerEmail: shippingDetails.email,
      items: cart.map((ci) => ({
        productId: ci.product.id,
        sku: ci.product.sku,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        image: ci.product.images[0],
        selectedColor: ci.selectedColor,
        selectedSize: ci.selectedSize,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      couponCode: appliedCoupon?.code,
      shippingFee,
      tax,
      total,
      shippingDetails,
      shippingMethod,
      paymentMethod,
      paymentLast4: last4,
      status: 'Processing',
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingNumber: trackingNum,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestCreatedOrder(newOrder);
    clearCart();
    setAppliedCoupon(null);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    addToast('success', 'Order Status Updated', `Order status changed to ${status}.`);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.COUPON);
    setProducts(INITIAL_PRODUCTS);
    setCart([
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedColor: 'Matte Obsidian',
      }
    ]);
    setOrders(INITIAL_ORDERS);
    setWishlist(['prod-1', 'prod-7']);
    setAppliedCoupon(null);
    setCurrentUser(DEMO_USERS.customer);
    setActiveTab('home');
    addToast('info', 'Demo Reset', 'Catalog, sample orders, and stock levels restored to defaults.');
  };

  return (
    <EcommerceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        searchQuery,
        setSearchQuery,
        aiSearchResponse,
        isAiSearching,
        runAiSearch,
        clearAiSearch,
        isAiSearchActive,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        selectedProductForModal,
        setSelectedProductForModal,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotalCount,
        cartSubtotal,
        cartDiscount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        moveWishlistToCart,
        addAllWishlistToCart,
        isInWishlist,
        currentUser,
        login,
        logout,
        switchDemoRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        activeProfileTab,
        setActiveProfileTab,
        openProfileModal,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orders,
        createOrder,
        updateOrderStatus,
        latestCreatedOrder,
        setLatestCreatedOrder,
        currency,
        setCurrency,
        formatPrice,
        toasts,
        addToast,
        removeToast,
        resetToDemoData,
      }}
    >
      {children}
    </EcommerceContext.Provider>
  );
};

export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within an EcommerceProvider');
  }
  return context;
};
