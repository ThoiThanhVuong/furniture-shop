import api from "@/lib/axios";
import {
  ApiResponse,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  Product,
  ProductFilters,
  Category,
  Order,
  Voucher,
  ShippingAddress,
  DashboardStats,
  OrdersPaginatedResponse,
  UsersPaginatedResponse,
  PaymentMethod,
  ReorderResponse,
  Contact,
  MomoPaymentInfo,
} from "@/types";

// Auth API
export const authAPI = {
  login: (data: LoginCredentials) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  register: (data: RegisterData) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get<ApiResponse<User>>("/auth/profile"),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>("/auth/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),

  forgotPassword: (email: string) => api.post("/auth/request-reset", { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),
};

// Products API
export const productsAPI = {
  getAll: (filters?: ProductFilters) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
      params: filters,
    }),

  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Product>>(`/products/slug/${slug}`),

  getFeatured: (limit = 8) =>
    api.get<ApiResponse<Product[]>>("/products/featured", {
      params: { limit },
    }),
  getSale: (limit = 8) =>
    api.get<ApiResponse<Product[]>>("/products/sale", {
      params: { limit },
    }),
  getRelated: (productId: string, limit = 4) =>
    api.get<ApiResponse<Product[]>>(`/products/${productId}/related`, {
      params: { limit },
    }),

  create: (data: FormData) =>
    api.post<ApiResponse<Product>>("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/products/${id}`),

  applySaleToCategory: (data: {
    categoryId: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
  }) => api.post("/products/admin/apply-sale-category", data),

  clearSaleByCategory: (categoryId: string) =>
    api.post("/products/admin/clear-sale-category", { categoryId }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),

  getById: (id: string) => api.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: FormData) =>
    api.post<ApiResponse<Category>>("/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<ApiResponse<OrdersPaginatedResponse>>("/admin/orders", { params }),

  getById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),

  getAdminById: (id: string) =>
    api.get<ApiResponse<Order>>(`/admin/orders/${id}`),

  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<OrdersPaginatedResponse>>("/orders/my-orders", {
      params,
    }),

  create: (data: {
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: PaymentMethod; // "COD"  | "MOMO"
    shippingAddress: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    voucherCode?: string;
    notes?: string;
    selectedProductIds?: string[];
  }) =>
    api.post<
      ApiResponse<{
        order: Order;
        momo: MomoPaymentInfo | null;
      }>
    >("/orders", data),

  payWithMomo: (orderId: string) =>
    api.post<
      ApiResponse<{
        order: Order;
        momo: MomoPaymentInfo | null;
      }>
    >(`/orders/${orderId}/momo-pay`),

  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<Order>>(`admin/orders/${id}/status`, { status }),

  cancel: (id: string) => api.put<ApiResponse<Order>>(`/orders/${id}/cancel`),

  confirmPayment: (id: string) => api.post(`/orders/${id}/confirm-payment`),

  reorder(orderId: string) {
    return api.post<ApiResponse<ReorderResponse>>(`/orders/${orderId}/reorder`);
  },
};
// Shop Info API
export const shopAPI = {
  getInfo: () =>
    api.get<
      ApiResponse<{
        name: string;
        email: string;
        phone?: string;
        address: string;
      }>
    >("/shop/info"),
};
// Cart API
export const cartAPI = {
  getCart: () => api.get<ApiResponse<any>>("/cart"),

  addItem: (data: { productId: string; quantity: number }) =>
    api.post<ApiResponse<any>>("/cart/items", data),

  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiResponse<any>>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),

  clear: () => api.delete("/cart/clear"),
};

// Vouchers API
export type VoucherInput = Omit<
  Voucher,
  "id" | "usedCount" | "createdAt" | "updatedAt"
>;
export const vouchersAPI = {
  getAll: () => api.get<ApiResponse<Voucher[]>>("/vouchers"),

  getById: (id: string) => api.get<ApiResponse<Voucher>>(`/vouchers/${id}`),

  validate: (code: string, orderTotal: number) =>
    api.post<ApiResponse<{ discount: number; voucher: Voucher }>>(
      "/vouchers/validate",
      {
        code,
        orderTotal,
      }
    ),
  getAvailable: () => api.get<ApiResponse<Voucher[]>>("/vouchers/available"),

  create: (data: VoucherInput) =>
    api.post<ApiResponse<Voucher>>("/vouchers", data),

  update: (id: string, data: Partial<VoucherInput>) =>
    api.put<ApiResponse<Voucher>>(`/vouchers/${id}`, data),

  delete: (id: string) => api.delete(`/vouchers/${id}`),
};

// Contacts API
export const contactsAPI = {
  // User gửi contact (public)
  create: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => api.post<ApiResponse<Contact>>("/contacts", data),

  getAll: (params?: { isRead?: boolean; isReplied?: boolean }) =>
    api.get<ApiResponse<Contact[]>>("/contacts", { params }),

  // Admin: xem chi tiết 1 contact
  getById: (id: string) => api.get<ApiResponse<Contact>>(`/contacts/${id}`),

  // Admin: reply contact
  reply: (id: string, reply: string) =>
    api.post<ApiResponse<Contact>>(`/contacts/${id}/reply`, { reply }),

  // Admin: xóa contact
  delete: (id: string) => api.delete<ApiResponse<null>>(`/contacts/${id}`),
};

// Users API (Admin)
export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get<ApiResponse<UsersPaginatedResponse>>("/admin/users", { params }),

  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
};

// Dashboard API (Admin)
export const dashboardAPI = {
  getStats: () => api.get<ApiResponse<DashboardStats>>("/admin/dashboard"),
};
