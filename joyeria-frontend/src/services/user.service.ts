import api from './api'
import type { ApiResponse, User, Address, Review, SupportTicket, PagedResponse } from '../types'

export const userService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/users/me')
    return data.data
  },

  async updateProfile(userData: any): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>('/users/me', userData)
    return data.data
  },

  async changePassword(passwords: any): Promise<void> {
    await api.put('/users/me/password', passwords)
  },

  async getAddresses(): Promise<Address[]> {
    const { data } = await api.get<ApiResponse<Address[]>>('/addresses')
    return data.data
  },

  async createAddress(address: any): Promise<Address> {
    const { data } = await api.post<ApiResponse<Address>>('/addresses', address)
    return data.data
  },

  async updateAddress(id: number, address: any): Promise<Address> {
    const { data } = await api.put<ApiResponse<Address>>(`/addresses/${id}`, address)
    return data.data
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`)
  },

  async toggleFavorite(productId: number): Promise<boolean> {
    const { data } = await api.post<ApiResponse<boolean>>(`/favorites/toggle/${productId}`)
    return data.data
  },

  async isFavorite(productId: number): Promise<boolean> {
    const { data } = await api.get<ApiResponse<boolean>>(`/favorites/check/${productId}`)
    return data.data
  },

  async getFavorites(page = 0, size = 20): Promise<PagedResponse<any>> {
    const { data } = await api.get<ApiResponse<PagedResponse<any>>>('/favorites', { params: { page, size } })
    return data.data
  },

  async submitReview(review: any): Promise<Review> {
    const { data } = await api.post<ApiResponse<Review>>('/reviews', review)
    return data.data
  },

  async getProductReviews(productId: number, page = 0, size = 10): Promise<PagedResponse<Review>> {
    const { data } = await api.get<ApiResponse<PagedResponse<Review>>>(`/reviews/product/${productId}`, { params: { page, size } })
    return data.data
  },

  async getRecentReviews(): Promise<Review[]> {
    const { data } = await api.get<ApiResponse<Review[]>>('/reviews/recent')
    return data.data
  },

  async createSupportTicket(ticket: any): Promise<SupportTicket> {
    const { data } = await api.post<ApiResponse<SupportTicket>>('/support/tickets', ticket)
    return data.data
  },
}