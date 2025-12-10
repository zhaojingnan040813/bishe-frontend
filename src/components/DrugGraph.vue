<template>
  <div class="drug-graph-container" ref="containerRef">
    <!-- 加载状态 -->
    <div v-if="loading" class="graph-loading">
      <div class="loading-spinner"></div>
      <span>加载图谱数据...</span>
    </div>

    <!-- 图谱容器 -->
    <div ref="chartRef" class="chart-container" :class="{ hidden: loading }"></div>

    <!-- 图例 -->
    <div class="graph-legend">
      <div class="legend-title">风险等级</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-line high"></span>
          <span>高风险</span>
        </div>
        <div class="legend-item">
          <span class="legend-line medium"></span>
          <span>中风险</span>
        </div>
        <div class="legend-item">
          <span class="legend-line low"></span>
          <span>低风险</span>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="stats" class="graph-stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalDrugs }}</span>
        <span class="stat-label">药物</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalInteractions }}</span>
        <span class="stat-label">相互作用</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && isEmpty" class="empty-state">
      <div class="empty-icon">🔬</div>
      <h4>暂无图谱数据</h4>
      <p>数据库中还没有药物相互作用记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { graphApi } from '@/api/graph'
import type { GraphData, GraphStats, GraphNode, GraphEdge } from '@/types'

interface Props {
  drugId?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '500px'
})

const emit = defineEmits<{
  (e: 'nodeClick', node: GraphNode): void
}>()

const containerRef = ref<HTMLElement>()
const chartRef = ref<HTMLElement>()
const loading = ref(true)
const graphData = ref<GraphData | null>(null)
const stats = ref<GraphStats | null>(null)
let chartInstance: echarts.ECharts | null = null

const isEmpty = computed(() => {
  return !graphData.value || graphData.value.nodes.length === 0
})

// 分类颜色映射
const categoryColors: Record<string, string> = {
  '抗生素': '#f472b6',
  '降压药': '#60a5fa',
  '调脂药': '#fbbf24',
  '镇静催眠药': '#a78bfa',
  '解热镇痛药': '#f87171',
  '抗凝药': '#34d399',
  '降糖药': '#fb923c',
  '非处方药（OTC），中成药复方制剂': '#22d3d1',
  '外用驱蚊止痒产品': '#84cc16',
  '未知': '#71717a'
}

// 严重程度颜色
const severityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e'
}

const getCategoryColor = (category: string): string => {
  return categoryColors[category] || '#71717a'
}

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value, 'dark')
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  chartInstance?.resize()
}

