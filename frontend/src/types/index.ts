// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  categoryId: string;
  category?: Category;
  stock: number;
  sku: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  soldCount?: number;
  material?: string;
  color?: string;
  weight?: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  selected?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}
export interface OrdersPaginatedResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersPaginatedResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
// Order Types
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "MOMO";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  subtotal: number;
  product?: {
    image?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "PAID" | "UNPAID";
  shippingAddress: string;
  voucherCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface MomoPaymentInfo {
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  resultCode: number;
  message: string;
}

// Voucher Types
export interface Voucher {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export interface ReorderResponse {
  message: string;
  addedCount: number;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter & Search Types
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  onSale?: boolean;
  includeInactive?: boolean; // dùng cho admin để lấy cả đang bán + ngừng bán
  isActive?: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  topProducts: Array<{
    product: Product;
    soldCount: number;
    revenue: number;
  }>;
}
// Contact Types
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  reply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}
