import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import LoginView from '../views/auth/LoginView.vue'
import AppLayout from '../components/layout/AppLayout.vue' 

import DashboardView from '../views/app/DashboardView.vue'
import CronogramaView from '../views/app/CronogramaView.vue'
import RevisoesView from '../views/app/RevisoesView.vue'
import HistoricoView from '../views/app/HistoricoView.vue'
import PerfilView from '../views/app/PerfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login - ReMind' }
    },
    {
      path: '/app',
      component: AppLayout,
      redirect: '/app/dashboard', 
      meta: { requiresAuth: true }, 
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Dashboard' }
        },
        {
          path: 'cronograma',
          name: 'cronograma',
          component: CronogramaView,
          meta: { title: 'Cronograma' }
        },
        {
          path: 'revisoes',
          name: 'revisoes',
          component: RevisoesView,
          meta: { title: 'Revisões' }
        },
        {
          path: 'historico',
          name: 'historico',
          component: HistoricoView,
          meta: { title: 'Histórico' }
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: PerfilView,
          meta: { title: 'Meu Perfil' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' 
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  document.title = to.meta.title ? `${to.meta.title} | ReMind` : 'ReMind'

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated()) {
      next('/') 
      return
    }
  }

  next()
})

export default router