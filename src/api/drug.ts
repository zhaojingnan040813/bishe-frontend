import apiClient from './axios'
import type { Drug, ApiResponse, PaginatedResponse, SearchResponse } from '@/types'

/**
 * 保存药物数据接口
 */
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

/**
 * AI分析结果接口（可能没有_id，因为还未保存到数据库）
 */
export interface AnalyzeDrugResult extends Omit<Drug, '_id'> {
  _id?: string
}

export const drugApi = {
  /**
   * 获取药物列表
   * GET /api/drugs
   */
  async getDrugs(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Drug>> {
    const response = await apiClient.get('/drugs', {
      params: { page, limit }
    })
    return response.data
  },

  /**
   * 搜索药物
   * GET /api/drugs/search
   */
  async searchDrugs(name: string): Promise<SearchResponse<Drug>> {
    const response = await apiClient.get('/drugs/search', {
      params: { name }
    })
    return response.data
  },

  /**
   * 获取药物详情
   * GET /api/drugs/{id}
   */
  async getDrugById(id: string): Promise<ApiResponse<Drug>> {
    const response = await apiClient.get(`/drugs/${id}`)
    return response.data
  },

  /**
   * AI分析药物（不会自动保存到数据库）
   * POST /api/drugs/analyze
   * 由于AI分析可能需要较长时间，设置5分钟超时
   */
  async analyzeDrug(name: string): Promise<ApiResponse<AnalyzeDrugResult>> {
    const response = await apiClient.post('/drugs/analyze', { name }, {
      timeout: 300000 // 5分钟超时
    })
    return response.data
  },

  /**
   * 保存药物到数据库
   * POST /api/drugs
   * 用于保存AI分析结果或手动添加药物
   */
  async saveDrug(drugData: SaveDrugData): Promise<ApiResponse<Drug>> {
    const response = await apiClient.post('/drugs', drugData)
    return response.data
  }
}
