export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl: string;
  imagePublicId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  product: string | Product;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  items: SaleItem[];
  grandTotal: number;
  soldBy: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  sales: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface RecentSale {
  _id: string;
  grandTotal: number;
  createdAt: string;
  soldBy: { _id: string; name: string };
  items: Array<{ productName: string; quantity: number; subtotal: number }>;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: LowStockProduct[];
  lowStockCount: number;
  totalRevenue: number;
  recentSales: RecentSale[];
  dailyRevenue: DailyRevenue[];
  categoryRevenue: CategoryRevenue[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface CreateSaleInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
