<template>
  <div class="chat-message" :class="[`message-${message.role}`, { 'is-streaming': message.isStreaming }]">
    <!-- 头像 -->
    <div class="message-avatar">
      <span v-if="message.role === 'user'" class="avatar-icon user-avatar">👤</span>
      <span v-else class="avatar-icon ai-avatar">🤖</span>
    </div>
    
    <!-- 消息内容 -->
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      
      <div class="message-body">
        <!-- 渲染Markdown内容 -->
        <div 
          v-if="message.content" 
          class="message-text"
          v-html="renderedContent"
        ></div>
        
        <!-- 流式加载动画 -->
        <div v-if="message.isStreaming && !message.content" class="streaming-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        
        <!-- 流式光标 -->
        <span v-if="message.isStreaming && message.content" class="streaming-cursor"></span>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="message.error" class="message-error">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ message.error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/stores/chat'

interface Props {
  message: Message
}

const props = defineProps<Props>()

/**
 * 格式化时间戳
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 简单的Markdown渲染
 * 支持：粗体、斜体、代码块、行内代码、链接、列表
 */
function renderMarkdown(text: string): string {
  if (!text) return ''
  
  let html = text
  
  // 转义HTML特殊字符（保护安全）
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // 代码块 (```code```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
  })
  
  // 行内代码 (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  
  // 粗体 (**text** 或 __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  
  // 斜体 (*text* 或 _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  
  // 标题 (### text)
  html = html.replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>')
  
  // 无序列表
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(/(<li class="md-li">.*<\/li>\n?)+/g, '<ul class="md-ul">$&</ul>')
  
  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>')
  html = html.replace(/(<li class="md-oli">.*<\/li>\n?)+/g, '<ol class="md-ol">$&</ol>')
  
  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')
  
  // 换行
  html = html.replace(/\n/g, '<br>')
  
  return html
}

/**
 * 渲染后的内容
 */
const renderedContent = computed(() => {
  return renderMarkdown(props.message.content)
})
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  animation: messageIn 0.3s ease-out;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户消息 - 右侧蓝色 */
.message-user {
  flex-direction: row-reverse;
}

.message-user .message-content {
  align-items: flex-end;
}

.message-user .message-body {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  border-radius: 18px 18px 4px 18px;
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4);
}

.message-user .message-header {
  flex-direction: row-reverse;
}

/* AI消息 - 左侧灰色 */
.message-assistant .message-body {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 头像 */
.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.ai-avatar {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

/* 消息内容容器 */
.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 75%;
  min-width: 100px;
}

/* 消息头部 */
.message-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.25rem;
}

.message-role {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a1a1aa;
}

.message-time {
  font-size: 0.75rem;
  color: #52525b;
}

/* 消息主体 */
.message-body {
  padding: 0.875rem 1.125rem;
  line-height: 1.6;
  font-size: 0.95rem;
  position: relative;
}

.message-text {
  word-break: break-word;
}

/* Markdown样式 */
.message-text :deep(.md-h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.6rem 0 0.3rem;
  color: inherit;
}

.message-text :deep(.md-h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
  color: inherit;
}

.message-text :deep(.md-h4) {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.4rem 0 0.2rem;
  color: inherit;
}

.message-text :deep(.code-block) {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 0.75rem 0.875rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}

.message-text :deep(.inline-code) {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875em;
}

.message-text :deep(.md-ul),
.message-text :deep(.md-ol) {
  margin: 0 0;
  padding-left: 1.5rem;
}

.message-text :deep(.md-li),
.message-text :deep(.md-oli) {
  margin: 0.15rem 0;
}

.message-text :deep(.md-link) {
  color: #93c5fd;
  text-decoration: none;
  border-bottom: 1px solid rgba(147, 197, 253, 0.3);
  transition: all 0.2s ease;
}

.message-text :deep(.md-link:hover) {
  color: #bfdbfe;
  border-bottom-color: rgba(191, 219, 254, 0.8);
  background: rgba(147, 197, 253, 0.1);
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

/* 用户消息中的代码块样式调整 */
.message-user .message-text :deep(.code-block) {
  background: rgba(0, 0, 0, 0.2);
}

.message-user .message-text :deep(.inline-code) {
  background: rgba(0, 0, 0, 0.15);
}

.message-user .message-text :deep(.md-link) {
  color: #bfdbfe;
}

/* 流式加载动画 */
.streaming-indicator {
  display: flex;
  gap: 4px;
  padding: 0.25rem 0;
}

.streaming-indicator .dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.6;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.streaming-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.streaming-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 流式光标 */
.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: currentColor;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursorBlink 1s step-end infinite;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 流式状态样式 */
.is-streaming .message-body {
  position: relative;
}

/* 错误提示 */
.message-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #f87171;
}

.error-icon {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-message {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .message-avatar {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .message-body {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
