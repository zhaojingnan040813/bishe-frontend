<template>
  <div class="ai-chat-view">
    <!-- 动态背景 -->
    <div class="bg-layer">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="logo" @click="navigateTo('/')">
          <div class="logo-pill">
            <span class="pill-half pill-left"></span>
            <span class="pill-half pill-right"></span>
          </div>
          <span class="logo-text">DrugSafe<span class="logo-accent">AI</span></span>
        </div>
        <nav class="nav-links">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="nav-link"
          >
            {{ link.name }}
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域（含侧边栏） -->
    <div class="main-wrapper">
      <!-- 历史会话侧边栏 -->
      <ChatSidebar
        :sessions="sessions"
        :current-session-id="currentSessionId"
        :loading="sessionsLoading"
        @new-chat="handleNewChat"
        @select-session="handleSelectSession"
        @delete-session="handleDeleteSession"
        @clear-all="handleClearAll"
        @refresh="loadSessions"
      />

      <!-- 主要内容区域 -->
      <main class="main-content">
      <div class="chat-container">
        <!-- 聊天头部 -->
        <!-- <div class="chat-header">
          <div class="chat-title">
            <span class="chat-icon">🤖</span>
            <h1>AI药物问答</h1>
          </div>
          <button 
            v-if="chatStore.hasMessages" 
            class="clear-btn"
            @click="handleClearHistory"
          >
            <span class="clear-icon">🗑️</span>
            清空对话
          </button>
        </div> -->

        <!-- 消息列表区域 -->
        <div class="messages-area" ref="messagesContainer">
          <!-- 空状态：显示提示词 -->
          <div v-if="!chatStore.hasMessages" class="empty-state">
            <div class="welcome-message">
              <span class="welcome-icon">💊</span>
              <h2>欢迎使用AI药物问答</h2>
              <p>我是精通药物学的医学科学家，可以为您解答药物相关问题，包括药物相互作用、副作用机制等专业知识。</p>
            </div>
            <PromptCard @select="handlePromptSelect" />
          </div>

          <!-- 消息列表 -->
          <div v-else class="messages-list">
            <ChatMessage 
              v-for="message in chatStore.messages" 
              :key="message.id"
              :message="message"
            />
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="chatStore.error" class="error-banner">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ chatStore.error }}</span>
          <button class="error-dismiss" @click="chatStore.clearError()">×</button>
        </div>


      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-area-content">
          <!-- 中间输入框 -->
          <div class="input-wrapper">
            <textarea
              ref="inputRef"
              v-model="inputText"
              class="message-input"
              placeholder="输入您的药物相关问题..."
              :disabled="isStreaming"
              @keydown.enter.exact.prevent="handleSend"
              @input="autoResize"
              rows="1"
            ></textarea>
            <button 
              class="send-btn"
              :disabled="!canSend"
              @click="handleSend"
            >
              <span v-if="isStreaming" class="loading-spinner"></span>
              <span v-else class="send-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </div>

          <!-- 右侧模型选择 -->
          <div class="input-actions-right">
            <div class="model-selector">
              <button 
                class="model-btn"
                @click="toggleModelDropdown"
                title="切换模型"
              >
                <span class="model-icon">🧠</span>
                <span class="model-name">{{ currentModelLabel }}</span>
                <svg class="dropdown-arrow" :class="{ 'open': showModelDropdown }" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div v-if="showModelDropdown" class="model-dropdown">
                <button 
                  v-for="model in availableModels" 
                  :key="model.value"
                  class="model-option"
                  :class="{ 'active': currentModel === model.value }"
                  @click="selectModel(model.value)"
                >
                  <span class="option-icon">{{ model.icon }}</span>
                  <div class="option-info">
                    <span class="option-name">{{ model.label }}</span>
                    <span class="option-desc">{{ model.description }}</span>
                  </div>
                  <span v-if="currentModel === model.value" class="check-icon">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { connectSSE } from '@/utils/sse'
import ChatMessage from '@/components/ChatMessage.vue'
import PromptCard from '@/components/PromptCard.vue'
import ChatSidebar from '@/components/ChatSidebar.vue'
import {
  type ChatSession,
  createSession,
  updateSession,
  getSession,
  getAllSessions,
  deleteSession,
  clearAllSessions
} from '@/utils/chatDB'

const router = useRouter()
const chatStore = useChatStore()

// Refs
const inputRef = ref<HTMLTextAreaElement | null>(null)
const messagesContainer = ref<HTMLDivElement | null>(null)
const inputText = ref('')
const isStreaming = ref(false)

// 会话管理
const sessions = ref<ChatSession[]>([])
const currentSessionId = ref<string | null>(null)
const sessionsLoading = ref(false)

// 模型相关
const showModelDropdown = ref(false)
const currentModel = ref('deepseek-chat')

// DeepSeek 可用模型
const availableModels = [
  { 
    value: 'deepseek-chat', 
    label: 'DeepSeek Chat', 
    icon: '💬',
    description: '通用对话，适合日常问答'
  },
  { 
    value: 'deepseek-reasoner', 
    label: 'DeepSeek Reasoner', 
    icon: '🧠',
    description: '深度推理，适合复杂分析'
  }
]

