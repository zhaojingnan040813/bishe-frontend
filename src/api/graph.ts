import apiClient from './axios'
import type { GraphData, GraphStats, DrugInteractionStats, ApiResponse } from '@/types'

export const graphApi = {
  /**
   * 获取药物关系图数据
   */
  async getGraphData(drugId?: string): Promise<ApiResponse<GraphData>> {
    const response = await apiClient.get('/drugs/graph', {
      params: drugId ? { drugId } : {}
    })
    return response.data
  },

  /**
   * 获取图谱统计信息
   */
  async getGraphStats(): Promise<ApiResponse<GraphStats>> {
    const response = await apiClient.get('/drugs/graph/stats')
    return response.data
  },

  /**
   * 获取药物的相互作用统计
   */
  async getDrugInteractionStats(drugId: string): Promise<ApiResponse<DrugInteractionStats>> {
    const response = await apiClient.get(`/drugs/${drugId}/interactions/stats`)
    return response.data
  }
}
