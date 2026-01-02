<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, onMounted, onUnmounted } from 'vue'
import ImgIcone from '../../assets/img/LogoLogBrain.png' 
import ImgNome from '../../assets/img/LogoLogName.png'

// ==========================================
// 2. STATE & PROPS
// ==========================================

const isExpanded = ref(false) // Controla se a barra está aberta ou fechada
const isMobile = ref(false)   // Controla se está em modo mobile (remove o botão toggle)

// Emite evento para o layout pai ajustar a margem do conteúdo
const emit = defineEmits(['change-width'])

// ==========================================
// 3. ACTIONS & HANDLERS
// ==========================================

/**
 * Alterna o estado da sidebar (Expandido/Recolhido)
 */
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
  emit('change-width', isExpanded.value)
}

/**
 * Verifica o tamanho da tela e ajusta o comportamento da sidebar.
 * Em telas pequenas, forçamos o fechamento.
 */
const checkScreenSize = () => {
  if (window.innerWidth < 1024) {
    isMobile.value = true
    isExpanded.value = false 
  } else {
    isMobile.value = false
  }
}

// ==========================================
// 4. LIFECYCLE
// ==========================================

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <aside class="sidebar" :class="{ 'expanded': isExpanded }">
    
    <div class="sidebar-header">
      <img :src="ImgIcone" alt="Logo" class="brand-icon-img" />
      <img v-if="isExpanded" :src="ImgNome" alt="ReMind" class="brand-text-img fade-in"/>
    </div>

    <div class="separator"></div>

    <nav class="sidebar-nav">
      
      <router-link to="/app/dashboard" class="nav-item" title="Dashboard">
        <i class="bi bi-grid-1x2-fill"></i>
        <span v-if="isExpanded" class="link-text fade-in">Dashboard</span>
      </router-link>

      <router-link to="/app/cronograma" class="nav-item" title="Cronograma">
        <i class="bi bi-calendar-week"></i>
        <span v-if="isExpanded" class="link-text fade-in">Cronograma</span>
      </router-link>

      <router-link to="/app/revisoes" class="nav-item" title="Revisões">
        <i class="bi bi-check2-square"></i>
        <span v-if="isExpanded" class="link-text fade-in">Revisões</span>
      </router-link>

      <router-link to="/app/historico" class="nav-item" title="Histórico e Gestão">
        <i class="bi bi-archive"></i> 
        <span v-if="isExpanded" class="link-text fade-in">Histórico</span>
      </router-link>
      
    </nav>

    <button v-if="!isMobile" class="toggle-btn" @click="toggleSidebar">
      <i :class="isExpanded ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
    </button>

    <div class="separator"></div>

    <div class="sidebar-footer">
      
      <router-link to="/app/perfil" class="nav-item" title="Meu Perfil">
        <i class="bi bi-person-circle"></i>
        <span v-if="isExpanded" class="link-text fade-in">Meu Perfil</span>
      </router-link>

      <router-link to="/" class="nav-item logout" title="Sair">
        <i class="bi bi-box-arrow-right"></i>
        <span v-if="isExpanded" class="link-text fade-in">Sair</span>
      </router-link>
      
    </div>

  </aside>
</template>

<style scoped>
/* --- ESTRUTURA BASE DA BARRA --- */
.sidebar {
  background-color: var(--color-purple);
  height: 95vh;
  width: 140px; /* Largura recolhida */
  border-radius: 40px;
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 20px;
  position: relative;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 10px 30px rgba(132, 86, 181, 0.4);
  margin-left: 40px; align-self: center; z-index: 50;
}

.sidebar.expanded {
  width: 300px; /* Largura expandida */
  align-items: stretch; padding: 40px 15px;
}

/* --- HEADER --- */
.sidebar-header {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 15px; height: 50px; width: 100%; overflow: hidden; transition: all 0.3s;
}
.sidebar.expanded .sidebar-header { justify-content: flex-start; padding-left: 10px; }

/* Imagens do Logo */
.brand-icon-img { width: 60px; height: auto; object-fit: contain; flex-shrink: 0; filter: brightness(0) invert(1); }
.brand-text-img { height: 60px; width: auto; margin-left: 5px; object-fit: contain; filter: brightness(0) invert(1); }

/* --- SEPARADOR --- */
.separator {
  height: 1px; width: 80%; background-color: rgba(255, 255, 255, 0.2);
  margin: 10px 0 20px 0; flex-shrink: 0;
}

/* --- NAVEGAÇÃO --- */
.sidebar-nav { display: flex; flex-direction: column; gap: 15px; width: 100%; flex: 1; }

.nav-item {
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.72); text-decoration: none;
  padding: 12px 0; margin: 0 15px; border-radius: 12px;
  transition: all 0.3s; height: 50px; overflow: hidden; white-space: nowrap;
}
.sidebar.expanded .nav-item { justify-content: flex-start; padding-left: 15px; }

/* Ícones */
.nav-item i { font-size: 1.6rem; min-width: 30px; display: flex; justify-content: center; }

/* Hover e Ativo */
.nav-item:hover, .nav-item.router-link-active {
  background-color: var(--color-purpleT1); color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.link-text { margin-left: 15px; font-weight: 600; font-size: 1rem; }

/* --- FOOTER --- */
.sidebar-footer { width: 100%; display: flex; flex-direction: column; gap: 5px; }
.logout:hover { background-color: rgba(255,255,255,0.2); color: white; }

/* --- BOTÃO TOGGLE --- */
.toggle-btn {
  position: absolute; top: 50%; right: -15px; transform: translateY(-50%);
  width: 30px; height: 30px; background-color: white; color: #8456B5;
  border: none; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center; transition: transform 0.2s; z-index: 60;
}
.toggle-btn:hover { transform: translateY(-50%) scale(1.1); }

/* --- ANIMAÇÕES --- */
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
</style>