const currentModelLabel = computed(() => {
  const model = availableModels.find(m => m.value === currentModel.value)
  return model ? model.label : 'DeepSeek Chat'
})

// 切换模型下拉框
const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value
}

// 选择模型
const selectModel = (modelValue: string) => {
  currentModel.value = modelValue
  showModelDropdown.value = false
  // 保存到localStorage
  localStorage.setItem('ai-chat-model', modelValue)
}

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.model-selector')) {
    showModelDropdown.value = false
  }
}

// 导航链接
const navLinks = [
  { name: '冲突检测', path: '/conflict-detection' },
  { name: '药物图谱', path: '/drug-graph' },
  { name: '药物库', path: '/drug-database' },
  { name: 'AI问答', path: '/ai-chat' }
]

// 计算属性
const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !isStreaming.value
})

// 导航函数
const navigateTo = (path: string) => {
  router.push(path)
}

// 新对话
const handleNewChat = async () => {
  // 如果当前有消息，先保存
  if (chatStore.hasMessages && currentSessionId.value) {
    await updateSession(currentSessionId.value, { messages: chatStore.messages })
  }
  
  // 创建新会话
  const newSession = await createSession([])
  currentSessionId.value = newSession.id
  chatStore.clearHistory()
  inputText.value = ''
  await loadSessions()
  inputRef.value?.focus()
}

// 选择会话
const handleSelectSession = async (sessionId: string) => {
  if (sessionId === currentSessionId.value) return
  
  // 保存当前会话
  if (chatStore.hasMessages && currentSessionId.value) {
    await updateSession(currentSessionId.value, { messages: chatStore.messages })
  }
  
  // 加载选中的会话
  const session = await getSession(sessionId)
  if (session) {
    currentSessionId.value = session.id
    chatStore.setMessages(session.messages)
  }
}

// 删除会话
const handleDeleteSession = async (sessionId: string) => {
  if (sessionId === currentSessionId.value) {
    // 如果删除的是当前会话，切换到新会话
    await handleNewChat()
  }
  await loadSessions()
}

// 清空所有会话
const handleClearAll = async () => {
  currentSessionId.value = null
  chatStore.clearHistory()
  sessions.value = []
  inputText.value = ''
  inputRef.value?.focus()
}

// 加载所有会话
const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    sessions.value = await getAllSessions()
  } finally {
    sessionsLoading.value = false
  }
}

// 保存当前会话到 IndexedDB
const saveCurrentSession = async () => {
  if (!currentSessionId.value || !chatStore.hasMessages) return
  await updateSession(currentSessionId.value, { messages: chatStore.messages })
  await loadSessions()
}

