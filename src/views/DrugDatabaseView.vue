<template>
  <div class="drug-database-view">
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
          <router-link to="/conflict-detection" class="nav-link">冲突检测</router-link>
          <router-link to="/drug-graph" class="nav-link">药物图谱</router-link>
          <router-link to="/drug-database" class="nav-link active">药物库</router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-badge">
              <span class="badge-icon">📖</span>
              药物数据库
            </div>
            <h1 class="page-title">药物库</h1>
            <p class="page-description">
              浏览和搜索药物信息，支持AI智能分析未知药物
            </p>
          </div>
          <button class="ai-analyze-btn" @click="showAIModal = true">
            <span class="btn-icon">🤖</span>
            AI分析
          </button>
        </div>

        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-box">
            <span class="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索药物名称..."
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="search-btn" @click="handleSearch">
              搜索
            </button>
          </div>
          <div class="search-tags">
            <span class="tag-label">热门:</span>
            <button 
              v-for="tag in hotTags" 
              :key="tag" 
              class="hot-tag"
              @click="quickSearch(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">{{ total }}</span>
            <span class="stat-label">药物总数</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ displayedDrugs.length }}</span>
            <span class="stat-label">当前显示</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ isSearchMode ? '搜索结果' : '全部' }}</span>
            <span class="stat-label">显示模式</span>
          </div>
        </div>

        <!-- 药物列表 -->
        <div class="drug-list-section">
          <!-- 加载状态 -->
          <LoadingSpinner v-if="loading" text="加载中..." overlay />

          <!-- 空状态 -->
          <div v-else-if="displayedDrugs.length === 0" class="empty-state">
            <span class="empty-icon">🔍</span>
            <h3>{{ isSearchMode ? '未找到相关药物' : '暂无药物数据' }}</h3>
            <p>{{ isSearchMode ? '试试其他关键词，或使用AI分析功能' : '点击右上角AI分析添加新药物' }}</p>
            <button v-if="isSearchMode" class="ai-suggest-btn" @click="analyzeSearchQuery">
              <span>🤖</span> 使用AI分析"{{ searchQuery }}"
            </button>
          </div>

          <!-- 药物卡片网格 -->
          <div v-else class="drug-grid">
            <div
              v-for="drug in displayedDrugs"
              :key="drug._id"
              class="drug-card"
              @click="showDrugDetail(drug)"
            >
              <div class="card-header">
                <span class="drug-icon">💊</span>
                <span class="source-tag" :class="drug.source">
                  {{ drug.source === 'ai' ? 'AI' : '人工' }}
                </span>
              </div>
              <h3 class="drug-name">{{ drug.name }}</h3>
              <p class="drug-category">{{ drug.category }}</p>
              <p class="drug-desc">{{ truncateText(drug.description, 60) }}</p>
              <div class="card-footer">
                <span class="update-time">{{ formatDate(drug.updatedAt) }}</span>
                <span class="view-detail">查看详情 →</span>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="!isSearchMode && total > pageSize" class="pagination-wrapper">
            <Pagination
              v-model:current-page="currentPage"
              :total="total"
              :page-size="pageSize"
              @change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- 药物详情弹窗 -->
    <DrugDetailModal
      v-model:visible="showDetailModal"
      :drug="selectedDrug"
      @close="selectedDrug = null"
    />

    <!-- AI分析弹窗 -->
    <AIAnalysisModal
      v-model:visible="showAIModal"
      @saved="handleAISaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { drugApi } from '@/api/drug'
import toast from '@/utils/toast'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Pagination from '@/components/Pagination.vue'
import DrugDetailModal from '@/components/DrugDetailModal.vue'
import AIAnalysisModal from '@/components/AIAnalysisModal.vue'
import type { Drug } from '@/types'

const router = useRouter()

// 状态
const loading = ref(false)
const drugs = ref<Drug[]>([])
const searchResults = ref<Drug[]>([])
const searchQuery = ref('')
const isSearchMode = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 弹窗状态
const showDetailModal = ref(false)
const showAIModal = ref(false)
const selectedDrug = ref<Drug | null>(null)

// 热门标签
const hotTags = ['阿司匹林', '布洛芬', '阿莫西林', '头孢', '维生素']

