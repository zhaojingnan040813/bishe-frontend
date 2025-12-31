import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/conflict-detection',
      name: 'conflict-detection',
      component: () => import('@/views/ConflictDetectionView.vue')
    },
    {
      path: '/drug-graph',
      name: 'drug-graph',
      component: () => import('@/views/DrugGraphView.vue')
    },
    {
      path: '/drug-database',
      name: 'drug-database',
      component: () => import('@/views/DrugDatabaseView.vue')
    },
    {
      path: '/ai-chat',
      name: 'ai-chat',
      component: () => import('@/views/AIChatView.vue')
    }
  ]
})

export default router
