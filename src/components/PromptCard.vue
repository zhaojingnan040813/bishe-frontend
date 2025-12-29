<template>
  <div class="prompt-templates">
    <div class="templates-header">
      <span class="templates-icon">💡</span>
      <h3 class="templates-title">试试这些问题</h3>
    </div>
    
    <div class="templates-grid">
      <button
        v-for="(prompt, index) in displayPrompts"
        :key="index"
        class="prompt-card"
        :style="{ '--delay': index * 0.1 + 's' }"
        @click="handleSelect(prompt)"
      >
        <span class="prompt-icon">{{ getPromptIcon(index) }}</span>
        <span class="prompt-text">{{ prompt }}</span>
        <span class="prompt-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * 自定义提示词列表（可选）
   * 如果不提供，将使用默认提示词
   */
  prompts?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  prompts: undefined
})

const emit = defineEmits<{
  /**
   * 当用户选择一个提示词时触发
   */
  (e: 'select', prompt: string): void
}>()

/**
 * 默认提示词列表
 * 包含典型的药物相关问题
 */
const defaultPrompts = [
  '头孢和酒精在一起服用会有哪些副作用？',
  '为什么咖啡因不能和安眠药一起服用？',
  '牛奶不能与哪些抗生素一起服用？'
]

/**
 * 显示的提示词列表
 */
const displayPrompts = computed(() => {
  return props.prompts && props.prompts.length > 0 ? props.prompts : defaultPrompts
})

/**
 * 获取提示词图标
 */
function getPromptIcon(index: number): string {
  const icons = ['💊', '☕', '🥛', '💉', '🧪', '🩺']
  return icons[index % icons.length]
}

/**
 * 处理提示词选择
 */
function handleSelect(prompt: string): void {
  emit('select', prompt)
}
</script>

<style scoped>
.prompt-templates {
  padding: 2rem;
  animation: fadeIn 0.4s ease-out;
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

.templates-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.templates-icon {
  font-size: 1.5rem;
}

.templates-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0;
}

.templates-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
}

.prompt-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  color: #e4e4e7;
  font-size: 0.95rem;
  animation: cardIn 0.4s ease-out var(--delay) both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.prompt-card:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(4px);
}

.prompt-card:active {
  transform: translateX(2px) scale(0.99);
}

.prompt-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s;
}

.prompt-card:hover .prompt-icon {
  background: rgba(59, 130, 246, 0.15);
  transform: scale(1.05);
}

.prompt-text {
  flex: 1;
  line-height: 1.5;
}

.prompt-arrow {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52525b;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
}

.prompt-card:hover .prompt-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #60a5fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prompt-templates {
    padding: 1.5rem 1rem;
  }
  
  .templates-header {
    margin-bottom: 1rem;
  }
  
  .templates-title {
    font-size: 1rem;
  }
  
  .prompt-card {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
    gap: 0.75rem;
  }
  
  .prompt-icon {
    width: 36px;
    height: 36px;
    font-size: 1.25rem;
  }
  
  .prompt-arrow {
    display: none;
  }
}
</style>
