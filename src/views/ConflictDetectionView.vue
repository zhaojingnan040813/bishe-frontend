<template>
  <div class="conflict-detection-view">
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
          <router-link to="/conflict-detection" class="nav-link active">冲突检测</router-link>
          <router-link to="/drug-graph" class="nav-link">药物图谱</router-link>
          <router-link to="/drug-database" class="nav-link">药物库</router-link>
          <router-link to="/ai-chat" class="nav-link">AI问答</router-link>
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
              <span class="badge-icon">⚡</span>
              智能检测
            </div>
            <h1 class="page-title">药物相互作用检测</h1>
            <p class="page-description">
              选择多种药物，AI智能分析潜在的相互作用风险
            </p>
          </div>
        </div>

        <!-- 检测区域 -->
        <div class="detection-section">
          <div class="detection-grid">
            <!-- 药物选择器 -->
            <div class="selector-card">
              <DrugSelector
                v-model="selectedDrugs"
                label="选择要检测的药物"
              />
              
              <button
                class="detect-btn"
                :disabled="selectedDrugs.length < 2 || detecting"
                @click="handleDetect"
              >
                <span class="btn-icon">⚡</span>
                {{ detecting ? '检测中...' : '开始检测' }}
                <span v-if="selectedDrugs.length >= 2" class="btn-badge">
                  {{ selectedDrugs.length }}
                </span>
              </button>
              
              <p v-if="selectedDrugs.length < 2" class="hint-text">
                💡 请至少选择 2 种药物进行检测
              </p>
            </div>

            <!-- 检测结果 -->
            <div class="result-card result-card-main">
              <!-- 加载状态 -->
              <LoadingSpinner
                v-if="detecting"
                text="正在分析药物相互作用..."
                overlay
              />

              <!-- 空状态 -->
              <div v-if="!detecting && !detectionResult" class="empty-result">
                <div class="empty-illustration">
                  <div class="pill-icon">💊</div>
                  <div class="plus-icon">+</div>
                  <div class="pill-icon">💊</div>
                  <div class="equals-icon">=</div>
                  <div class="question-icon">?</div>
                </div>
                <h3>等待检测</h3>
                <p>选择药物后点击"开始检测"查看相互作用分析</p>
              </div>

              <!-- 检测结果展示 -->
              <div v-if="!detecting && detectionResult" class="result-content">
                <!-- 风险等级卡片 -->
                <div class="risk-summary" :class="`risk-${detectionResult.riskLevel}`">
                  <div class="risk-header">
                    <span class="risk-icon">{{ getRiskIcon(detectionResult.riskLevel) }}</span>
                    <div class="risk-info">
                      <h3 class="risk-title">{{ getRiskTitle(detectionResult.riskLevel) }}</h3>
                      <p class="risk-subtitle">{{ getRiskDescription(detectionResult.riskLevel) }}</p>
                    </div>
                  </div>
                  <div class="risk-stats">
                    <div class="stat-item">
                      <span class="stat-value">{{ detectionResult.drugCount }}</span>
                      <span class="stat-label">检测药物</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-value">{{ detectionResult.interactionCount }}</span>
                      <span class="stat-label">相互作用</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                      <span class="stat-badge" :class="`source-${detectionResult.source}`">
                        {{ getSourceLabel(detectionResult.source) }}
                      </span>
                      <span class="stat-label">数据来源</span>
                    </div>
                  </div>
                </div>

                <!-- 相互作用列表 -->
                <div v-if="detectionResult.interactions.length > 0" class="interactions-list">
                  <h4 class="list-title">
                    <span class="title-icon">📋</span>
                    相互作用详情
                  </h4>
                  
                  <div
                    v-for="(interaction, index) in detectionResult.interactions"
                    :key="interaction._id || index"
                    class="interaction-item"
                    :class="`severity-${interaction.severity}`"
                  >
                    <div class="interaction-header">
                      <div class="drug-pair">
                        <span class="drug-tag">{{ interaction.drug1Name }}</span>
                        <span class="interaction-arrow">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M7 12H17M17 12L13 8M17 12L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </span>
                        <span class="drug-tag">{{ interaction.drug2Name }}</span>
                      </div>
                      <span class="severity-badge" :class="`severity-${interaction.severity}`">
                        {{ getSeverityLabel(interaction.severity) }}
                      </span>
                    </div>
                    
                    <div class="interaction-body">
                      <div class="interaction-field">
                        <label>相互作用类型:</label>
                        <span>{{ interaction.interactionType }}</span>
                      </div>
                      <div class="interaction-field">
                        <label>详细说明:</label>
                        <p>{{ interaction.description }}</p>
                      </div>
                      <div class="interaction-field recommendation">
                        <label>💡 建议:</label>
                        <p>{{ interaction.recommendation }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 无相互作用 -->
                <div v-else class="no-interactions">
                  <span class="success-icon">✅</span>
                  <h4>未发现相互作用</h4>
                  <p>所选药物之间暂未发现明显的相互作用</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 药物关系图谱区域 - 仅在有检测结果时显示 -->
        <div v-if="detectionResult && selectedDrugs.length >= 2" class="graph-section">
          <div class="section-header-bar">
            <div class="section-title-group">
              <span class="section-icon">🔗</span>
              <h2 class="section-title">药物关系图谱</h2>
            </div>
            <p class="section-desc">可视化展示所选药物之间的相互作用关系，点击节点查看药物详情</p>
          </div>
          <InteractionGraph
            :drugs="selectedDrugs"
            :interactions="detectionResult.interactions"
            height="450px"
            @node-click="handleNodeClick"
          />
        </div>
      </div>
    </main>

    <!-- 药物详情弹窗 -->
    <DrugDetailModal
      v-model:visible="showDrugDetail"
      :drug="selectedDrugDetail"
      @close="showDrugDetail = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { interactionApi } from '@/api/interaction'
import DrugSelector from '@/components/DrugSelector.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import InteractionGraph from '@/components/InteractionGraph.vue'
import DrugDetailModal from '@/components/DrugDetailModal.vue'
import type { Drug, InteractionResult } from '@/types'

const router = useRouter()

const selectedDrugs = ref<Drug[]>([])
const detecting = ref(false)
const detectionResult = ref<InteractionResult | null>(null)
const error = ref<string | null>(null)

// 图谱相关
const showDrugDetail = ref(false)
const selectedDrugDetail = ref<Drug | null>(null)

const navigateTo = (path: string) => {
  router.push(path)
}

// 处理图谱节点点击 - 直接使用已选择的药物数据
const handleNodeClick = (drug: Drug) => {
  selectedDrugDetail.value = drug
  showDrugDetail.value = true
}

const handleDetect = async () => {
  if (selectedDrugs.value.length < 2) return
  
  detecting.value = true
  error.value = null
  detectionResult.value = null
  
  try {
    const drugIds = selectedDrugs.value.map(d => d._id)
    const response = await interactionApi.checkInteractions(drugIds)
    
    if (response.success && response.data) {
      detectionResult.value = response.data
    }
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || '检测失败，请稍后重试'
    console.error('检测失败:', err)
  } finally {
    detecting.value = false
  }
}

const getRiskIcon = (level: string) => {
  const icons = {
    low: '✅',
    medium: '⚠️',
    high: '🚨'
  }
  return icons[level as keyof typeof icons] || '❓'
}

const getRiskTitle = (level: string) => {
  const titles = {
    low: '低风险',
    medium: '中等风险',
    high: '高风险'
  }
  return titles[level as keyof typeof titles] || '未知风险'
}

const getRiskDescription = (level: string) => {
  const descriptions = {
    low: '药物相互作用风险较低，但仍需注意用药安全',
    medium: '存在一定的相互作用风险，建议咨询医生',
    high: '存在严重的相互作用风险，请立即咨询医生'
  }
  return descriptions[level as keyof typeof descriptions] || '风险等级未知'
}

const getSeverityLabel = (severity: string) => {
  const labels = {
    low: '轻度',
    medium: '中度',
    high: '严重'
  }
  return labels[severity as keyof typeof labels] || severity
}

const getSourceLabel = (source: string) => {
  const labels = {
    database: '数据库',
    ai: 'AI分析',
    mixed: '混合来源'
  }
  return labels[source as keyof typeof labels] || source
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.conflict-detection-view {
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
  background: radial-gradient(circle, rgba(239, 68, 68, 0.5) 0%, transparent 70%);
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
  background: linear-gradient(90deg, #ef4444, #f59e0b);
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
  margin-bottom: 2rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 100px;
  font-size: 0.85rem;
  color: #f87171;
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

/* 检测区域 */
.detection-section {
  margin-bottom: 2rem;
}

.detection-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  align-items: start;
}

.selector-card,
.result-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 2rem;
}

.selector-card {
  position: sticky;
  top: 100px;
}

.detect-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  position: relative;
}

.detect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
}

