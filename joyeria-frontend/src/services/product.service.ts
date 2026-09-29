import api from './api'
import type { ApiResponse, Product, PagedResponse } from '../types'

export interface ProductSearchParams {
  page?: number
  size?: number
  category?: string
  material?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: string
}

export const productService = {
  async getAll(params: ProductSearchParams = {}): Promise<PagedResponse<Product>> {
    const { data } = await api.get<ApiResponse<PagedResponse<Product>>>('/products', { params })
    return data.data
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return data.data
  },

  async getBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`)
    return data.data
  },

  async getFeatured(): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>('/products/featured')
    return data.data
  },

  async getNew(): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>('/products/new')
    return data.data
  },

  async getBestSellers(): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>('/products/best-sellers')
    return data.data
  },

  async getRelated(id: number): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/products/${id}/related`)
    return data.data
  },

  async search(query: string, params: ProductSearchParams = {}): Promise<PagedResponse<Product>> {
    const { data } = await api.get<ApiResponse<PagedResponse<Product>>>('/search', { params: { q: query, ...params } })
    return data.data
  },
}