const updateChart = () => {
  if (!chartInstance || !graphData.value) return

  const { nodes, edges } = graphData.value

  // 获取所有分类
  const categories = [...new Set(nodes.map(n => n.category))].map(cat => ({
    name: cat,
    itemStyle: { color: getCategoryColor(cat) }
  }))

  // 转换节点数据
  const chartNodes = nodes.map(node => ({
    id: node.id,
    name: node.name,
    value: node.value,
    category: categories.findIndex(c => c.name === node.category),
    symbolSize: Math.max(30, Math.min(60, node.value * 3)),
    itemStyle: {
      color: getCategoryColor(node.category),
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 2,
      shadowBlur: 10,
      shadowColor: getCategoryColor(node.category) + '40'
    },
    label: {
      show: true,
      fontSize: 11,
      color: '#e4e4e7'
    },
    // 保存原始数据用于点击事件
    rawData: node
  }))

  // 转换边数据
  const chartEdges = edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    value: edge.value,
    lineStyle: {
      color: severityColors[edge.severity] || '#71717a',
      width: edge.severity === 'high' ? 3 : edge.severity === 'medium' ? 2 : 1,
      curveness: 0.2,
      opacity: 0.7
    },
    emphasis: {
      lineStyle: {
        width: 4,
        opacity: 1
      }
    },
    rawData: edge
  }))

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 15, 20, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: '#e4e4e7',
        fontSize: 13
      },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = params.data.rawData as GraphNode
          return `
            <div style="font-weight: 600; margin-bottom: 8px; color: #fff;">${node.name}</div>
            <div style="color: #a1a1aa; font-size: 12px;">
              <div>分类: <span style="color: ${getCategoryColor(node.category)}">${node.category}</span></div>
              ${node.description ? `<div style="margin-top: 4px; max-width: 250px; line-height: 1.5;">${node.description}</div>` : ''}
            </div>
          `
        } else if (params.dataType === 'edge') {
          const edge = params.data.rawData as GraphEdge
          const severityLabel = { high: '高风险', medium: '中风险', low: '低风险' }
          return `
            <div style="font-weight: 600; margin-bottom: 8px; color: #fff;">药物相互作用</div>
            <div style="color: #a1a1aa; font-size: 12px;">
              <div>类型: ${edge.interactionType || '未知'}</div>
              <div>风险: <span style="color: ${severityColors[edge.severity]}">${severityLabel[edge.severity]}</span></div>
              ${edge.description ? `<div style="margin-top: 4px; max-width: 250px; line-height: 1.5;">${edge.description}</div>` : ''}
            </div>
          `
        }
        return ''
      }
    },
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 16,
      textStyle: {
        color: '#a1a1aa',
        fontSize: 12
      },
      pageTextStyle: {
        color: '#71717a'
      },
      data: categories.map(c => c.name)
    },
    series: [{
      type: 'graph',
      layout: 'force',
      animation: true,
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      data: chartNodes,
      links: chartEdges,
      categories: categories,
      roam: true,
      draggable: true,
      force: {
        repulsion: 300,
        gravity: 0.1,
        edgeLength: [100, 200],
        layoutAnimation: true
      },
      emphasis: {
        focus: 'adjacency',
        blurScope: 'coordinateSystem',
        lineStyle: {
          width: 4
        }
      },
      label: {
        show: true,
        position: 'bottom',
        distance: 5,
        fontSize: 11,
        color: '#e4e4e7',
        formatter: '{b}'
      },
      edgeLabel: {
        show: false
      },
      lineStyle: {
        curveness: 0.2
      }
    }]
  }

  chartInstance.setOption(option, true)

  // 绑定点击事件
  chartInstance.off('click')
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data.rawData) {
      emit('nodeClick', params.data.rawData)
    }
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const [graphResponse, statsResponse] = await Promise.all([
      graphApi.getGraphData(props.drugId),
      graphApi.getGraphStats()
    ])

    if (graphResponse.success && graphResponse.data) {
      graphData.value = graphResponse.data
    }
    if (statsResponse.success && statsResponse.data) {
      stats.value = statsResponse.data
    }

    updateChart()
  } catch (error) {
    console.error('获取图谱数据失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.drugId, () => {
  fetchData()
})

onMounted(() => {
  initChart()
  fetchData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

// 暴露刷新方法
defineExpose({
  refresh: fetchData
})
</script>


<style scoped>
.drug-graph-container {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 400px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s;
}

.chart-container.hidden {
  opacity: 0;
}

/* 加载状态 */
.graph-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(10, 10, 15, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.graph-loading span {
  color: #a1a1aa;
  font-size: 0.9rem;
}

/* 图例 */
.graph-legend {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(15, 15, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  z-index: 5;
}

.legend-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #a1a1aa;
}

.legend-line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.legend-line.high {
  background: #ef4444;
}

.legend-line.medium {
  background: #f59e0b;
}

.legend-line.low {
  background: #22c55e;
}

/* 统计信息 */
.graph-stats {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 16px;
  background: rgba(15, 15, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 20px;
  backdrop-filter: blur(10px);
  z-index: 5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.7rem;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 空状态 */
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e4e4e7;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 0.9rem;
  color: #71717a;
  margin: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .graph-legend,
  .graph-stats {
    position: static;
    margin: 8px;
    width: auto;
  }
  
  .drug-graph-container {
    display: flex;
    flex-direction: column;
  }
  
  .chart-container {
    flex: 1;
    min-height: 300px;
  }
}
</style>
