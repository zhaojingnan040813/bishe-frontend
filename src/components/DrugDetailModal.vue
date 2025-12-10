<template>
  <BaseModal
    :visible="visible"
    :title="drug?.name || '药物详情'"
    size="large"
    @update:visible="$emit('update:visible', $event)"
    @close="$emit('close')"
  >
    <div v-if="drug" class="drug-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="section-header">
          <span class="section-icon">💊</span>
          <h4>基本信息</h4>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">药物名称</span>
            <span class="info-value">{{ drug.name }}</span>
          </div>
          <div class="info-item" v-if="drug.genericName">
            <span class="info-label">通用名</span>
            <span class="info-value">{{ drug.genericName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">分类</span>
            <span class="info-value category-tag">{{ drug.category }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据来源</span>
            <span class="info-value">
              <span class="source-badge" :class="drug.source">
                {{ drug.source === 'ai' ? 'AI分析' : '人工录入' }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <div class="detail-section" v-if="drug.description">
        <div class="section-header">
          <span class="section-icon">📋</span>
          <h4>药物描述</h4>
        </div>
        <p class="description-text">{{ drug.description }}</p>
      </div>

      <!-- 用法用量 -->
      <div class="detail-section" v-if="drug.dosage">
        <div class="section-header">
          <span class="section-icon">💉</span>
          <h4>用法用量</h4>
        </div>
        <p class="description-text">{{ drug.dosage }}</p>
      </div>

      <!-- 副作用 -->
      <div class="detail-section" v-if="drug.sideEffects?.length">
        <div class="section-header">
          <span class="section-icon">⚠️</span>
          <h4>副作用</h4>
        </div>
        <div class="tag-list">
          <span v-for="effect in drug.sideEffects" :key="effect" class="tag tag-warning">
            {{ effect }}
          </span>
        </div>
      </div>

      <!-- 禁忌症 -->
      <div class="detail-section" v-if="drug.contraindications?.length">
        <div class="section-header">
          <span class="section-icon">🚫</span>
          <h4>禁忌症</h4>
        </div>
        <div class="tag-list">
          <span v-for="item in drug.contraindications" :key="item" class="tag tag-danger">
            {{ item }}
          </span>
        </div>
      </div>

      <!-- AI分析 -->
      <div class="detail-section" v-if="drug.aiAnalysis">
        <div class="section-header">
          <span class="section-icon">🤖</span>
          <h4>AI智能分析</h4>
        </div>
        <div class="ai-analysis-box">
          <p class="ai-analysis-text">{{ drug.aiAnalysis }}</p>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="detail-footer">
        <span class="time-info">创建时间: {{ formatDate(drug.createdAt) }}</span>
        <span class="time-info">更新时间: {{ formatDate(drug.updatedAt) }}</span>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="$emit('update:visible', false)">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import type { Drug } from '@/types'

interface Props {
  visible: boolean
  drug: Drug | null
}

defineProps<Props>()
defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.drug-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.section-icon {
  font-size: 1.25rem;
}

.section-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  color: #71717a;
}

.info-value {
  font-size: 0.95rem;
  color: #e4e4e7;
}

.category-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  color: #60a5fa;
  font-size: 0.85rem;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.source-badge.ai {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.source-badge.manual {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.description-text {
  font-size: 0.95rem;
  color: #a1a1aa;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.tag-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.tag-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.ai-analysis-box {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 10px;
  padding: 1rem;
}

.ai-analysis-text {
  font-size: 0.95rem;
  color: #c4b5fd;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.time-info {
  font-size: 0.8rem;
  color: #52525b;
}

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

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-footer {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
