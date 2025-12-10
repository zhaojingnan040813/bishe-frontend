import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    }
  ]
})

export default router
