<script setup>
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '../../stores/dashboardStore'

const dashboardStore = useDashboardStore() 

const isNewUser = computed(() => {
  if (dashboardStore.isLoading) return false
  const rawValue = dashboardStore.stats[2].value
  const textValue = String(rawValue).trim().toLowerCase()
  return ['0h', '0m', '0', '0s', '0h 0m', '00:00', ''].includes(textValue)
})

onMounted(async () => {
  await dashboardStore.loadDashboardData()
})
</script>

<template>
  <div class="dashboard-content">
    <div class="report-wrapper">
      <div v-if="isNewUser" class="onboarding-banner slide-down">
        <div class="onboarding-text">
          <h2>👋 Bem-vindo ao ReMind!</h2>
          <p>Seu painel está vazio porque você ainda não registrou nada.</p>
          <p><strong>Clique no botão "Novo Estudo" acima ↗</strong> para começar.</p>
        </div>
        <div class="arrow-indicator"><i class="bi bi-arrow-up-right"></i></div>
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
            <button class="btn-icon"><i class="bi bi-three-dots"></i></button>
          </div>
          <div class="chart-area">
            <div class="bar-group" v-for="item in dashboardStore.weeklyActivity" :key="item.day">
              <div class="bar" 
                :style="{ height: isNewUser ? '5%' : (item.percent || 10) + '%' }" 
                :class="{ 'today': !isNewUser && item.isToday }">
                <div class="tooltip" v-if="!isNewUser">{{ item.value }}h</div>
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
            <li v-for="(task, i) in dashboardStore.upcomingReviews" :key="task.id" class="review-item">
              <div class="review-info">
                <strong>{{ task.subject }}</strong>
                <small>{{ task.topic }}</small>
              </div>
              <div class="review-meta">
                <span class="tag-date">{{ task.date }}</span>
                <span class="tag-status" :class="task.status">
                  {{ task.status === 'done' ? 'Feita' : 'Pendente' }}
                </span>
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
        <button class="btn-download" @click="dashboardStore.downloadReport" :disabled="dashboardStore.isGeneratingReport">
          <span v-if="!dashboardStore.isGeneratingReport"><i class="bi bi-download"></i> Baixar PDF</span>
          <span v-else>Gerando...</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-content { display: flex; flex-direction: column; gap: 30px; width: 100%; max-width: 1200px; margin: 0 auto; }
.report-wrapper { display: flex; flex-direction: column; gap: 30px; }
.onboarding-banner { background: linear-gradient(135deg, #5b3a7e 0%, #3943b7 100%); color: white; padding: 25px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.onboarding-text h2 { margin: 0 0 10px 0; font-size: 1.5rem; }
.arrow-indicator i { font-size: 3rem; animation: bounce 1.5s infinite; margin-right: 20px;}
.grayed-out { filter: grayscale(100%); opacity: 0.6; pointer-events: none; user-select: none; }
.blur-effect { transition: all 0.5s ease; }
.empty-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-style: italic; min-height: 150px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.stat-card { background: white; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.02); }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.stat-info h3 { margin: 0; font-size: 1.8rem; color: var(--color-blue); }
.main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; min-height: 300px; }
.chart-card, .list-card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.02); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header h3 { margin: 0; font-size: 1.2rem; color: var(--color-blue); }
.btn-icon { background: none; border: none; color: #999; cursor: pointer; font-size: 1.2rem; }
.chart-area { display: flex; justify-content: space-around; align-items: flex-end; height: 200px; padding-top: 30px; }
.bar-group { display: flex; flex-direction: column; align-items: center; gap: 10px; height: 100%; justify-content: flex-end; position: relative; }
.bar { width: 14px; background-color: #F0F2F5; border-radius: 20px; position: relative; transition: height 1s ease-out, background 0.3s; }
.bar.today { background: var(--color-purple); width: 18px; box-shadow: 0 0 15px rgba(132, 86, 181, 0.4); }
.tooltip { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; opacity: 0; transition: opacity 0.2s; pointer-events: none; white-space: nowrap; font-weight: bold; }
.bar:hover .tooltip, .bar.today .tooltip { opacity: 1; }
.bar.today .tooltip { background: var(--color-purple); }
.day-label { font-size: 0.8rem; color: #999; font-weight: 600; }
.review-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px; }
.review-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0; }
.review-item:last-child { border-bottom: none; }
.review-info { display: flex; flex-direction: column; }
.review-meta { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.tag-date { font-size: 0.8rem; font-weight: bold; color: var(--color-blue); }
.tag-status.pending { color: #F2994A; font-size: 0.75rem; font-weight: bold; }
.tag-status.done { color: #27AE60; font-size: 0.75rem; font-weight: bold; }
.export-section { margin-top: 20px; }
.export-card { background: white; border-radius: 20px; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 5px 25px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; }
.export-info { display: flex; align-items: center; gap: 20px; }
.icon-pdf { width: 50px; height: 50px; background: #FFEBEE; color: #D32F2F; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.text h3 { margin: 0; font-size: 1.1rem; color: #333; }
.text p { margin: 5px 0 0 0; color: #888; font-size: 0.9rem; }
.btn-download { background: #333; color: white; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; gap: 10px; align-items: center; transition: 0.3s; }
.btn-download:hover { background: #000; transform: translateY(-2px); }
@media (max-width: 900px) { .main-content { grid-template-columns: 1fr; } .export-card { flex-direction: column; text-align: center; gap: 20px; } .export-info { flex-direction: column; } .onboarding-banner { flex-direction: column; text-align: center; gap: 20px; } .arrow-indicator i { transform: rotate(-45deg); } }
.slide-down { animation: slideDown 0.5s ease-out; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bounce { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(10px); } }
</style>