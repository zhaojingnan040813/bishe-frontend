import apiClient from './axios'
import type { Drug, ApiResponse, PaginatedResponse } from '@/types'

export const drugApi = {
  /**
   * 获取药物列表
   */
  async getDrugs(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Drug>> {
    const response = await apiClient.get('/drugs', {
      params: { page, limit }
    })
    return response.data
  },

  /**
   * 搜索药物
   */
  async searchDrugs(name: string): Promise<ApiResponse<Drug[]>> {
    const response = await apiClient.get('/drugs/search', {
      params: { name }
    })
    return response.data
  },

  /**
   * 获取药物详情
   */
  async getDrugById(id: string): Promise<ApiResponse<Drug>> {
    const response = await apiClient.get(`/drugs/${id}`)
    return response.data
  },

  /**
   * AI分析药物
   */
  async analyzeDrug(name: string): Promise<ApiResponse<Drug>> {
    const response = await apiClient.post('/drugs/analyze', { name })
    return response.data
  }
}
