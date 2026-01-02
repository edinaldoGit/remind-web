/*
  ARQUIVO: src/router/index.js
  DESCRIÇÃO: Configuração central de rotas da aplicação.
  ESTRUTURA:
    - Rota Raiz ('/'): Login (Pública)
    - Rota App ('/app'): Layout Principal (Protegida/Privada)
      - Carrega as Views dentro do <router-view> do AppLayout.vue
*/

import { createRouter, createWebHistory } from 'vue-router'

// --- 1. IMPORTS DAS VIEWS ---
// Auth
import LoginView from '../views/auth/LoginView.vue'

// Layout
import AppLayout from '../components/layout/AppLayout.vue' 

// App Views
import DashboardView from '../views/app/DashboardView.vue'
import CronogramaView from '../views/app/CronogramaView.vue'
import RevisoesView from '../views/app/RevisoesView.vue'
import HistoricoView from '../views/app/HistoricoView.vue'
import PerfilView from '../views/app/PerfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    // ==================================================
    // 1. ROTAS PÚBLICAS (Sem Layout/Sidebar)
    // ==================================================
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login - ReMind' }
    },

    // ==================================================
    // 2. ROTAS PROTEGIDAS (Com Sidebar e Header)
    // ==================================================
    {
      path: '/app',
      component: AppLayout, // O Layout que contém o <router-view> filho
      
      // MELHORIA: Se acessar /app direto, redireciona para o dashboard
      redirect: '/app/dashboard', 
      
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

    // ==================================================
    // 3. ROTA DE CAPTURA (404)
    // ==================================================
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' // Qualquer rota inválida volta pro Login
    }
  ]
})

// --- GUARD GLOBAL (Opcional: Muda o título da aba do navegador) ---
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | ReMind` : 'ReMind'
  next()
})

export default router