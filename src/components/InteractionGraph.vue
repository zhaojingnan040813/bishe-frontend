<template>
  <div class="interaction-graph-container" ref="containerRef">
    <!-- 图谱容器 -->
    <div ref="chartRef" class="chart-container"></div>

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

    <!-- 空状态 -->
    <div v-if="isEmpty" class="empty-state">
      <div class="empty-icon">✅</div>
      <h4>无相互作用关系</h4>
      <p>所选药物之间暂未发现相互作用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { Drug, Interaction } from '@/types'

interface Props {
  drugs: Drug[]
  interactions: Interaction[]
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px'
})

const emit = defineEmits<{
  (e: 'nodeClick', drug: Drug): void
}>()

const containerRef = ref<HTMLElement>()
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const isEmpty = computed(() => {
  return props.drugs.length === 0
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
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  chartInstance?.resize()
}

const updateChart = () => {
  if (!chartInstance || props.drugs.length === 0) return

  // 获取所有分类
  const categories = [...new Set(props.drugs.map(d => d.category))].map(cat => ({
    name: cat,
    itemStyle: { color: getCategoryColor(cat) }
  }))

  // 转换节点数据 - 使用选中的药物
  const chartNodes = props.drugs.map(drug => ({
    id: drug._id,
    name: drug.name,
    value: 10,
    category: categories.findIndex(c => c.name === drug.category),
    symbolSize: 50,
    itemStyle: {
      color: getCategoryColor(drug.category),
      borderColor: 'rgba(255,255,255,0.3)',
      borderWidth: 3,
      shadowBlur: 15,
      shadowColor: getCategoryColor(drug.category) + '60'
    },
    label: {
      show: true,
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff'
    },
    rawData: drug
  }))

  // 转换边数据 - 使用检测到的相互作用
  const chartEdges = props.interactions.map(interaction => ({
    source: interaction.drug1Id,
    target: interaction.drug2Id,
    value: interaction.severity === 'high' ? 3 : interaction.severity === 'medium' ? 2 : 1,
    lineStyle: {
      color: severityColors[interaction.severity] || '#71717a',
      width: interaction.severity === 'high' ? 4 : interaction.severity === 'medium' ? 3 : 2,
      curveness: 0.2,
      opacity: 0.8
    },
    emphasis: {
      lineStyle: {
        width: 6,
        opacity: 1
      }
    },
    rawData: interaction
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
          const drug = params.data.rawData as Drug
          return `
            <div style="font-weight: 600; margin-bottom: 8px; color: #fff;">${drug.name}</div>
            <div style="color: #a1a1aa; font-size: 12px;">
              <div>分类: <span style="color: ${getCategoryColor(drug.category)}">${drug.category}</span></div>
              ${drug.genericName ? `<div>通用名: ${drug.genericName}</div>` : ''}
            </div>
          `
        } else if (params.dataType === 'edge') {
          const interaction = params.data.rawData as Interaction
          const severityLabel = { high: '高风险', medium: '中风险', low: '低风险' }
          return `
            <div style="font-weight: 600; margin-bottom: 8px; color: #fff;">${interaction.drug1Name} ↔ ${interaction.drug2Name}</div>
            <div style="color: #a1a1aa; font-size: 12px;">
              <div>类型: ${interaction.interactionType}</div>
              <div>风险: <span style="color: ${severityColors[interaction.severity]}">${severityLabel[interaction.severity]}</span></div>
              <div style="margin-top: 4px; max-width: 280px; line-height: 1.5;">${interaction.description}</div>
            </div>
          `
        }
        return ''
      }
    },
    legend: {
      show: categories.length > 1,
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
      data: categories.map(c => c.name)
    },
    series: [{
      type: 'graph',
      layout: 'force',
      animation: true,
      animationDuration: 1200,
      animationEasingUpdate: 'quinticInOut',
      data: chartNodes,
      links: chartEdges,
      categories: categories,
      roam: true,
      draggable: true,
      force: {
        repulsion: 400,
        gravity: 0.15,
        edgeLength: [120, 180],
        layoutAnimation: true
      },
      emphasis: {
        focus: 'adjacency',
        blurScope: 'coordinateSystem',
        lineStyle: {
          width: 6
        }
      },
      label: {
        show: true,
        position: 'bottom',
        distance: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
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

// 监听数据变化
watch([() => props.drugs, () => props.interactions], () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

onMounted(() => {
  initChart()
  if (props.drugs.length > 0) {
    updateChart()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

defineExpose({
  refresh: updateChart
})
</script>


<style scoped>
.interaction-graph-container {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 350px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
}

/* 图例 */
.graph-legend {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(15, 15, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  backdrop-filter: blur(10px);
  z-index: 5;
}

.legend-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #a1a1aa;
}

.legend-line {
  width: 16px;
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
  background: rgba(10, 10, 15, 0.5);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.7;
}

.empty-state h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #22c55e;
  margin: 0 0 0.25rem;
}

.empty-state p {
  font-size: 0.85rem;
  color: #71717a;
  margin: 0;
}
</style>
