import apiClient from './axios'
import type { Interaction, InteractionResult, ApiResponse } from '@/types'

export const interactionApi = {
  /**
   * 检测药物相互作用
   * 由于可能调用AI接口，设置5分钟超时
   */
  async checkInteractions(drugIds: string[]): Promise<ApiResponse<InteractionResult>> {
    const response = await apiClient.post('/interactions/check', { drugIds }, {
      timeout: 300000 // 5分钟超时
    })
    return response.data
  },

  /**
   * 获取相互作用详情
   */
  async getInteractionById(id: string): Promise<ApiResponse<Interaction>> {
    const response = await apiClient.get(`/interactions/${id}`)
    return response.data
  }
}
