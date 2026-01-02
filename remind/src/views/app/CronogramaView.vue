<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, onMounted, computed } from 'vue'
import { useScheduleStore } from '../../stores/scheduleStore'

// ==========================================
// 2. MODEL ACCESS
// ==========================================
const scheduleStore = useScheduleStore()

// ==========================================
// 3. VIEW MODEL (Estado & Lógica)
// ==========================================

// --- Estado Local ---
const weekDays = ref([])      // Array com os 7 dias da semana atual
const selectedDay = ref(null) // Objeto do dia atualmente clicado

// --- Computados de Apresentação  ---

/**
 * Define o Título do Card Principal baseado no status do dia selecionado.
 */
const headerTitle = computed(() => {
  const status = selectedDay.value?.status
  if (status === 'today') return 'Visão de Hoje'
  if (status === 'past') return 'Histórico do Dia'
  return 'Cronograma de Revisões'
})

/**
 * Define o Ícone do Header baseado no status.
 */
const headerIcon = computed(() => {
  const status = selectedDay.value?.status
  if (status === 'past') return 'bi-clock-history'
  if (status === 'today') return 'bi-calendar-check'
  return 'bi-calendar-week'
})

/**
 * Combina e Filtra a lista de atividades para o dia selecionado.
 * Junta: Revisões Agendadas + Logs de Estudo já feitos.
 */
const displayList = computed(() => {
  if (!selectedDay.value) return []
  
  const dayNum = selectedDay.value.number
  
  // 1. Logs de estudo feitos neste dia
  const logs = scheduleStore.studyLogs.filter(l => l.day === dayNum)
  
  // 2. Revisões agendadas para este dia
  const reviews = scheduleStore.futureReviews.filter(r => r.day === dayNum)
  
  // Retorna tudo junto
  return [...reviews, ...logs]
})

// --- Helpers ---

