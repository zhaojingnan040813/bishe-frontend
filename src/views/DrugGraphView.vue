<template>
  <div class="drug-graph-view">
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
          <router-link to="/drug-graph" class="nav-link active">药物图谱</router-link>
          <router-link to="/drug-database" class="nav-link">药物库</router-link>
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
              <span class="badge-icon">🔗</span>
              关系网络
            </div>
            <h1 class="page-title">药物关系图谱</h1>
            <p class="page-description">
              可视化展示药物之间的相互作用关系网络，点击节点查看详情
            </p>
          </div>
        </div>

        <!-- 图谱区域 -->
        <div class="graph-wrapper">
          <DrugGraph
            ref="drugGraphRef"
            height="calc(100vh - 280px)"
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
import { drugApi } from '@/api/drug'
import DrugGraph from '@/components/DrugGraph.vue'
import DrugDetailModal from '@/components/DrugDetailModal.vue'
import type { Drug, GraphNode } from '@/types'

const router = useRouter()

const drugGraphRef = ref<InstanceType<typeof DrugGraph>>()
const showDrugDetail = ref(false)
const selectedDrugDetail = ref<Drug | null>(null)

const navigateTo = (path: string) => {
  router.push(path)
}

const handleNodeClick = async (node: GraphNode) => {
  try {
    const response = await drugApi.getDrugById(node.id)
    if (response.success && response.data) {
      selectedDrugDetail.value = response.data
      showDrugDetail.value = true
    }
  } catch (err) {
    console.error('获取药物详情失败:', err)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.drug-graph-view {
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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%);
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
  bottom: -100px;
  right: -100px;
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
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
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
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 100px;
  font-size: 0.85rem;
  color: #60a5fa;
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

/* 图谱区域 */
.graph-wrapper {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
}

/* 响应式 */
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
}
</style>
