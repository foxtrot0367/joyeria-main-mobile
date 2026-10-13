import api from './api'
import type { AiAssistantResponse, ApiResponse } from '../types'

/**
 * Asistente de compras con IA. Envía la consulta en lenguaje natural y devuelve
 * un mensaje más productos reales del catálogo (nunca datos inventados).
 */
export const aiService = {
  async ask(message: string): Promise<AiAssistantResponse> {
    const { data } = await api.post<ApiResponse<AiAssistantResponse>>('/ai/assistant', { message })
    return data.data
  },
}

export const aiAssistantEnabled = import.meta.env.VITE_AI_ASSISTANT_ENABLED !== 'false'
