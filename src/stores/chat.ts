import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 消息接口
 * 对应设计文档中的 Message Model
 */
export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
    isStreaming?: boolean
    error?: string
}

/**
 * 对话历史接口
 * 对应设计文档中的 ChatHistory Model
 */
export interface ChatHistory {
    messages: Message[]
    lastUpdated: number
}

/**
 * 生成唯一ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export const useChatStore = defineStore('chat', () => {
    // State
    const messages = ref<Message[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const hasMessages = computed(() => messages.value.length > 0)
    const lastMessage = computed(() =>
        messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
    )

    /**
     * 添加消息到对话历史
     */
    function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
        const newMessage: Message = {
            ...message,
            id: generateId(),
            timestamp: Date.now()
        }
        messages.value.push(newMessage)
        return newMessage
    }

    /**
     * 更新指定消息
     */
    function updateMessage(id: string, updates: Partial<Message>): void {
        const index = messages.value.findIndex(m => m.id === id)
        if (index !== -1) {
            messages.value[index] = { ...messages.value[index], ...updates }
        }
    }

    /**
     * 发送消息（创建用户消息和AI占位消息）
     * 返回AI消息的ID，用于后续流式更新
     */
    function sendMessage(content: string): { userMessage: Message; assistantMessage: Message } {
        // 清除之前的错误
        error.value = null

        // 添加用户消息
        const userMessage = addMessage({
            role: 'user',
            content
        })

        // 添加AI占位消息（流式状态）
        const assistantMessage = addMessage({
            role: 'assistant',
            content: '',
            isStreaming: true
        })

        return { userMessage, assistantMessage }
    }

    /**
     * 清空对话历史
     */
    function clearHistory(): void {
        messages.value = []
        error.value = null
        isLoading.value = false
    }

    /**
     * 设置加载状态
     */
    function setLoading(value: boolean): void {
        isLoading.value = value
    }

    /**
     * 设置错误信息
     */
    function setError(message: string | null): void {
        error.value = message
    }

    /**
     * 清除错误
     */
    function clearError(): void {
        error.value = null
    }

    /**
     * 设置消息列表（用于从LocalStorage加载）
     */
    function setMessages(newMessages: Message[]): void {
        messages.value = newMessages
    }

    /**
     * 获取对话历史（用于API请求）
     */
    function getHistoryForAPI(): Array<{ role: 'user' | 'assistant'; content: string }> {
        return messages.value
            .filter(m => !m.isStreaming && m.content.trim() !== '')
            .map(m => ({
                role: m.role,
                content: m.content
            }))
    }

    return {
        // State
        messages,
        isLoading,
        error,
        // Getters
        hasMessages,
        lastMessage,
        // Actions
        addMessage,
        updateMessage,
        sendMessage,
        clearHistory,
        setLoading,
        setError,
        clearError,
        setMessages,
        getHistoryForAPI
    }
})
