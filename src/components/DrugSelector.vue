<template>
  <div class="drug-selector">
    <div class="selector-header">
      <label class="selector-label">
        <span class="label-icon">💊</span>
        {{ label }}
      </label>
      <span v-if="selectedDrugs.length > 0" class="selected-count">
        已选择 {{ selectedDrugs.length }} 种药物
      </span>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <span class="search-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索药物名称..."
        @input="handleSearch"
      />
    </div>

    <!-- 已选择的药物 -->
    <div v-if="selectedDrugs.length > 0" class="selected-drugs">
      <div
        v-for="drug in selectedDrugs"
        :key="drug._id"
        class="selected-drug-chip"
      >
        <span class="chip-name">{{ drug.name }}</span>
        <button class="chip-remove" @click="removeDrug(drug._id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 药物列表 -->
    <div class="drug-list" v-if="!loading">
      <div
        v-for="drug in filteredDrugs"
        :key="drug._id"
        class="drug-item"
        :class="{ selected: isSelected(drug._id) }"
        @click="toggleDrug(drug)"
      >
        <div class="drug-checkbox">
          <div class="checkbox-inner" v-if="isSelected(drug._id)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="drug-info">
          <span class="drug-name">{{ drug.name }}</span>
          <span class="drug-category">{{ drug.category }}</span>
        </div>
      </div>
      
      <div v-if="filteredDrugs.length === 0" class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>未找到匹配的药物</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { drugApi } from '@/api/drug'
import type { Drug } from '@/types'

interface Props {
  label?: string
  modelValue: Drug[]
}

const props = withDefaults(defineProps<Props>(), {
  label: '选择药物'
})

const emit = defineEmits<{
  (e: 'update:modelValue', drugs: Drug[]): void
}>()

const searchQuery = ref('')
const allDrugs = ref<Drug[]>([])
const loading = ref(false)

const selectedDrugs = computed(() => props.modelValue)

const filteredDrugs = computed(() => {
  if (!searchQuery.value.trim()) {
    return allDrugs.value
  }
  const query = searchQuery.value.toLowerCase()
  return allDrugs.value.filter(drug =>
    drug.name.toLowerCase().includes(query) ||
    drug.category.toLowerCase().includes(query)
  )
})

const isSelected = (drugId: string) => {
  return selectedDrugs.value.some(d => d._id === drugId)
}

const toggleDrug = (drug: Drug) => {
  if (isSelected(drug._id)) {
    removeDrug(drug._id)
  } else {
    emit('update:modelValue', [...selectedDrugs.value, drug])
  }
}

const removeDrug = (drugId: string) => {
  emit('update:modelValue', selectedDrugs.value.filter(d => d._id !== drugId))
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const loadDrugs = async () => {
  loading.value = true
  try {
    const response = await drugApi.getDrugs(1, 100)
    if (response.success) {
      allDrugs.value = response.data
    }
  } catch (err) {
    console.error('加载药物列表失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDrugs()
})
</script>

<style scoped>
.drug-selector {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
}

.label-icon {
  font-size: 1.25rem;
}

.selected-count {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 500;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #71717a;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #e4e4e7;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #52525b;
}

.selected-drugs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 10px;
}

.selected-drug-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 500;
}

.chip-name {
  line-height: 1;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.drug-list {
  max-height: 400px;
  overflow-y: auto;
  margin: -0.5rem;
  padding: 0.5rem;
}

.drug-list::-webkit-scrollbar {
  width: 6px;
}

.drug-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 3px;
}

.drug-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.drug-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.drug-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.drug-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.drug-item.selected {
  background: rgba(59, 130, 246, 0.1);
}

.drug-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.drug-item.selected .drug-checkbox {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: transparent;
}

.checkbox-inner {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drug-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.drug-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #e4e4e7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drug-category {
  font-size: 0.8rem;
  color: #71717a;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #71717a;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
