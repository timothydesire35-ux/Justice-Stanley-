export type ProductCategory = 
  | 'All'
  | 'Audio & Tech'
  | 'Apparel & Wear'
  | 'Home & Living'
  | 'Accessories'
  | 'Wellness & Care';

export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  costPrice: number; // For admin profit margins
  stock: number;
  lowStockThreshold: number;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercent?: number;
  specs: Record<string, string>;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderShippingDetails {
  fullName: string;
  email: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderItemSummary {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemSummary[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  shippingDetails: OrderShippingDetails;
  shippingMethod: 'Standard' | 'Expedited' | 'Priority Express';
  paymentMethod: 'Credit Card' | 'Apple Pay' | 'Google Pay' | 'PayPal';
  paymentLast4?: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryDate: string;
  trackingNumber: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  savedAddresses?: OrderShippingDetails[];
  ordersCount?: number;
  wishlist?: string[];
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSpend?: number;
  description: string;
}

export interface SalesMetricDay {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface AISearchResultItem {
  productId: string;
  score: number;
  reason: string;
  highlightedFeatures?: string[];
}

export interface AISearchResponse {
  matchedProductIds: string[];
  results: AISearchResultItem[];
  suggestedQueries: string[];
  detectedCategory?: string | null;
  detectedIntent?: string;
  source?: string;
}
