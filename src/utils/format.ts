/**
 * 格式化日期
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 获取风险等级的中文描述
 */
export function getRiskLevelText(level: 'low' | 'medium' | 'high'): string {
  const map = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return map[level] || '未知'
}

/**
 * 获取风险等级的颜色
 */
export function getRiskLevelColor(level: 'low' | 'medium' | 'high'): string {
  const map = {
    low: '#52c41a',
    medium: '#faad14',
    high: '#f5222d'
  }
  return map[level] || '#d9d9d9'
}

/**
 * 获取数据来源的中文描述
 */
export function getSourceText(source: 'manual' | 'ai' | 'database' | 'cache' | 'mixed'): string {
  const map = {
    manual: '手动录入',
    ai: 'AI分析',
    database: '数据库',
    cache: '缓存',
    mixed: '混合来源'
  }
  return map[source] || '未知'
}
