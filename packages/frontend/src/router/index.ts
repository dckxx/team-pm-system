import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/requirements',
    name: 'Requirements',
    component: () => import('@/views/Requirements.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/kanban',
    name: 'Kanban',
    component: () => import('@/views/Kanban.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('@/views/Team.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.name === 'Login' && token) {
    // Already logged in — redirect to dashboard
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresAuth && !token) {
    // Not authenticated — redirect to login
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
