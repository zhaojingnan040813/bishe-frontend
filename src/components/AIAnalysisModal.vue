<template>
  <BaseModal
    :visible="visible"
    title="AI智能分析"
    size="medium"
    :close-on-overlay="!loading"
    @update:visible="handleVisibleChange"
    @close="$emit('close')"
  >
    <div class="ai-analysis-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <label class="input-label">输入药物名称</label>
        <div class="input-wrapper">
          <input
            v-model="drugName"
            type="text"
            class="drug-input"
            placeholder="请输入要分析的药物名称..."
            :disabled="loading"
            @keyup.enter="handleAnalyze"
          />
          <button 
            class="analyze-btn" 
            :disabled="!drugName.trim() || loading"
            @click="handleAnalyze"
          >
            <span v-if="loading" class="btn-loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </span>
            <span v-else>🔍 分析</span>
          </button>
        </div>
        <p class="input-hint">AI将为您分析该药物的详细信息、用法用量、副作用等</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <div class="ai-thinking">
          <div class="thinking-animation">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
          </div>
          <p class="thinking-text">AI正在分析中，请稍候...</p>
          <p class="thinking-hint">首次分析可能需要较长时间</p>
        </div>
      </div>

      <!-- 分析结果 -->
      <div v-else-if="analysisResult" class="result-section">
        <div class="result-header">
          <span class="result-icon">✨</span>
          <h4>分析结果</h4>
          <span class="result-source">
            来源: {{ analysisResult.source === 'ai' ? 'AI实时分析' : '数据库缓存' }}
          </span>
        </div>
        
        <div class="result-card">
          <div class="result-name">{{ analysisResult.name }}</div>
          
          <div v-if="analysisResult.category" class="result-item">
            <span class="item-label">分类</span>
            <span class="item-value category">{{ analysisResult.category }}</span>
          </div>
          
          <div v-if="analysisResult.description" class="result-item">
            <span class="item-label">描述</span>
            <p class="item-text">{{ analysisResult.description }}</p>
          </div>
          
          <div v-if="analysisResult.dosage" class="result-item">
            <span class="item-label">用法用量</span>
            <p class="item-text">{{ analysisResult.dosage }}</p>
          </div>
          
          <div v-if="analysisResult.sideEffects?.length" class="result-item">
            <span class="item-label">副作用</span>
            <div class="tag-list">
              <span v-for="effect in analysisResult.sideEffects" :key="effect" class="tag warning">
                {{ effect }}
              </span>
            </div>
          </div>
          
          <div v-if="analysisResult.contraindications?.length" class="result-item">
            <span class="item-label">禁忌症</span>
            <div class="tag-list">
              <span v-for="item in analysisResult.contraindications" :key="item" class="tag danger">
                {{ item }}
              </span>
            </div>
          </div>
          
          <div v-if="analysisResult.aiAnalysis" class="result-item ai-box">
            <span class="item-label">AI分析</span>
            <p class="item-text ai-text">{{ analysisResult.aiAnalysis }}</p>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-section">
        <span class="error-icon">❌</span>
        <p class="error-text">{{ error }}</p>
        <button class="retry-btn" @click="handleAnalyze">重试</button>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="handleVisibleChange(false)" :disabled="loading">
        取消
      </button>
      <button 
        v-if="analysisResult && analysisResult.source === 'ai'"
        class="btn-primary"
        :disabled="saving"
        @click="handleSave"
      >
        <span v-if="saving">保存中...</span>
        <span v-else>💾 保存到数据库</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { drugApi, type AnalyzeDrugResult } from '@/api/drug'
import toast from '@/utils/toast'
import type { Drug } from '@/types'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
  (e: 'saved', drug: Drug): void
}>()

const drugName = ref('')
const loading = ref(false)
const saving = ref(false)
const analysisResult = ref<AnalyzeDrugResult | null>(null)
const error = ref('')

// 重置状态
watch(() => props.visible, (val) => {
  if (!val) {
    drugName.value = ''
    analysisResult.value = null
    error.value = ''
  }
})

const handleVisibleChange = (val: boolean) => {
  if (loading.value) return
  emit('update:visible', val)
}

const handleAnalyze = async () => {
  if (!drugName.value.trim() || loading.value) return
  
  loading.value = true
  error.value = ''
  analysisResult.value = null
  
  try {
    const response = await drugApi.analyzeDrug(drugName.value.trim())
    if (response.success && response.data) {
      analysisResult.value = response.data
      toast.success('分析完成')
    } else {
      error.value = response.error?.message || '分析失败，请稍后重试'
    }
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || '网络错误，请稍后重试'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!analysisResult.value || saving.value) return
  
  // 如果已经是从数据库来的，不需要再保存
  if (analysisResult.value.source !== 'ai') {
    toast.info('该数据已存在于数据库中')
    return
  }
  
  saving.value = true
  try {
    // 调用保存接口将AI分析结果保存到数据库
    const response = await drugApi.saveDrug({
      name: analysisResult.value.name,
      genericName: analysisResult.value.genericName,
      description: analysisResult.value.description,
      category: analysisResult.value.category,
      sideEffects: analysisResult.value.sideEffects,
      contraindications: analysisResult.value.contraindications,
      dosage: analysisResult.value.dosage,
      aiAnalysis: analysisResult.value.aiAnalysis,
      source: 'ai',
    })
    
    if (response.success && response.data) {
      toast.success('已保存到数据库')
      emit('saved', response.data)
      emit('update:visible', false)
    } else {
      toast.error(response.error?.message || '保存失败，请稍后重试')
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.error?.message || '保存失败，请稍后重试'
    toast.error(errorMsg)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ai-analysis-content {
  min-height: 200px;
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #e4e4e7;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
}

.drug-input {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e4e4e7;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.drug-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.drug-input::placeholder {
  color: #52525b;
}

.drug-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.analyze-btn {
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  gap: 4px;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #71717a;
}

/* 加载状态 */
.loading-section {
  padding: 3rem 0;
}

.ai-thinking {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.thinking-animation {
  display: flex;
  gap: 8px;
}

.thinking-dot {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  animation: thinking 1.5s infinite ease-in-out;
}

.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes thinking {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.5; }
}

.thinking-text {
  font-size: 1rem;
  color: #e4e4e7;
}

.thinking-hint {
  font-size: 0.85rem;
  color: #71717a;
}

/* 结果区域 */
.result-section {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.result-icon {
  font-size: 1.25rem;
}

.result-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  flex: 1;
}

.result-source {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 6px;
  color: #a78bfa;
}

.result-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.25rem;
}

.result-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.result-item {
  margin-bottom: 1rem;
}

.result-item:last-child {
  margin-bottom: 0;
}

.item-label {
  display: block;
  font-size: 0.8rem;
  color: #71717a;
  margin-bottom: 0.375rem;
}

.item-value {
  font-size: 0.95rem;
  color: #e4e4e7;
}

.item-value.category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  color: #60a5fa;
  font-size: 0.85rem;
}

.item-text {
  font-size: 0.9rem;
  color: #a1a1aa;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
}

.tag.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.tag.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.ai-box {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
}

.ai-text {
  color: #c4b5fd;
}

/* 错误区域 */
.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 2.5rem;
}

.error-text {
  font-size: 0.95rem;
  color: #f87171;
}

.retry-btn {
  padding: 0.5rem 1.5rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

/* 底部按钮 */
.btn-secondary {
  padding: 0.625rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e4e4e7;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
