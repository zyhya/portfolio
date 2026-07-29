import { createRouter, createWebHistory } from 'vue-router'
import { checkAdminAuth } from '../lib/api.js'

const routes = [
  {
    path: '/',
    name: 'portfolio',
    component: () => import('../views/PortfolioView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/AdminLogin.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthed = await checkAdminAuth()
    if (!isAuthed) {
      next({ name: 'admin-login' })
      return
    }
  }
  next()
})

export default router