// 自动调整输入框高度
const autoResize = () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 150) + 'px'
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 发送消息
const handleSend = async () => {
  if (!canSend.value) return

  const message = inputText.value.trim()
  inputText.value = ''
  
  // 重置输入框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  // 如果没有当前会话，先创建一个
  if (!currentSessionId.value) {
    const newSession = await createSession([])
    currentSessionId.value = newSession.id
  }

  // 创建用户消息和AI占位消息
  const { assistantMessage } = chatStore.sendMessage(message)
  isStreaming.value = true
  chatStore.setLoading(true)

  scrollToBottom()

  // 获取对话历史（不包括当前消息）
  const history = chatStore.getHistoryForAPI().slice(0, -2)

  try {
    await connectSSE({
      message,
      history,
      model: currentModel.value,
      onStart: () => {
        // 流开始
      },
      onContent: (text) => {
        // 更新AI消息内容
        chatStore.updateMessage(assistantMessage.id, {
          content: (chatStore.messages.find(m => m.id === assistantMessage.id)?.content || '') + text
        })
        scrollToBottom()
      },
      onDone: () => {
        // 流结束，标记消息完成
        chatStore.updateMessage(assistantMessage.id, {
          isStreaming: false
        })
        isStreaming.value = false
        chatStore.setLoading(false)
        // 保存到 IndexedDB
        saveCurrentSession()
      },
      onError: (error) => {
        // 处理错误
        chatStore.updateMessage(assistantMessage.id, {
          isStreaming: false,
          error: error
        })
        chatStore.setError(error)
        isStreaming.value = false
        chatStore.setLoading(false)
        // 保存到 IndexedDB
        saveCurrentSession()
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '发生未知错误'
    chatStore.updateMessage(assistantMessage.id, {
      isStreaming: false,
      error: errorMessage
    })
    chatStore.setError(errorMessage)
    isStreaming.value = false
    chatStore.setLoading(false)
  }
}

// 处理提示词选择
const handlePromptSelect = async (prompt: string) => {
  // 如果没有当前会话，先创建一个
  if (!currentSessionId.value) {
    const newSession = await createSession([])
    currentSessionId.value = newSession.id
    await loadSessions()
  }
  inputText.value = prompt
  handleSend()
}

// 清空历史（保留兼容）
const handleClearHistory = () => {
  handleClearAll()
}

// 组件挂载时加载历史
onMounted(async () => {
  // 加载所有会话
  await loadSessions()
  
  // 如果有会话，加载最近的一个
  if (sessions.value.length > 0) {
    const latestSession = sessions.value[0]
    currentSessionId.value = latestSession.id
    chatStore.setMessages(latestSession.messages)
  }
  
  // 加载保存的模型设置
  const savedModel = localStorage.getItem('ai-chat-model')
  if (savedModel && availableModels.some(m => m.value === savedModel)) {
    currentModel.value = savedModel
  }
  // 聚焦输入框
  inputRef.value?.focus()
  // 添加点击外部关闭下拉框的事件
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 监听消息变化，自动保存
watch(
  () => chatStore.messages,
  async (messages) => {
    if (messages.length > 0 && !isStreaming.value && currentSessionId.value) {
      await saveCurrentSession()
    }
  },
  { deep: true }
)
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.ai-chat-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0f;
  color: #e4e4e7;
  font-family: 'Noto Sans SC', 'Space Grotesk', sans-serif;
  position: relative;
  overflow: hidden;
}

/* 主体包装器 */
.main-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  z-index: 1;
  overflow: hidden;
  height: calc(100vh - 72px);
}

/* 动态背景 */
.bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%);
  top: -150px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
  bottom: -100px;
  left: -100px;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -20px) scale(1.03); }
  50% { transform: translate(-15px, 15px) scale(0.97); }
  75% { transform: translate(15px, 20px) scale(1.01); }
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* 头部样式 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-pill {
  width: 32px;
  height: 16px;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.pill-half {
  flex: 1;
}

.pill-left {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.pill-right {
  background: linear-gradient(135deg, #f472b6, #ec4899);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
}

.logo-accent {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #a1a1aa;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

/* 主要内容 */
.main-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1800px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  overflow: hidden;
}

/* 聊天头部 */
/* .chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
} */

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-icon {
  font-size: 1.75rem;
}

.chat-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #f87171;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.clear-icon {
  font-size: 1rem;
}

/* 消息区域 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  padding-bottom: 120px; /* 为固定在底部的输入框留出空间 */
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.welcome-message {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.welcome-message h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.75rem;
}

.welcome-message p {
  font-size: 1rem;
  color: #a1a1aa;
  line-height: 1.6;
  max-width: 500px;
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
}

/* 错误提示 */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  margin: 0 0 1rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-banner .error-icon {
  font-size: 1.25rem;
}

.error-banner .error-text {
  flex: 1;
  font-size: 0.9rem;
  color: #f87171;
}

.error-dismiss {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #f87171;
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.error-dismiss:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* 输入区域 - 固定在浏览器可视区域底部 */
.input-area {
  position: fixed;
  bottom: 0;
  left: 280px;
  right: 0;
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  z-index: 50;
  transition: left 0.3s ease;
}

.input-area-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

/* 右侧模型选择 */
.input-actions-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.model-selector {
  position: relative;
}

.model-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #a1a1aa;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.model-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.model-icon {
  font-size: 1rem;
}

.model-name {
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.model-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  min-width: 260px;
  background: rgba(20, 20, 30, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  animation: dropdownIn 0.2s ease-out;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.model-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #e4e4e7;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.model-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.model-option.active {
  background: rgba(139, 92, 246, 0.15);
}

.option-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.option-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
}

.option-desc {
  font-size: 0.75rem;
  color: #71717a;
}

.check-icon {
  color: #a78bfa;
  font-weight: 600;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #e4e4e7;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  max-height: 150px;
  padding: 0.25rem 0.5rem;
}

.message-input::placeholder {
  color: #52525b;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-hint {
  font-size: 0.75rem;
  color: #52525b;
  text-align: center;
  margin-top: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
    height: 64px;
  }

  .nav-links {
    display: none;
  }

  .chat-container {
    padding: 0 1rem;
  }

  .chat-title h1 {
    font-size: 1.25rem;
  }

  .clear-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .welcome-message h2 {
    font-size: 1.5rem;
  }

  .welcome-message p {
    font-size: 0.9rem;
  }

  .input-area {
    left: 0;
    padding: 0.75rem 1rem 1rem;
  }

  .input-area-content {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .input-actions-right {
    order: 2;
  }

  .input-wrapper {
    order: 1;
    width: 100%;
    padding: 0.5rem;
    border-radius: 12px;
  }

  .model-name {
    display: none;
  }

  .model-btn {
    padding: 0.5rem;
  }

  .model-dropdown {
    right: auto;
    left: 0;
    min-width: 220px;
  }

  .message-input {
    font-size: 0.95rem;
  }

  .send-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .input-hint {
    display: none;
  }
}

@media (max-width: 480px) {
  .chat-icon {
    display: none;
  }

  .clear-btn .clear-icon {
    display: none;
  }

  .welcome-icon {
    font-size: 3rem;
  }
}
</style>
