<template>
  <div class="home-view">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="logo">
          <span class="logo-icon">💊</span>
          <span class="logo-text">药物相互作用查询系统</span>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 欢迎区域 -->
        <section class="hero-section">
          <h1 class="hero-title">智能药物相互作用分析平台</h1>
          <p class="hero-subtitle">
            基于AI技术的药物安全查询系统，帮助您快速了解药物信息和潜在相互作用风险
          </p>
        </section>

        <!-- 功能卡片区域 -->
        <section class="features-section">
          <div class="feature-cards">
            <div
              v-for="feature in features"
              :key="feature.path"
              class="feature-card"
              @click="navigateTo(feature.path)"
            >
              <div class="card-icon" :style="{ background: feature.color }">
                {{ feature.icon }}
              </div>
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-description">{{ feature.description }}</p>
              <div class="card-arrow">→</div>
            </div>
          </div>
        </section>

        <!-- 系统特点 -->
        <section class="highlights-section">
          <h2 class="section-title">系统特点</h2>
          <div class="highlights-grid">
            <div v-for="highlight in highlights" :key="highlight.title" class="highlight-item">
              <div class="highlight-icon">{{ highlight.icon }}</div>
              <h4 class="highlight-title">{{ highlight.title }}</h4>
              <p class="highlight-text">{{ highlight.text }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">© 2024 药物相互作用查询系统 - 仅供参考，不作为医疗建议</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 功能卡片数据
const features = [
  {
    path: '/',
    icon: '🏠',
    title: '首页',
    description: '系统介绍和功能导航',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    path: '/conflict-detection',
    icon: '⚠️',
    title: '冲突检测',
    description: '检测多种药物之间的相互作用和潜在风险',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    path: '/drug-graph',
    icon: '🕸️',
    title: '药物图谱',
    description: '可视化展示药物关系网络和相互作用',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    path: '/drug-database',
    icon: '📚',
    title: '药物库',
    description: '浏览和搜索药物信息，AI智能分析',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
]

// 系统特点数据
const highlights = [
  {
    icon: '🤖',
    title: 'AI智能分析',
    text: '集成DeepSeek大模型，提供专业的药物分析和建议'
  },
  {
    icon: '⚡',
    title: '快速响应',
    text: '缓存优先策略，毫秒级返回查询结果'
  },
  {
    icon: '🔒',
    title: '数据可靠',
    text: '基于权威药物数据库，确保信息准确性'
  },
  {
    icon: '📊',
    title: '可视化展示',
    text: '直观的图谱展示，轻松理解药物关系'
  }
]

// 导航函数
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
}

/* 头部样式 */
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

/* 主要内容 */
.main-content {
  flex: 1;
  padding: 3rem 0;
}

/* 欢迎区域 */
.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6c757d;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 功能卡片区域 */
.features-section {
  margin-bottom: 4rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-arrow {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  font-size: 1.5rem;
  color: #667eea;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 系统特点区域 */
.highlights-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2.5rem;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.highlight-item {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.highlight-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.highlight-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.highlight-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.highlight-text {
  font-size: 0.95rem;
  color: #6c757d;
  line-height: 1.6;
}

/* 页脚 */
.footer {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-text {
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
