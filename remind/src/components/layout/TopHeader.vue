<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { useScheduleStore } from '../../stores/scheduleStore'

// ==========================================
// 2. MODEL ACCESS
// ==========================================
const userStore = useUserStore()
const scheduleStore = useScheduleStore()

// ==========================================
// 3. VIEW MODEL (Estado & Lógica de UI)
// ==========================================

const currentDate = ref("")
const searchQuery = ref("")

// Transforma o estado bruto do Model em regra visual (Animação de pulso para novos usuários)
const isNewUser = computed(() => scheduleStore.studyLogs.length === 0)

// --- Helpers ---

/**
 * Retorna a data atual formatada por extenso em Português.
 * Exemplo: "Sexta-feira, 27 de dezembro"
 */
const getFormattedDate = () => {
  const date = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  
  // Usa API nativa do browser para formatação internacional
  let dateString = new Intl.DateTimeFormat('pt-BR', options).format(date)
  
  // Capitaliza a primeira letra (Ex: "sexta" -> "Sexta")
  return dateString.charAt(0).toUpperCase() + dateString.slice(1)
}

// ==========================================
// 4. LIFECYCLE
// ==========================================
onMounted(() => {
  currentDate.value = getFormattedDate()
})
</script>

<template>
  <header class="top-header">
    <div class="header-content">
      
      <div class="intro-section">
        <div class="welcome-text">
          <h1>Olá, {{ userStore.user.name }}</h1>
          <p>{{ currentDate }}</p>
        </div>
        
        <div class="profile-area">
          <div class="notification-dot"></div>
          <img :src="userStore.user.avatar" alt="Perfil" class="profile-pic"/>
        </div>
      </div>

      <div class="search-bar">
        <i class="bi bi-search"></i>
        <input type="text" v-model="searchQuery" placeholder="Buscar no ReMind...">
      </div>

      <div class="header-actions">
        <button 
          class="btn-new-study" 
          :class="{ 'pulse-animation': isNewUser }" 
          @click="scheduleStore.openStudyModal()"
        >
          <i class="bi bi-plus-lg"></i>
          <span>Novo Estudo</span>
        </button>
      </div>

    </div>
  </header>
</template>

<style scoped>
/* --- LAYOUT GERAL --- */
.top-header { 
  width: 100%; background-color: #EAECF0; padding: 20px 40px; 
  padding-bottom: 0; flex-shrink: 0; 
}

.header-content { 
  max-width: 1200px; width: 100%; margin: 0 auto; 
  display: flex; justify-content: space-between; align-items: center; gap: 20px; 
}

/* --- PERFIL & SAUDAÇÃO --- */
.intro-section { display: flex; align-items: center; gap: 15px; }
.welcome-text h1 { margin: 0; font-size: 1.6rem; color: var(--color-blue); }
.welcome-text p { margin: 0; color: #667085; font-size: 0.85rem; margin-top: 2px; }

.profile-area { position: relative; cursor: pointer; }
.profile-pic { 
  width: 50px; height: 50px; border-radius: 50%; object-fit: cover; 
  border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
}
.notification-dot { 
  position: absolute; top: 0; right: 0; width: 12px; height: 12px; 
  background: #FF4757; border: 2px solid #EAECF0; border-radius: 50%; 
}

/* --- BARRA DE BUSCA --- */
.search-bar { 
  flex: 1; max-width: 450px; background: white; display: flex; align-items: center; 
  padding: 10px 20px; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
  border: 1px solid transparent; transition: all 0.3s; 
}
.search-bar:focus-within { 
  border-color: var(--color-purple); box-shadow: 0 4px 15px rgba(132, 86, 181, 0.15); 
}
.search-bar i { color: #999; margin-right: 10px; }
.search-bar input { 
  border: none; outline: none; width: 100%; color: var(--color-blue); 
  font-size: 0.95rem; background: transparent; 
}

/* --- BOTÕES & AÇÕES --- */
.header-actions { display: flex; align-items: center; }

.btn-new-study {
  background: linear-gradient(135deg,#8456B5 0%, #0098e4 100%);  color: white; 
  border: none; padding: 15px 25px; border-radius: 12px; 
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  font-weight: 700; transition: transform 0.2s; white-space: nowrap;
  position: relative; overflow: hidden; 
}
.btn-new-study:hover { transform: translateY(-3px);}

/* --- ANIMAÇÕES --- */
.pulse-animation {
  animation: pulse-blue 2s infinite;
  box-shadow: 0 0 0 0 rgba(57, 67, 183, 0.7);
}

@keyframes pulse-blue {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(57, 67, 183, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(57, 67, 183, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(57, 67, 183, 0); }
}

/* --- RESPONSIVIDADE --- */
@media (max-width: 900px) {
  .header-content { flex-direction: column; align-items: flex-start; gap: 15px; }
  .intro-section { width: 100%; justify-content: space-between; }
  .search-bar { width: 100%; max-width: 100%; }
  .header-actions { width: 100%; display: flex; justify-content: flex-end; }
}
</style>