.detect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #ef4444;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hint-text {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #71717a;
  text-align: center;
}

.result-card {
  min-height: 500px;
  position: relative;
}

/* 空状态 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-illustration {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.pill-icon, .plus-icon, .equals-icon, .question-icon {
  animation: float 3s ease-in-out infinite;
}

.plus-icon { animation-delay: 0.2s; color: #71717a; }
.equals-icon { animation-delay: 0.4s; color: #71717a; }
.question-icon { animation-delay: 0.6s; color: #f59e0b; }

.empty-result h3 {
  font-size: 1.5rem;
  color: #e4e4e7;
  margin: 0 0 0.5rem;
}

.empty-result p {
  font-size: 1rem;
  color: #71717a;
  margin: 0;
}

/* 检测结果 */
.result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.risk-summary {
  padding: 1.5rem;
  border-radius: 16px;
  border: 2px solid;
  position: relative;
  overflow: hidden;
}

.risk-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.risk-summary.risk-low {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.risk-summary.risk-low::before {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.risk-summary.risk-medium {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.2);
}

.risk-summary.risk-medium::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.risk-summary.risk-high {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.risk-summary.risk-high::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.risk-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.risk-icon {
  font-size: 3rem;
}

.risk-info {
  flex: 1;
}

.risk-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.25rem;
}

.risk-subtitle {
  font-size: 0.95rem;
  color: #a1a1aa;
  margin: 0;
}

.risk-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.8rem;
  color: #71717a;
}

