<template>
  <div class="home-view">
    <!-- 动态背景 -->
    <div class="bg-layer">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="logo">
          <div class="logo-pill">
            <span class="pill-half pill-left"></span>
            <span class="pill-half pill-right"></span>
          </div>
          <span class="logo-text">DrugSafe1<span class="logo-accent">AI</span></span>
        </div>
        <nav class="nav-links">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="nav-link"
          >
            {{ link.name }}
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- Hero区域 -->
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              AI驱动的药物安全平台
            </div>
            <h1 class="hero-title">
              <span class="title-line">智能分析</span>
              <span class="title-line title-gradient">药物相互作用</span>
            </h1>
            <p class="hero-description">
              基于DeepSeek大模型的智能药物分析系统，实时检测药物冲突风险，
              可视化药物关系网络，为您的用药安全保驾护航
            </p>
            <div class="hero-actions">
              <button class="btn-primary" @click="navigateTo('/conflict-detection')">
                <span class="btn-icon">⚡</span>
                开始检测
              </button>
              <button class="btn-secondary" @click="navigateTo('/drug-database')">
                浏览药物库
              </button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="molecule-container">
              <div class="molecule-ring ring-1">
                <div class="atom" v-for="i in 6" :key="'r1-'+i" :style="getAtomStyle(i, 6, 120)"></div>
              </div>
              <div class="molecule-ring ring-2">
                <div class="atom" v-for="i in 8" :key="'r2-'+i" :style="getAtomStyle(i, 8, 180)"></div>
              </div>
              <div class="molecule-core">
                <span class="core-icon">💊</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 功能卡片区域 -->
        <section class="features-section">
          <div class="section-header">
            <span class="section-tag">核心功能</span>
            <h2 class="section-title">四大模块，全方位守护</h2>
          </div>
          <div class="feature-grid">
            <div
              v-for="(feature, index) in features"
              :key="feature.path"
              class="feature-card"
              :class="{ 'card-large': index === 0 }"
              @click="navigateTo(feature.path)"
              :style="{ '--delay': index * 0.1 + 's' }"
            >
              <div class="card-glow" :style="{ background: feature.glowColor }"></div>
              <div class="card-content">
                <div class="card-icon-wrapper">
                  <span class="card-icon">{{ feature.icon }}</span>
                </div>
                <div class="card-info">
                  <h3 class="card-title">{{ feature.title }}</h3>
                  <p class="card-description">{{ feature.description }}</p>
                </div>
                <div class="card-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="card-border"></div>
            </div>
          </div>
        </section>

        <!-- 系统特点 -->
        <section class="highlights-section">
          <div class="highlights-wrapper">
            <div class="highlight-card" v-for="(highlight, index) in highlights" :key="highlight.title">
              <div class="highlight-number">0{{ index + 1 }}</div>
              <div class="highlight-content">
                <span class="highlight-icon">{{ highlight.icon }}</span>
                <h4 class="highlight-title">{{ highlight.title }}</h4>
                <p class="highlight-text">{{ highlight.text }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 统计数据 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-item" v-for="stat in stats" :key="stat.label">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo">DrugSafe<span class="logo-accent">AI</span></span>
            <p class="footer-tagline">智能药物安全分析平台</p>
          </div>
          <div class="footer-disclaimer">
            <p>⚠️ 本系统仅供参考，不作为医疗诊断或用药建议依据</p>
            <p>如有用药疑问，请咨询专业医师或药师</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 DrugSafeAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航链接
const navLinks = [
  { name: '冲突检测', path: '/conflict-detection' },
  { name: '药物图谱', path: '/drug-graph' },
  { name: '药物库', path: '/drug-database' }
]

// 功能卡片数据
const features = [
  {
    path: '/conflict-detection',
    icon: '⚡',
    title: '冲突检测',
    description: '智能检测多种药物之间的相互作用，评估潜在风险等级，提供安全用药建议',
    glowColor: 'rgba(239, 68, 68, 0.15)'
  },
  {
    path: '/drug-graph',
    icon: '🔮',
    title: '药物图谱',
    description: '可视化药物关系网络，直观展示相互作用',
    glowColor: 'rgba(59, 130, 246, 0.15)'
  },
  {
    path: '/drug-database',
    icon: '📖',
    title: '药物库',
    description: '海量药物信息，AI智能分析，一键查询',
    glowColor: 'rgba(16, 185, 129, 0.15)'
  },
  {
    path: '/',
    icon: '🏠',
    title: '首页导航',
    description: '系统功能总览，快速导航入口',
    glowColor: 'rgba(139, 92, 246, 0.15)'
  }
]

// 系统特点数据
const highlights = [
  {
    icon: '🧠',
    title: 'DeepSeek AI',
    text: '集成先进大语言模型，提供专业级药物分析能力'
  },
  {
    icon: '⚡',
    title: '毫秒响应',
    text: '智能缓存策略，数据库优先，极速返回结果'
  },
  {
    icon: '🛡️',
    title: '数据可靠',
    text: '基于权威药物数据库，AI分析结果持久化存储'
  },
  {
    icon: '📊',
    title: '可视化',
    text: '交互式图谱展示，药物关系一目了然'
  }
]

// 统计数据
const stats = [
  { value: '1000+', label: '药物数据' },
  { value: '5000+', label: '相互作用' },
  { value: '<500ms', label: '响应时间' },
  { value: '24/7', label: '全天候服务' }
]

// 导航函数
const navigateTo = (path: string) => {
  router.push(path)
}

// 计算原子位置
const getAtomStyle = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${index * 0.2}s`
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0f;
  color: #e4e4e7;
  font-family: 'Noto Sans SC', 'Space Grotesk', sans-serif;
  position: relative;
  overflow-x: hidden;
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
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation-delay: -7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 30px) scale(1.02); }
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* 头部样式 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.8);
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
}

.logo-pill {
  width: 32px;
  height: 16px;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.pill-half {
  flex: 1;
}

.pill-left {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.pill-right {
  background: linear-gradient(135deg, #f472b6, #ec4899);
}

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

.nav-link:hover {
  color: #fff;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

/* 主要内容 */
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 4rem 0;
}

/* Hero区域 */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 70vh;
  padding: 2rem 0;
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 100px;
  font-size: 0.875rem;
  color: #60a5fa;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.title-line {
  display: block;
  color: #fff;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  color: #a1a1aa;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5);
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-secondary {
  padding: 14px 28px;
  background: transparent;
  color: #e4e4e7;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Hero视觉元素 */
.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.molecule-container {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.molecule-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(59, 130, 246, 0.3);
  animation: rotate 30s linear infinite;
}

.ring-1 {
  width: 240px;
  height: 240px;
}

.ring-2 {
  width: 360px;
  height: 360px;
  animation-direction: reverse;
  animation-duration: 40s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.atom {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  margin: -6px 0 0 -6px;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  animation: atomPulse 3s ease-in-out infinite;
}

@keyframes atomPulse {
  0%, 100% { transform: translate(var(--tx, 0), var(--ty, 0)) scale(1); opacity: 1; }
  50% { transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.3); opacity: 0.7; }
}

.molecule-core {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 60px rgba(59, 130, 246, 0.3),
    inset 0 0 30px rgba(59, 130, 246, 0.1);
  animation: corePulse 4s ease-in-out infinite;
}

@keyframes corePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(59, 130, 246, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(59, 130, 246, 0.5); }
}

.core-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
}

/* 功能卡片区域 */
.features-section {
  padding: 6rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-tag {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 100px;
  font-size: 0.875rem;
  color: #a78bfa;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out var(--delay) both;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.04);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  opacity: 0;
  transition: opacity 0.4s;
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.card-border {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  pointer-events: none;
  transition: border-color 0.4s;
}

.feature-card:hover .card-border {
  border-color: rgba(255, 255, 255, 0.12);
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.card-large {
  grid-column: span 2;
}

.card-large .card-content {
  flex-direction: row;
  align-items: center;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.feature-card:hover .card-icon-wrapper {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.05);
}

.card-icon {
  font-size: 1.75rem;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.95rem;
  color: #71717a;
  line-height: 1.6;
}

.card-arrow {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #71717a;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
  flex-shrink: 0;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #fff;
  background: rgba(59, 130, 246, 0.2);
}

/* 系统特点区域 */
.highlights-section {
  padding: 4rem 0;
}

.highlights-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.highlight-card {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.highlight-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.highlight-number {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.03);
  line-height: 1;
}

.highlight-content {
  position: relative;
  z-index: 1;
}

.highlight-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.highlight-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.highlight-text {
  font-size: 0.875rem;
  color: #71717a;
  line-height: 1.6;
}

/* 统计数据区域 */
.stats-section {
  padding: 4rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.95rem;
  color: #71717a;
}

/* 页脚 */
.footer {
  position: relative;
  z-index: 1;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.footer-tagline {
  font-size: 0.875rem;
  color: #71717a;
}

.footer-disclaimer {
  text-align: right;
}

.footer-disclaimer p {
  font-size: 0.875rem;
  color: #71717a;
  line-height: 1.6;
}

.footer-bottom {
  text-align: center;
}

.footer-bottom p {
  font-size: 0.8rem;
  color: #52525b;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .hero-content {
    order: 1;
  }

  .hero-visual {
    order: 0;
  }

  .hero-description {
    margin: 0 auto 2.5rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-title {
    font-size: 3rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .card-large {
    grid-column: span 1;
  }

  .highlights-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .nav-links {
    display: none;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .molecule-container {
    width: 280px;
    height: 280px;
  }

  .ring-1 {
    width: 160px;
    height: 160px;
  }

  .ring-2 {
    width: 240px;
    height: 240px;
  }

  .highlights-wrapper {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem;
  }

  .stat-value {
    font-size: 2rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer-disclaimer {
    text-align: left;
  }
}
</style>
