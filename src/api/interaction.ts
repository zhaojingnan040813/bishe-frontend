import apiClient from './axios'
import type { InteractionResult, ApiResponse } from '@/types'

export const interactionApi = {
  /**
   * 检测药物相互作用
   */
  async checkInteractions(drugIds: string[]): Promise<ApiResponse<InteractionResult>> {
    const response = await apiClient.post('/interactions/check', { drugIds })
    return response.data
  }
}