const formatDuration = (totalMinutes) => {
  if (!totalMinutes) return ''
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// ==========================================
// 4. LIFECYCLE (Inicialização)
// ==========================================
// 
onMounted(() => {
  const today = new Date()
  const currentDay = today.getDate()
  
  // Lógica Simplificada: Assume que a semana começa Segunda-feira 
  const startOfWeek = currentDay - today.getDay() + 1 
  
  const days = []
  const weekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Gera os 7 dias da semana
  for (let i = 0; i < 7; i++) {
    const dayNumber = startOfWeek + i
    
    // Verifica no Model se há atividades para pintar a "bolinha" (dot)
    const hasFutureReview = scheduleStore.futureReviews.some(r => r.day === dayNumber && r.status === 'pending')
    const hasPastLog = scheduleStore.studyLogs.some(l => l.day === dayNumber)

    // Lógica para rotacionar nomes (Segunda vira índice 1, Domingo vira 0)
    const nameIndex = i === 6 ? 0 : i + 1

    days.push({
      name: weekNames[nameIndex],
      number: dayNumber,
      isToday: dayNumber === currentDay,
      // Define se é passado, hoje ou futuro para estilização
      status: dayNumber === currentDay ? 'today' : (dayNumber < currentDay ? 'past' : 'future'),
      hasDot: hasFutureReview || (hasPastLog && dayNumber !== currentDay)
    })
  }
  
  weekDays.value = days
  
  // Seleciona o dia de hoje automaticamente ao abrir
  selectedDay.value = days.find(d => d.isToday) || days[0]
})
</script>

<template>
  <div class="schedule-container">
    
    <section class="week-calendar">
      <div 
        v-for="(day, index) in weekDays" 
        :key="index"
        class="day-pill"
        :class="{ 'active': day === selectedDay, 'today-border': day.isToday }"
        @click="selectedDay = day">
        
        <span class="day-name">{{ day.name }}</span>
        <span class="day-number">{{ day.number }}</span>
        
        <div v-if="day.hasDot" class="dot-indicator"></div>
      </div>
    </section>

    <section class="info-card fade-in">
      
      <div class="card-header centered">
        <div class="status-icon">
          <i class="bi" :class="headerIcon"></i>
        </div>
        <h3>{{ headerTitle }}</h3>
        
        <p v-if="selectedDay?.status === 'today'">
          Use o botão <strong>"+ Novo Estudo"</strong> no topo para registrar atividades.
        </p>
      </div>

      <div class="history-list">
        <div v-for="item in displayList" :key="item.id" class="history-item slide-up" 
             :class="{ 'review-item': item.type === 'review' }">
          
          <div class="time-col">
            <span v-if="!item.type" class="time-text">{{ item.time }}</span>
            <i v-else class="bi bi-arrow-repeat small-dot" title="Revisão Automática"></i>
          </div>
          
          <div class="info-col">
            <strong>{{ item.subject }}</strong>
            <span>{{ item.topic }}</span>
          </div>
          
          <div class="actions-col">
            
            <div v-if="!item.type" class="log-details">
              <span class="duration-badge">
                <i class="bi bi-hourglass-split"></i> {{ formatDuration(item.duration) }}
              </span>
              <span v-if="item.difficulty" class="badge" :class="item.difficulty.toLowerCase()">
                {{ item.difficulty }}
              </span>
            </div>

            <div v-else>
              <span v-if="item.status === 'done'" class="status-done">
                <i class="bi bi-check-circle-fill"></i> Feito
              </span>
              
              <span v-else-if="selectedDay?.status === 'past'" class="badge-missed">
                <i class="bi bi-x-circle"></i> Não Realizado
              </span>

              <span v-else class="badge-review">
                Revisão
              </span>
            </div>

            <button 
              v-if="!item.type" 
              class="btn-delete" 
              @click.stop="scheduleStore.deleteStudyLog(item.id)" 
              title="Excluir registro">
              <i class="bi bi-trash"></i>
            </button>
          </div>

        </div>

        <div v-if="displayList.length === 0" class="empty-state">
          <i class="bi bi-journal-x"></i>
          <p>Nenhuma atividade registrada ou agendada.</p>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* --- LAYOUT PRINCIPAL --- */
.schedule-container { display: flex; flex-direction: column; gap: 30px; max-width: 1200px; margin: 0 auto; height: 100%; }

/* --- CALENDÁRIO SEMANAL --- */
.week-calendar { display: flex; justify-content: space-between; background: white; padding: 20px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }

/* Pílula do Dia */
.day-pill { 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  width: 60px; height: 80px; border-radius: 30px; cursor: pointer; transition: all 0.3s; 
  position: relative; background: #F8F9FA; border: 2px solid transparent; 
}
.day-pill:hover { background: #EAECF0; }
.day-pill.today-border { border-color: var(--color-purple); }

/* Estado Ativo */
.day-pill.active { 
  background: var(--color-purple); color: white; transform: translateY(-5px); 
  box-shadow: 0 5px 15px rgba(132, 86, 181, 0.3); 
}
.day-name { font-size: 0.8rem; font-weight: 600; margin-bottom: 5px; opacity: 0.7; }
.day-pill.active .day-name { opacity: 0.9; }
.day-number { font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;}

/* Indicador de Atividade (Dot) */
.dot-indicator { width: 8px; height: 8px; background: var(--color-cyan); border-radius: 50%; position: absolute; bottom: 10px;}
.day-pill.active .dot-indicator { background: white; }

/* --- INFO CARD (Painel Inferior) --- */
.info-card { 
  background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); 
  flex: 1; display: flex; flex-direction: column; align-items: center;
}
.card-header.centered { text-align: center; margin-bottom: 30px; }
.status-icon { font-size: 3rem; color: var(--color-purple); margin-bottom: 10px; }
.card-header h3 { margin: 0; color: var(--color-blue); font-size: 1.5rem; }
.card-header p { color: #888; margin-top: 5px; }

/* --- LISTA DE HISTÓRICO --- */
.history-list { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 15px; }

.history-item { 
  display: flex; align-items: center; padding: 15px; border-radius: 12px; 
  background: #F8F9FA; border: 1px solid #eee; transition: 0.2s;
}

/* Item de Revisão (Destaque Visual) */
.history-item.review-item { background: #fff; border-left: 4px solid var(--color-cyan); }

/* Colunas da Lista */
.time-col { width: 60px; text-align: center; color: #999; font-weight: 600; font-size: 0.9rem; border-right: 1px solid #eee; margin-right: 15px; }
.small-dot { font-size: 1.2rem; color: var(--color-cyan); }

.info-col { flex: 1; display: flex; flex-direction: column; }
.info-col strong { color: var(--color-blue); font-size: 1.05rem; }
.info-col span { color: #666; font-size: 0.9rem; }

.actions-col { display: flex; align-items: center; gap: 10px; min-width: 100px; justify-content: flex-end; }
.log-details { display: flex; gap: 10px; align-items: center; }

/* --- BADGES E STATUS --- */
.badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.badge.fácil { background: rgba(39, 174, 96, 0.1); color: #27AE60; }
.badge.médio { background: rgba(242, 153, 74, 0.1); color: #F2994A; }
.badge.difícil { background: rgba(235, 87, 87, 0.1); color: #EB5757; }

.duration-badge { font-size: 0.8rem; color: #555; background: #eee; padding: 4px 10px; border-radius: 8px; display: flex; align-items: center; gap: 5px; font-weight: 600; }

.badge-review { font-size: 0.75rem; color: var(--color-cyan); font-weight: 700; background: rgba(6, 182, 212, 0.1); padding: 5px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.badge-missed { font-size: 0.75rem; color: #FF4757; font-weight: 700; background: rgba(255, 71, 87, 0.1); padding: 5px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px; }
.status-done { font-size: 0.8rem; color: #27AE60; font-weight: bold; display: flex; gap: 5px; align-items: center; }

/* Botão de Deletar */
.btn-delete { background: none; border: none; color: #ff4757; cursor: pointer; opacity: 0; transition: opacity 0.2s; padding: 5px; font-size: 1.1rem; }
.history-item:hover .btn-delete { opacity: 1; }

/* Empty State */
.empty-state { text-align: center; color: #ccc; margin-top: 40px; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 10px; }

/* Animações */
.fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.slide-up { animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* Mobile */
@media (max-width: 768px) {
  .btn-delete { opacity: 1; color: #ddd; }
  .btn-delete:hover { color: #ff4757; }
  .log-details { flex-direction: column; align-items: flex-end; gap: 5px; }
}
</style>