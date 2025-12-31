<template>
  <div class="chat-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 确认弹窗 -->
    <ConfirmDialog
      v-model:visible="dialogVisible"
      :title="dialogConfig.title"
      :message="dialogConfig.message"
      :type="dialogConfig.type"
      :confirm-text="dialogConfig.confirmText"
      @confirm="dialogConfig.onConfirm"
    />

    <!-- 折叠按钮 -->
    <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :class="{ rotated: isCollapsed }">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div v-show="!isCollapsed" class="sidebar-content">
      <!-- 操作按钮区 -->
      <div class="sidebar-actions">
        <button class="action-btn new-chat" @click="$emit('newChat')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>新对话</span>
        </button>
        <button class="action-btn clear-all" @click="handleClearAll" :disabled="sessions.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>清空记录</span>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索历史对话..."
          @input="handleSearch"
        />
        <button v-if="searchKeyword" class="clear-search" @click="clearSearch">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- 会话列表 -->
      <div class="sessions-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <div v-else-if="filteredSessions.length === 0" class="empty-state">
          <span v-if="searchKeyword">未找到匹配的对话</span>
          <span v-else>暂无历史对话</span>
        </div>

        <div v-else class="sessions-container">
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="session-item"
            :class="{ active: session.id === currentSessionId }"
            @click="$emit('selectSession', session.id)"
          >
            <div class="session-info">
              <span class="session-title">{{ session.title }}</span>
              <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
            </div>
            <button
              class="delete-btn"
              @click.stop="handleDelete(session.id)"
              title="删除此对话"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import type { ChatSession } from '@/utils/chatDB'
import { searchSessions, deleteSession, clearAllSessions } from '@/utils/chatDB'
import ConfirmDialog from './ConfirmDialog.vue'

interface Props {
  sessions: ChatSession[]
  currentSessionId: string | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'newChat'): void
  (e: 'selectSession', id: string): void
  (e: 'deleteSession', id: string): void
  (e: 'clearAll'): void
  (e: 'refresh'): void
}>()

const isCollapsed = ref(false)
const searchKeyword = ref('')
const filteredSessions = ref<ChatSession[]>([])
const searchTimeout = ref<number | null>(null)

// 弹窗相关
const dialogVisible = ref(false)
const dialogConfig = reactive({
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  confirmText: '确定',
  onConfirm: () => {}
})

// 初始化时显示所有会话
onMounted(() => {
  filteredSessions.value = props.sessions
})

// 监听 sessions 变化
watch(() => props.sessions, (newSessions) => {
  if (!searchKeyword.value) {
    filteredSessions.value = newSessions
  }
}, { immediate: true })

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = window.setTimeout(async () => {
    if (searchKeyword.value.trim()) {
      filteredSessions.value = await searchSessions(searchKeyword.value)
    } else {
      filteredSessions.value = props.sessions
    }
  }, 300)
}

const clearSearch = () => {
  searchKeyword.value = ''
  filteredSessions.value = props.sessions
}

const handleDelete = (id: string) => {
  dialogConfig.title = '删除对话'
  dialogConfig.message = '确定要删除这个对话吗？删除后无法恢复。'
  dialogConfig.type = 'warning'
  dialogConfig.confirmText = '删除'
  dialogConfig.onConfirm = async () => {
    // 如果删除的是当前选中的对话，先跳转到下一条或上一条
    if (id === props.currentSessionId) {
      const currentIndex = filteredSessions.value.findIndex(s => s.id === id)
      const nextSession = filteredSessions.value[currentIndex + 1] || filteredSessions.value[currentIndex - 1]
      if (nextSession) {
        emit('selectSession', nextSession.id)
      }
    }
    await deleteSession(id)
    emit('deleteSession', id)
    emit('refresh')
  }
  dialogVisible.value = true
}

const handleClearAll = () => {
  dialogConfig.title = '清空所有记录'
  dialogConfig.message = '确定要清空所有聊天记录吗？此操作不可恢复。'
  dialogConfig.type = 'danger'
  dialogConfig.confirmText = '清空'
  dialogConfig.onConfirm = async () => {
    await clearAllSessions()
    emit('clearAll')
  }
  dialogVisible.value = true
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}
</script>


<style scoped>
.chat-sidebar {
  width: 280px;
  height: 100%;
  background: rgba(15, 15, 20, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.chat-sidebar.collapsed {
  width: 48px;
}

.collapse-btn {
  position: absolute;
  top: 12px;
  right: -12px;
  width: 24px;
  height: 24px;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.collapse-btn svg {
  transition: transform 0.3s;
}

.collapse-btn svg.rotated {
  transform: rotate(180deg);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  overflow: hidden;
  flex: 1;
  min-height: 100vh;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #e4e4e7;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.new-chat:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.action-btn.clear-all:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #e4e4e7;
  font-size: 0.8rem;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.search-box input::placeholder {
  color: #52525b;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #52525b;
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.clear-search:hover {
  color: #a1a1aa;
  background: rgba(255, 255, 255, 0.05);
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 -0.5rem;
  padding: 0 0.5rem;
  min-height: 0;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 8px;
}

.sessions-list::-webkit-scrollbar {
  width: 4px;
}

.sessions-list::-webkit-scrollbar-track {
  background: transparent;
}

.sessions-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #71717a;
  font-size: 0.85rem;
  gap: 0.75rem;
  min-height: 100%;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sessions-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 100%;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.5rem;
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.session-item.active {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.session-title {
  font-size: 0.85rem;
  color: #e4e4e7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 0.7rem;
  color: #52525b;
}

.delete-btn {
  opacity: 0;
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 768px) {
  .chat-sidebar {
    position: fixed;
    left: 0;
    top: 72px;
    bottom: 0;
    z-index: 100;
    transform: translateX(0);
  }

  .chat-sidebar.collapsed {
    transform: translateX(-100%);
    width: 280px;
  }

  .collapse-btn {
    right: -36px;
    width: 32px;
    height: 32px;
  }
}
</style>
