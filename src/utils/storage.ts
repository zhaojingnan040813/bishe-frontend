import type { Message, ChatHistory } from '@/stores/chat'

const STORAGE_KEY = 'ai-chat-history'
const MAX_MESSAGES = 100 // 限制历史消息数量，防止存储空间不足

/**
 * 验证消息格式是否正确
 */
function isValidMessage(msg: unknown): msg is Message {
    if (!msg || typeof msg !== 'object') return false
    const m = msg as Record<string, unknown>
    return (
        typeof m.id === 'string' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        typeof m.timestamp === 'number'
    )
}

/**
 * 验证对话历史格式是否正确
 */
function isValidChatHistory(data: unknown): data is ChatHistory {
    if (!data || typeof data !== 'object') return false
    const d = data as Record<string, unknown>
    return (
        Array.isArray(d.messages) &&
        d.messages.every(isValidMessage) &&
        typeof d.lastUpdated === 'number'
    )
}

/**
 * 保存对话历史到LocalStorage
 * @param messages 消息列表
 * @returns 是否保存成功
 */
export function saveHistory(messages: Message[]): boolean {
    try {
        // 过滤掉正在流式传输的消息，只保存完成的消息
        const completedMessages = messages.filter(m => !m.isStreaming)

        // 限制消息数量，保留最新的消息
        const limitedMessages = completedMessages.slice(-MAX_MESSAGES)

        const history: ChatHistory = {
            messages: limitedMessages,
            lastUpdated: Date.now()
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
        return true
    } catch (error) {
        // 处理存储配额错误
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.error('LocalStorage quota exceeded, attempting to clear old data')
            // 尝试清理旧数据后重试
            try {
                // 只保留最近的一半消息
                const reducedMessages = messages.slice(-Math.floor(MAX_MESSAGES / 2))
                const history: ChatHistory = {
                    messages: reducedMessages.filter(m => !m.isStreaming),
                    lastUpdated: Date.now()
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
                return true
            } catch {
                console.error('Failed to save chat history after cleanup')
                return false
            }
        }
        console.error('Failed to save chat history:', error)
        return false
    }
}

/**
 * 从LocalStorage加载对话历史
 * @returns 对话历史，如果不存在或格式错误则返回null
 */
export function loadHistory(): ChatHistory | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return null

        const parsed = JSON.parse(data)

        // 验证数据格式
        if (!isValidChatHistory(parsed)) {
            console.warn('Invalid chat history format, clearing storage')
            clearStorage()
            return null
        }

        return parsed
    } catch (error) {
        console.error('Failed to load chat history:', error)
        // 如果解析失败，清除损坏的数据
        clearStorage()
        return null
    }
}

/**
 * 清除LocalStorage中的对话历史
 */
export function clearStorage(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear chat history:', error)
    }
}

/**
 * 检查LocalStorage是否可用
 */
export function isStorageAvailable(): boolean {
    try {
        const testKey = '__storage_test__'
        localStorage.setItem(testKey, testKey)
        localStorage.removeItem(testKey)
        return true
    } catch {
        return false
    }
}
