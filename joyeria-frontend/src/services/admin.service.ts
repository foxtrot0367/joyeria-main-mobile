import api from './api'
import type {
  ApiResponse, User, Product, Category, Material, Review, Order,
  PagedResponse, DashboardStats, Coupon, SocialLink, SupportTicket,
} from '../types'

export interface ProductCreateRequest {
  name: string
  slug?: string
  description?: string
  price: number
  comparePrice?: number | null
  sku: string
  stock: number
  categoryId?: number | null
  materialIds?: number[]
  images?: Array<{ url: string; alt?: string; isPrimary: boolean; sortOrder: number }>
}

export interface CategoryCreateRequest {
  name: string
  slug?: string
  description?: string
  displayOrder?: number
  image?: string
}

export interface MaterialCreateRequest {
  name: string
  slug?: string
  description?: string
  image?: string
}

export interface CouponCreateRequest {
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minAmount?: number | null
  maxUses?: number | null
  validFrom?: string | null
  validUntil?: string | null
}

export interface SocialLinkCreateRequest {
  name: string
  url: string
  icon?: string
}

export const adminService = {
  // Dashboard
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/orders/stats')
    return data.data
  },

  // Products
  async getProducts(page = 0, size = 50): Promise<PagedResponse<Product>> {
    const { data } = await api.get<ApiResponse<PagedResponse<Product>>>('/products', { params: { page, size } })
    return data.data
  },
  async createProduct(product: ProductCreateRequest): Promise<Product> {
    const { data } = await api.post<ApiResponse<Product>>('/admin/products', product)
    return data.data
  },
  async updateProduct(id: number, product: ProductCreateRequest): Promise<Product> {
    const { data } = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, product)
    return data.data
  },
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`)
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories')
    return data.data
  },
  async createCategory(category: CategoryCreateRequest): Promise<Category> {
    const { data } = await api.post<ApiResponse<Category>>('/categories', category)
    return data.data
  },
  async updateCategory(id: number, category: CategoryCreateRequest): Promise<Category> {
    const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, category)
    return data.data
  },
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`)
  },

  // Materials
  async getMaterials(): Promise<Material[]> {
    const { data } = await api.get<ApiResponse<Material[]>>('/materials')
    return data.data
  },
  async createMaterial(material: MaterialCreateRequest): Promise<Material> {
    const { data } = await api.post<ApiResponse<Material>>('/materials', material)
    return data.data
  },
  async updateMaterial(id: number, material: MaterialCreateRequest): Promise<Material> {
    const { data } = await api.put<ApiResponse<Material>>(`/materials/${id}`, material)
    return data.data
  },
  async deleteMaterial(id: number): Promise<void> {
    await api.delete(`/materials/${id}`)
  },

  // Orders
  async getOrders(page = 0, size = 20, status?: string): Promise<PagedResponse<Order>> {
    const url = status ? `/admin/orders/status/${status}` : '/admin/orders'
    const { data } = await api.get<ApiResponse<PagedResponse<Order>>>(url, { params: { page, size } })
    return data.data
  },
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const { data } = await api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, null, { params: { status } })
    return data.data
  },

  // Users
  async getUsers(page = 0, size = 20): Promise<PagedResponse<User>> {
    const { data } = await api.get<ApiResponse<PagedResponse<User>>>('/admin/users', { params: { page, size } })
    return data.data
  },
  async updateUserRole(id: number, role: string): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, null, { params: { role } })
    return data.data
  },
  async toggleUserActive(id: number): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}/toggle`)
    return data.data
  },

  // Reviews
  async moderateReview(id: number, status: string): Promise<Review> {
    const { data } = await api.put<ApiResponse<Review>>(`/admin/reviews/${id}/status`, null, { params: { status } })
    return data.data
  },

  // Support tickets
  async getTickets(page = 0, size = 20): Promise<PagedResponse<SupportTicket>> {
    const { data } = await api.get<ApiResponse<PagedResponse<SupportTicket>>>('/admin/support/tickets', { params: { page, size } })
    return data.data
  },
  async updateTicketStatus(id: number, status: string): Promise<SupportTicket> {
    const { data } = await api.put<ApiResponse<SupportTicket>>(`/admin/support/tickets/${id}/status`, null, { params: { status } })
    return data.data
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const { data } = await api.get<ApiResponse<Coupon[]>>('/coupons')
    return data.data
  },
  async createCoupon(coupon: CouponCreateRequest): Promise<Coupon> {
    const { data } = await api.post<ApiResponse<Coupon>>('/coupons', coupon)
    return data.data
  },
  async updateCoupon(id: number, coupon: CouponCreateRequest): Promise<Coupon> {
    const { data } = await api.put<ApiResponse<Coupon>>(`/coupons/${id}`, coupon)
    return data.data
  },
  async deleteCoupon(id: number): Promise<void> {
    await api.delete(`/coupons/${id}`)
  },

  // Social links
  async getSocialLinks(): Promise<SocialLink[]> {
    const { data } = await api.get<ApiResponse<SocialLink[]>>('/social-links/admin')
    return data.data
  },
  async createSocialLink(link: SocialLinkCreateRequest): Promise<SocialLink> {
    const { data } = await api.post<ApiResponse<SocialLink>>('/social-links', link)
    return data.data
  },
  async updateSocialLink(id: number, link: SocialLinkCreateRequest): Promise<SocialLink> {
    const { data } = await api.put<ApiResponse<SocialLink>>(`/social-links/${id}`, link)
    return data.data
  },
  async deleteSocialLink(id: number): Promise<void> {
    await api.delete(`/social-links/${id}`)
  },
}
