import { openDB, type IDBPDatabase } from 'idb'
import type { Message } from '@/stores/chat'
import { toRaw } from 'vue'

/**
 * 聊天会话接口
 */
export interface ChatSession {
    id: string
    title: string
    messages: Message[]
    createdAt: number
    updatedAt: number
}

const DB_NAME = 'ai-chat-db'
const DB_VERSION = 1
const STORE_NAME = 'sessions'

let dbInstance: IDBPDatabase | null = null

/**
 * 获取数据库实例
 */
async function getDB(): Promise<IDBPDatabase> {
    if (dbInstance) return dbInstance

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('updatedAt', 'updatedAt')
                store.createIndex('title', 'title')
            }
        }
    })
    return dbInstance
}

/**
 * 深度克隆并移除 Vue 响应式代理
 */
function deepClone<T>(obj: T): T {
    const raw = toRaw(obj)
    return JSON.parse(JSON.stringify(raw))
}

/**
 * 生成唯一会话ID
 */
export function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 从消息内容生成会话标题
 */
export function generateTitle(messages: Message[], sessionNumber?: number): string {
    const firstUserMsg = messages.find(m => m.role === 'user')
    if (firstUserMsg) {
        const content = firstUserMsg.content.trim()
        return content.length > 25 ? content.substring(0, 25) + '...' : content
    }
    return sessionNumber ? `新对话 ${sessionNumber}` : '新对话'
}


/**
 * 获取下一个新对话序号
 */
export async function getNextSessionNumber(): Promise<number> {
    const db = await getDB()
    const sessions = await db.getAll(STORE_NAME)
    const newChatPattern = /^新对话\s*(\d+)?$/
    let maxNumber = 0

    sessions.forEach((session: ChatSession) => {
        const match = session.title.match(newChatPattern)
        if (match) {
            const num = match[1] ? parseInt(match[1], 10) : 1
            if (num > maxNumber) maxNumber = num
        }
    })

    return maxNumber + 1
}

/**
 * 创建新会话
 */
export async function createSession(messages: Message[] = []): Promise<ChatSession> {
    const db = await getDB()
    const now = Date.now()
    const sessionNumber = await getNextSessionNumber()
    const clonedMessages = deepClone(messages)
    const session: ChatSession = {
        id: generateSessionId(),
        title: generateTitle(clonedMessages, sessionNumber),
        messages: clonedMessages,
        createdAt: now,
        updatedAt: now
    }
    await db.put(STORE_NAME, session)
    return session
}

/**
 * 更新会话
 */
export async function updateSession(
    id: string,
    updates: Partial<Omit<ChatSession, 'id' | 'createdAt'>>
): Promise<ChatSession | null> {
    const db = await getDB()
    const session = await db.get(STORE_NAME, id)
    if (!session) return null

    // 深度克隆更新内容，移除 Vue 响应式代理
    const clonedUpdates = deepClone(updates)

    const updatedSession: ChatSession = {
        ...session,
        ...clonedUpdates,
        updatedAt: Date.now()
    }

    // 如果消息更新了，自动更新标题（保留原有的新对话序号）
    if (clonedUpdates.messages && clonedUpdates.messages.length > 0) {
        const newTitle = generateTitle(clonedUpdates.messages)
        // 只有当标题不是"新对话"格式时才更新
        if (newTitle !== '新对话' && !newTitle.startsWith('新对话 ')) {
            updatedSession.title = newTitle
        } else if (session.title === '新对话' || session.title.startsWith('新对话 ')) {
            // 保留原有的新对话序号
        } else {
            updatedSession.title = newTitle
        }
    }

    await db.put(STORE_NAME, updatedSession)
    return updatedSession
}

/**
 * 获取单个会话
 */
export async function getSession(id: string): Promise<ChatSession | null> {
    const db = await getDB()
    return (await db.get(STORE_NAME, id)) || null
}

/**
 * 获取所有会话（按更新时间倒序）
 */
export async function getAllSessions(): Promise<ChatSession[]> {
    const db = await getDB()
    const sessions = await db.getAll(STORE_NAME)
    return sessions.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt)
}

/**
 * 搜索会话（按标题和消息内容）
 */
export async function searchSessions(keyword: string): Promise<ChatSession[]> {
    const db = await getDB()
    const sessions = await db.getAll(STORE_NAME)
    const lowerKeyword = keyword.toLowerCase().trim()

    if (!lowerKeyword) {
        return sessions.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt)
    }

    return sessions
        .filter((session: ChatSession) => {
            // 搜索标题
            if (session.title.toLowerCase().includes(lowerKeyword)) return true
            // 搜索消息内容
            return session.messages.some((msg: Message) =>
                msg.content.toLowerCase().includes(lowerKeyword)
            )
        })
        .sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt)
}

/**
 * 删除单个会话
 */
export async function deleteSession(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
}

/**
 * 清空所有会话
 */
export async function clearAllSessions(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAME)
}

/**
 * 获取会话数量
 */
export async function getSessionCount(): Promise<number> {
    const db = await getDB()
    return await db.count(STORE_NAME)
}
