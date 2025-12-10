import apiClient from './axios'
import type { GraphData, ApiResponse } from '@/types'

export const graphApi = {
  /**
   * 获取药物关系图数据
   */
  async getGraphData(drugId?: string): Promise<ApiResponse<GraphData>> {
    const response = await apiClient.get('/drugs/graph', {
      params: drugId ? { drugId } : {}
    })
    return response.data
  }
}
