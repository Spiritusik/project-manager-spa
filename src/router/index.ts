import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/ProjectView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetail',
      component: () => import('@/views/ProjectDetailView.vue')
    }
  ],
})

export default router
