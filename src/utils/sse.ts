/**
 * SSE客户端工具
 * 用于处理Server-Sent Events流式请求
 */

/**
 * SSE事件类型
 */
export type SSEEventType = 'start' | 'content' | 'done' | 'error'

/**
 * SSE事件数据
 */
export interface SSEEvent {
    type: SSEEventType
    text?: string
    error?: string
}

/**
 * SSE连接选项
 */
export interface SSEOptions {
    /** 消息内容 */
    message: string
    /** 对话历史 */
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    /** 模型名称 */
    model?: string
    /** 收到内容时的回调 */
    onContent?: (text: string) => void
    /** 开始时的回调 */
    onStart?: () => void
    /** 完成时的回调 */
    onDone?: () => void
    /** 错误时的回调 */
    onError?: (error: string) => void
    /** 请求超时时间（毫秒） */
    timeout?: number
}

/**
 * 错误类型枚举
 */
export enum SSEErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    API_TIMEOUT = 'API_TIMEOUT',
    STREAM_ERROR = 'STREAM_ERROR',
    PARSE_ERROR = 'PARSE_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 获取用户友好的错误消息
 */
function getUserFriendlyError(error: unknown, type: SSEErrorType): string {
    const errorMessages: Record<SSEErrorType, string> = {
        [SSEErrorType.NETWORK_ERROR]: '网络连接失败，请检查您的网络连接',
        [SSEErrorType.API_TIMEOUT]: '请求超时，请稍后重试',
        [SSEErrorType.STREAM_ERROR]: '数据传输中断，请重新发送消息',
        [SSEErrorType.PARSE_ERROR]: '数据解析错误，请重新发送消息',
        [SSEErrorType.UNKNOWN_ERROR]: '发生未知错误，请稍后重试'
    }

    // 如果是服务端返回的错误消息，直接使用
    if (error && typeof error === 'string') {
        return error
    }

    return errorMessages[type]
}

/**
 * 解析SSE数据行
 */
function parseSSELine(line: string): SSEEvent | null {
    // SSE格式: "data: {...}"
    if (!line.startsWith('data: ')) {
        return null
    }

    const jsonStr = line.slice(6) // 移除 "data: " 前缀

    try {
        return JSON.parse(jsonStr) as SSEEvent
    } catch {
        console.error('Failed to parse SSE data:', jsonStr)
        return null
    }
}

/**
 * 连接SSE流式接口
 * 使用fetch API实现，支持流式读取
 */
export async function connectSSE(options: SSEOptions): Promise<void> {
    const {
        message,
        history = [],
        model = 'deepseek-chat',
        onContent,
        onStart,
        onDone,
        onError,
        timeout = 60000 // 默认60秒超时
    } = options

    // TODO: 根据实际API地址调整
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    const url = `${baseUrl}/ai/chat/stream`

    // 创建AbortController用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
        controller.abort()
    }, timeout)

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({ message, history, model }),
            signal: controller.signal
        })

        // 清除超时定时器
        clearTimeout(timeoutId)

        // 检查响应状态
        if (!response.ok) {
            // 尝试解析错误响应
            try {
                const errorData = await response.json()
                const errorMessage = errorData.error?.message || `请求失败 (${response.status})`
                onError?.(errorMessage)
            } catch {
                onError?.(getUserFriendlyError(null, SSEErrorType.NETWORK_ERROR))
            }
            return
        }

        // 检查Content-Type
        const contentType = response.headers.get('Content-Type')
        if (!contentType?.includes('text/event-stream')) {
            onError?.(getUserFriendlyError(null, SSEErrorType.STREAM_ERROR))
            return
        }

        // 获取响应体的reader
        const reader = response.body?.getReader()
        if (!reader) {
            onError?.(getUserFriendlyError(null, SSEErrorType.STREAM_ERROR))
            return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        // 读取流式数据
        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            // 解码数据
            buffer += decoder.decode(value, { stream: true })

            // 按行分割处理
            const lines = buffer.split('\n')

            // 保留最后一个可能不完整的行
            buffer = lines.pop() || ''

            // 处理完整的行
            for (const line of lines) {
                const trimmedLine = line.trim()
                if (!trimmedLine) continue

                const event = parseSSELine(trimmedLine)
                if (!event) continue

                switch (event.type) {
                    case 'start':
                        onStart?.()
                        break
                    case 'content':
                        if (event.text) {
                            onContent?.(event.text)
                        }
                        break
                    case 'done':
                        onDone?.()
                        break
                    case 'error':
                        onError?.(event.error || getUserFriendlyError(null, SSEErrorType.STREAM_ERROR))
                        break
                }
            }
        }

        // 处理缓冲区中剩余的数据
        if (buffer.trim()) {
            const event = parseSSELine(buffer.trim())
            if (event) {
                switch (event.type) {
                    case 'done':
                        onDone?.()
                        break
                    case 'error':
                        onError?.(event.error || getUserFriendlyError(null, SSEErrorType.STREAM_ERROR))
                        break
                }
            }
        }

    } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                onError?.(getUserFriendlyError(null, SSEErrorType.API_TIMEOUT))
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                onError?.(getUserFriendlyError(null, SSEErrorType.NETWORK_ERROR))
            } else {
                onError?.(getUserFriendlyError(error.message, SSEErrorType.UNKNOWN_ERROR))
            }
        } else {
            onError?.(getUserFriendlyError(null, SSEErrorType.UNKNOWN_ERROR))
        }
    }
}

/**
 * 检查浏览器是否支持SSE所需的API
 */
export function isSSESupported(): boolean {
    return typeof fetch !== 'undefined' &&
        typeof ReadableStream !== 'undefined' &&
        typeof TextDecoder !== 'undefined'
}
