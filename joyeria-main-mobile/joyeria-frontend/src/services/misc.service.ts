import api from './api'
import type { ApiResponse, SocialLink, Coupon } from '../types'

export interface PaymentRequest {
  orderId: number
  paymentMethod: string
  cardNumber?: string
  cardName?: string
  expiry?: string
  cvv?: string
}

export interface PaymentResponse {
  id: number
  orderId: number
  amount: number
  method: string
  status: string
  transactionId?: string
}

export const socialService = {
  async getAll(): Promise<SocialLink[]> {
    const { data } = await api.get<ApiResponse<SocialLink[]>>('/social-links')
    return data.data
  },
}

export const newsletterService = {
  async subscribe(email: string): Promise<string> {
    const { data } = await api.post<ApiResponse<string>>('/newsletter/subscribe', { email })
    return data.message || data.data
  },
}

export const couponService = {
  async validate(code: string): Promise<Coupon> {
    const { data } = await api.post<ApiResponse<Coupon>>(`/coupons/validate`, null, { params: { code } })
    return data.data
  },
}

export const paymentService = {
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const { data } = await api.post<ApiResponse<PaymentResponse>>('/payments/process', paymentData)
    return data.data
  },
}
