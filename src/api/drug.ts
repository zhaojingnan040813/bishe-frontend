import apiClient from './axios'
import type { Drug, ApiResponse, PaginatedResponse } from '@/types'

export interface SaveDrugData {
  name: string
  genericName?: string
  description: string
  category: string
  sideEffects?: string[]
  contraindications?: string[]
  dosage?: string
  aiAnalysis?: string
  source?: 'manual' | 'ai'
}

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
   * AI分析药物（不会自动保存到数据库）
   * 由于AI分析可能需要较长时间，设置5分钟超时
   */
  async analyzeDrug(name: string): Promise<ApiResponse<Drug>> {
    const response = await apiClient.post('/drugs/analyze', { name }, {
      timeout: 300000 // 5分钟超时
    })
    return response.data
  },

  /**
   * 保存药物到数据库
   * 用于保存AI分析结果或手动添加药物
   */
  async saveDrug(drugData: SaveDrugData): Promise<ApiResponse<Drug>> {
    const response = await apiClient.post('/drugs', drugData)
    return response.data
  }
}
