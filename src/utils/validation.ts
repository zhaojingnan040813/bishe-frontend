/**
 * 验证药物名称
 */
export function validateDrugName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '药物名称不能为空' }
  }

  if (name.trim().length < 2) {
    return { valid: false, message: '药物名称至少需要2个字符' }
  }

  if (name.length > 100) {
    return { valid: false, message: '药物名称不能超过100个字符' }
  }

  return { valid: true }
}

/**
 * 验证药物ID列表
 */
export function validateDrugIds(drugIds: string[]): { valid: boolean; message?: string } {
  if (!drugIds || drugIds.length === 0) {
    return { valid: false, message: '请至少选择一种药物' }
  }

  if (drugIds.length < 2) {
    return { valid: false, message: '请至少选择两种药物进行检测' }
  }

  if (drugIds.length > 10) {
    return { valid: false, message: '最多只能同时检测10种药物' }
  }

  return { valid: true }
}

/**
 * 验证搜索关键词
 */
export function validateSearchQuery(query: string): { valid: boolean; message?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, message: '搜索关键词不能为空' }
  }

  if (query.trim().length < 1) {
    return { valid: false, message: '搜索关键词至少需要1个字符' }
  }

  return { valid: true }
}
