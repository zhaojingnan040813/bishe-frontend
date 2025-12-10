export interface Drug {
  _id: string
  name: string
  genericName?: string
  description: string
  category: string
  sideEffects?: string[]
  contraindications?: string[]
  dosage?: string
  aiAnalysis?: string
  source: 'manual' | 'ai'
  createdAt: string
  updatedAt: string
}

export interface Interaction {
  _id: string
  drug1Id: string
  drug2Id: string
  drug1Name: string
  drug2Name: string
  interactionType: string
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
  source: 'database' | 'ai'
  createdAt: string
  updatedAt: string
}

export interface InteractionResult {
  interactions: Interaction[]
  riskLevel: 'low' | 'medium' | 'high'
  source: 'database' | 'ai' | 'mixed'
}

export interface GraphNode {
  id: string
  name: string
  category: string
  value: number
}

export interface GraphEdge {
  source: string
  target: string
  value: number
  severity: 'low' | 'medium' | 'high'
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  timestamp: number
}