.stat-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-badge.source-database {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.stat-badge.source-ai {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.stat-badge.source-mixed {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
}

/* 相互作用列表 */
.interactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0 0 0.5rem;
}

.title-icon {
  font-size: 1.25rem;
}

.interaction-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s;
}

.interaction-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.interaction-item.severity-high {
  border-left: 4px solid #ef4444;
}

.interaction-item.severity-medium {
  border-left: 4px solid #f59e0b;
}

.interaction-item.severity-low {
  border-left: 4px solid #22c55e;
}

.interaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.drug-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.drug-tag {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 500;
}

.interaction-arrow {
  color: #71717a;
  display: flex;
  align-items: center;
}

.severity-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.severity-badge.severity-high {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.severity-badge.severity-medium {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.severity-badge.severity-low {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.interaction-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.interaction-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.interaction-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.interaction-field span,
.interaction-field p {
  font-size: 0.95rem;
  color: #e4e4e7;
  line-height: 1.6;
  margin: 0;
}

.interaction-field.recommendation {
  margin-top: 0.5rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.interaction-field.recommendation label {
  color: #60a5fa;
}

/* 无相互作用 */
.no-interactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-interactions h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #22c55e;
  margin: 0 0 0.5rem;
}

.no-interactions p {
  font-size: 0.95rem;
  color: #71717a;
  margin: 0;
}

/* 图谱区域 */
.graph-section {
  margin-top: 3rem;
}

.section-header-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-desc {
  font-size: 0.95rem;
  color: #71717a;
  margin: 0;
}

.result-card-main {
  min-height: 500px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .detection-grid {
    grid-template-columns: 1fr;
  }
  
  .selector-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .nav-links {
    display: none;
  }
  
  .empty-illustration {
    font-size: 2rem;
    gap: 0.5rem;
  }
  
  .graph-section {
    margin-top: 2rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