// 计算属性
const displayedDrugs = computed(() => {
  return isSearchMode.value ? searchResults.value : drugs.value
})

// 方法
const navigateTo = (path: string) => {
  router.push(path)
}

const fetchDrugs = async () => {
  loading.value = true
  try {
    const response = await drugApi.getDrugs(currentPage.value, pageSize.value)
    if (response.success) {
      drugs.value = response.data
      total.value = response.total
    }
  } catch (err: any) {
    toast.error('获取药物列表失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    clearSearch()
    return
  }
  
  loading.value = true
  isSearchMode.value = true
  
  try {
    const response = await drugApi.searchDrugs(searchQuery.value.trim())
    if (response.success && response.data) {
      searchResults.value = response.data
      if (response.data.length === 0) {
        toast.info('未找到相关药物，可以尝试AI分析')
      }
    }
  } catch (err: any) {
    toast.error('搜索失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearchMode.value = false
  searchResults.value = []
}

const quickSearch = (tag: string) => {
  searchQuery.value = tag
  handleSearch()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchDrugs()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showDrugDetail = (drug: Drug) => {
  selectedDrug.value = drug
  showDetailModal.value = true
}

const analyzeSearchQuery = () => {
  showAIModal.value = true
}

const handleAISaved = (drug: Drug) => {
  // 刷新列表
  if (isSearchMode.value) {
    handleSearch()
  } else {
    fetchDrugs()
  }
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 生命周期
onMounted(() => {
  fetchDrugs()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.drug-database-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0f;
  color: #e4e4e7;
  font-family: 'Noto Sans SC', 'Space Grotesk', sans-serif;
  position: relative;
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
  background: radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%);
  top: -100px;
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
  50% { transform: translate(30px, -30px) scale(1.05); }
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* 头部 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header .container {
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
}

.logo-pill {
  width: 32px;
  height: 16px;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.pill-half { flex: 1; }
.pill-left { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.pill-right { background: linear-gradient(135deg, #f472b6, #ec4899); }

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

.nav-link:hover, .nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
}

/* 主要内容 */
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 2rem 0 4rem;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 100px;
  font-size: 0.85rem;
  color: #34d399;
  margin-bottom: 1rem;
}

.badge-icon { font-size: 1rem; }

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.page-description {
  font-size: 1rem;
  color: #71717a;
  margin: 0;
}

.ai-analyze-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.ai-analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
}

.btn-icon { font-size: 1.1rem; }

/* 搜索区域 */
.search-section {
  margin-bottom: 2rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 4px;
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  color: #71717a;
}

.search-input {
  flex: 1;
  padding: 14px 0;
  background: transparent;
  border: none;
  color: #e4e4e7;
  font-size: 1rem;
}

.search-input::placeholder { color: #52525b; }

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: #71717a;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.search-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.search-tags {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.tag-label {
  font-size: 0.85rem;
  color: #71717a;
}

.hot-tag {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #a1a1aa;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-tag:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.25rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.8rem;
  color: #71717a;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
}

/* 药物列表 */
.drug-list-section {
  position: relative;
  min-height: 400px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 0.95rem;
  color: #71717a;
  margin: 0 0 1.5rem;
}

.ai-suggest-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-suggest-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
}

/* 药物卡片网格 */
.drug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.drug-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drug-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.drug-icon {
  font-size: 2rem;
}

.source-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.source-tag.ai {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.source-tag.manual {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.drug-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem;
}

.drug-category {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  font-size: 0.8rem;
  color: #60a5fa;
  margin: 0 0 0.75rem;
}

.drug-desc {
  font-size: 0.9rem;
  color: #71717a;
  line-height: 1.6;
  margin: 0 0 1rem;
  min-height: 2.8em;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.update-time {
  font-size: 0.8rem;
  color: #52525b;
}

.view-detail {
  font-size: 0.85rem;
  color: #10b981;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.drug-card:hover .view-detail {
  opacity: 1;
  transform: translateX(0);
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-title { font-size: 2rem; }
  
  .ai-analyze-btn { width: 100%; justify-content: center; }
  
  .stats-bar {
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
  }
  
  .stat-divider { display: none; }
  
  .drug-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-links { display: none; }
}
</style>
