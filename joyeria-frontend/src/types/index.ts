export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  sku: string
  stock: number
  weight?: string
  dimensions?: string
  size?: string
  color?: string
  careInstructions?: string
  features?: string
  deliveryTime?: string
  featured: boolean
  isNew: boolean
  bestSeller: boolean
  active: boolean
  soldCount: number
  categoryId?: number
  categoryName?: string
  materialIds?: number[]
  materialNames?: string[]
  images: ProductImage[]
  discountPercent: number
  averageRating?: number
  reviewCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface ProductImage {
  id: number
  url: string
  alt?: string
  isPrimary: boolean
  sortOrder: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  displayOrder?: number
  image?: string
  active: boolean
  productCount?: number
}

export interface Material {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  active: boolean
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'USER' | 'ADMIN'
  active: boolean
  createdAt?: string
}

export interface Cart {
  id: number
  items: CartItem[]
  itemCount: number
  subtotal: number
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  productSlug: string
  productImage?: string
  productPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  paymentStatus: string
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  shippingAddress: string
  shippingCity: string
  shippingDepartment?: string
  recipientName?: string
  phone?: string
  paymentMethod?: string
  couponCode?: string
  trackingNumber?: string
  customerName?: string
  customerEmail?: string
  items: OrderItem[]
  createdAt: string
  updatedAt?: string
}

export interface OrderItem {
  id: number
  productId?: number
  name: string
  price: number
  quantity: number
  subtotal: number
  image?: string
  sku?: string
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Review {
  id: number
  productId: number
  productName?: string
  userId: number
  userName: string
  rating: number
  title?: string
  comment?: string
  status: string
  createdAt: string
}

export interface Address {
  id: number
  firstName?: string
  lastName?: string
  phone?: string
  addressLine1: string
  addressLine2?: string
  city: string
  department?: string
  postalCode?: string
  addressType: 'SHIPPING' | 'BILLING'
  isDefault: boolean
}

export interface SupportTicket {
  id: number
  ticketNumber: string
  subject: string
  message: string
  category: string
  status: string
  customerName?: string
  customerEmail?: string
  createdAt: string
  updatedAt?: string
}

export interface SocialLink {
  id: number
  name: string
  url: string
  icon?: string
  active: boolean
  sortOrder: number
}

export interface Coupon {
  id: number
  code: string
  description?: string
  discountType: string
  discountValue: number
  minAmount?: number
  maxUses?: number
  usesCount: number
  validFrom?: string
  validUntil?: string
  active: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AuthResponse {
  token: string
  type?: string
  id: number
  email: string
  fullName: string
  role: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  pendingOrders: number
  totalCustomers?: number
  lowStockProducts?: number
  outOfStockProducts?: number
  topSellingProducts?: Array<{ id: number; name: string; soldCount: number }>
  recentOrders?: Array<{ id: number; orderNumber: string; total: number; status: string }>
  ordersByStatus?: Record<string, number>
}