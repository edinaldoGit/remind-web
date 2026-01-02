<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { computed, ref } from 'vue'
// Bibliotecas Externas
import html2pdf from 'html2pdf.js'
// Stores (Model & ViewModel)
import { useDashboardStore } from '../../stores/dashboardStore'
import { useScheduleStore } from '../../stores/scheduleStore'

// ==========================================
// 2. STORES INSTANTIATION
// ==========================================
const dashboardStore = useDashboardStore() // Fornece dados processados (Gráficos, Stats)
const scheduleStore = useScheduleStore()   // Fornece dados brutos (Checagem de novo usuário)

// ==========================================
// 3. UI STATE & LOGIC
// ==========================================

/**
 * Verifica se é um usuário novo (sem logs registrados).
 * Usado para exibir o banner de boas-vindas e aplicar efeitos de blur.
 */
const isNewUser = computed(() => scheduleStore.studyLogs.length === 0)

// Estado de carregamento da geração de PDF
const isGenerating = ref(false)

// ==========================================
// 4. ACTIONS
// ==========================================

/**
 * Gera um arquivo PDF do conteúdo do Dashboard.
 * Utiliza a lib html2pdf.js para renderizar o DOM em Canvas e salvar como PDF.
 */
const generatePDF = () => {
  isGenerating.value = true
  
  // Seleciona o elemento wrapper que contém o relatório
  const element = document.getElementById('dashboard-report')
  
  // Configurações da biblioteca
  const opt = {
    margin: 10,
    filename: `Relatorio_ReMind_${new Date().toLocaleDateString()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 }, // Qualidade máxima
    html2canvas: { 
      scale: 2,       // Aumenta a resolução (evita texto borrado)
      useCORS: true,  // Permite carregar imagens externas (se houver)
      scrollY: 0      // Garante que comece do topo
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  // Executa a promessa de geração
  html2pdf().set(opt).from(element).save().then(() => {
    isGenerating.value = false
  })
}
</script>

<template>
  <div class="dashboard-content">
    
    <div id="dashboard-report" class="report-wrapper">
      
      <div v-if="isNewUser" class="onboarding-banner slide-down">
        <div class="onboarding-text">
          <h2>👋 Bem-vindo ao ReMind!</h2>
          <p>Seu painel está vazio porque você ainda não registrou nada.</p>
          <p><strong>Clique no botão "Novo Estudo" acima ↗</strong> para começar.</p>
        </div>
        <div class="arrow-indicator"><i class="bi bi-arrow-up-right"></i></div>
      </div>

      <div class="pdf-only-header" v-if="isGenerating">
        <h1>Relatório de Desempenho</h1>
        <p>Gerado em {{ new Date().toLocaleDateString() }}</p>
      </div>

      <section class="stats-grid" :class="{ 'blur-effect': isNewUser }">
        <div v-for="(stat, index) in dashboardStore.stats" :key="index" 
            class="stat-card" 
            :class="{ 'grayed-out': isNewUser }"> 
          <div class="stat-icon" :style="{ color: isNewUser ? '#ccc' : stat.color, backgroundColor: isNewUser ? '#f0f0f0' : stat.bg }">
            <i :class="`bi ${stat.icon}`"></i>
          </div>
          <div class="stat-info">
            <h3 :style="typeof stat.value === 'string' && stat.value.length > 8 ? 'font-size: 1.2rem; margin-top:5px;' : ''">
              {{ isNewUser ? 0 : stat.value }}
            </h3> 
            <span>{{ stat.title }}</span>
          </div>
        </div>
      </section>

      <section class="main-content" :class="{ 'blur-effect': isNewUser }">
        
        <div class="chart-card" :class="{ 'grayed-out': isNewUser }">
          <div class="card-header">
            <h3>Atividade Semanal</h3>
            <button class="btn-icon" data-html2canvas-ignore="true"><i class="bi bi-three-dots"></i></button>
          </div>
          <div class="chart-area">
            <div class="bar-group" v-for="item in dashboardStore.weeklyActivity" :key="item.day">
              <div class="bar" 
                :style="{ height: isNewUser ? '5%' : item.percent + '%' }" 
                :class="{ 'today': !isNewUser && item.day === 'Qua' }">
                <div class="tooltip" v-if="!isNewUser">{{ item.minutes }}m</div>
              </div>
              <span class="day-label">{{ item.day }}</span>
            </div>
          </div>
        </div>

        <div class="list-card" :class="{ 'grayed-out': isNewUser }">
          <div class="card-header">
            <h3>Próximas</h3>
          </div>
          
          <div v-if="isNewUser || dashboardStore.upcomingReviews.length === 0" class="empty-placeholder">
            <p>{{ isNewUser ? 'Seus agendamentos aparecerão aqui.' : 'Sem revisões próximas.' }}</p>
          </div>

          <ul v-else class="review-list">
            <li v-for="(task, i) in dashboardStore.upcomingReviews" :key="i" class="review-item">
              <div class="review-info">
                <strong>{{ task.subject }}</strong>
                <small>{{ task.topic }}</small>
              </div>
              <div class="review-meta">
                <span class="tag-date">{{ task.date }}</span>
                <span class="tag-type">{{ task.tag }}</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

    </div>

    <section class="export-section slide-up" v-if="!isNewUser">
      <div class="export-card">
        <div class="export-info">
          <div class="icon-pdf"><i class="bi bi-file-earmark-pdf-fill"></i></div>
          <div class="text">
            <h3>Relatório Completo</h3>
            <p>Baixe um PDF com seu histórico e métricas.</p>
          </div>
        </div>
        <button class="btn-download" @click="generatePDF" :disabled="isGenerating">
          <span v-if="!isGenerating"><i class="bi bi-download"></i> Baixar PDF</span>
          <span v-else>Gerando...</span>
        </button>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* --- LAYOUT GERAL --- */
.dashboard-content { display: flex; flex-direction: column; gap: 30px; width: 100%; max-width: 1200px; margin: 0 auto; position: relative; }
.report-wrapper { display: flex; flex-direction: column; gap: 30px; }

/* --- HEADER PDF --- */
.pdf-only-header { display: none; text-align: center; margin-bottom: 20px; }
.pdf-only-header h1 { color: var(--color-blue); margin: 0; }

/* --- ONBOARDING BANNER --- */
.onboarding-banner { 
  background: linear-gradient(135deg, #5b3a7e 0%, #3943b7 100%); color: white; 
  padding: 25px; border-radius: 20px; display: flex; justify-content: space-between; 
  align-items: center; margin-bottom: 10px; 
}
.onboarding-text h2 { margin: 0 0 10px 0; font-size: 1.5rem; }
.onboarding-text p { margin: 0; opacity: 0.9; font-size: 1rem; }
.arrow-indicator i { font-size: 3rem; animation: bounce 1.5s infinite; margin-right: 20px;}

/* --- ESTADOS DE VAZIO/NOVO USUÁRIO --- */
.grayed-out { filter: grayscale(100%); opacity: 0.6; pointer-events: none; user-select: none; }
.blur-effect { transition: all 0.5s ease; }
.empty-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-style: italic; min-height: 150px; }

/* --- STATS GRID (Cards Superiores) --- */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.stat-card { 
  background: white; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; 
  box-shadow: 0 5px 20px rgba(0,0,0,0.02); transition: transform 0.3s; border: 1px solid rgba(0,0,0,0.02); 
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.stat-info h3 { margin: 0; font-size: 1.8rem; color: var(--color-blue); }
.stat-info span { font-size: 0.9rem; color: #888; }

/* --- MAIN CONTENT (Gráfico e Lista) --- */
.main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; min-height: 300px; }
.chart-card, .list-card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.02); }

/* Headers de Cards Comuns */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header h3 { margin: 0; font-size: 1.2rem; color: var(--color-blue); }
.btn-icon { background: none; border: none; color: #999; cursor: pointer; font-size: 1.2rem; }

/* Gráfico de Barras */
.chart-area { display: flex; justify-content: space-around; align-items: flex-end; height: 200px; padding-top: 20px; }
.bar-group { display: flex; flex-direction: column; align-items: center; gap: 10px; height: 100%; justify-content: flex-end; }
.bar { width: 12px; background-color: #F0F2F5; border-radius: 20px; position: relative; transition: height 1s ease-out; }
.bar.today { background: var(--color-purple); width: 16px; box-shadow: 0 0 15px rgba(132, 86, 181, 0.4); }
.tooltip { 
  position: absolute; top: -30px; left: 50%; transform: translateX(-50%); 
  background: #333; color: white; padding: 4px 8px; border-radius: 6px; 
  font-size: 0.75rem; opacity: 0; transition: opacity 0.2s; pointer-events: none; white-space: nowrap; 
}
.bar:hover .tooltip { opacity: 1; }
.day-label { font-size: 0.8rem; color: #999; font-weight: 600; }

/* Lista de Revisões */
.review-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px; }
.review-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
.review-item:last-child { border-bottom: none; }
.review-info { display: flex; flex-direction: column; }
.review-meta { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.tag-date { font-size: 0.8rem; font-weight: bold; color: var(--color-blue); }
.tag-type { font-size: 0.7rem; background: #EAECF0; padding: 2px 8px; border-radius: 4px; color: #666; font-weight: 600; }

/* --- EXPORT SECTION --- */
.export-section { margin-top: 20px; }
.export-card { 
  background: white; border-radius: 20px; padding: 20px 30px; 
  display: flex; justify-content: space-between; align-items: center; 
  box-shadow: 0 5px 25px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; 
}
.export-info { display: flex; align-items: center; gap: 20px; }
.icon-pdf { width: 50px; height: 50px; background: #FFEBEE; color: #D32F2F; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.text h3 { margin: 0; font-size: 1.1rem; color: #333; }
.text p { margin: 5px 0 0 0; color: #888; font-size: 0.9rem; }
.btn-download { 
  background: #333; color: white; border: none; padding: 12px 25px; border-radius: 12px; 
  font-weight: 600; cursor: pointer; display: flex; gap: 10px; align-items: center; transition: 0.3s; 
}
.btn-download:hover { background: #000; transform: translateY(-2px); }
.btn-download:disabled { background: #ccc; cursor: not-allowed; }

/* --- RESPONSIVIDADE & ANIMAÇÃO --- */
@media (max-width: 900px) { 
  .main-content { grid-template-columns: 1fr; } 
  .export-card { flex-direction: column; text-align: center; gap: 20px; } 
  .export-info { flex-direction: column; } 
  .onboarding-banner { flex-direction: column; text-align: center; gap: 20px; } 
  .arrow-indicator i { transform: rotate(-45deg); } 
}
.slide-down { animation: slideDown 0.5s ease-out; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bounce { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(10px); } }
</style>