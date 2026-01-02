<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, computed } from 'vue'
import { useScheduleStore } from '../../stores/scheduleStore'

// ==========================================
// 2. MODEL ACCESS (Store)
// ==========================================
const scheduleStore = useScheduleStore()

// ==========================================
// 3. VIEW MODEL (Lógica de Tela)
// ==========================================

// --- Estado Local (UI State) ---
// Controla qual card está expandido para inserção de tempo
const activeCardId = ref(null) 
const timeForm = ref({ hours: 0, minutes: 30 })

/**
 * Helper para verificar se uma data já passou.
 * @param {string} dateStr - Data em formato ISO (YYYY-MM-DD)
 * @returns {boolean} True se a data for anterior a hoje.
 */
const isOverdue = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// --- Listas Computadas (Transformação de Dados) ---

/**
 * Lista "A Fazer":
 * Filtra apenas revisões pendentes que estão agendadas para 
 * hoje ou dias passados (atrasadas).
 */
const todoList = computed(() => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  return scheduleStore.futureReviews
    .filter(r => {
      // 1. Deve estar pendente
      if (r.status !== 'pending') return false
      
      // 2. A data deve ser Hoje ou Passado
      const reviewDate = new Date(r.fullDate + 'T00:00:00')
      return reviewDate <= today
    })
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
})

/**
 * Lista "Concluídas":
 * Apenas itens marcados como 'done', invertidos para mostrar os recentes primeiro.
 */
const doneList = computed(() => {
  return scheduleStore.futureReviews
    .filter(r => r.status === 'done')
    .reverse()
})

// Contador de itens atrasados para exibir no Badge
const overdueCount = computed(() => {
  return todoList.value.filter(t => isOverdue(t.fullDate)).length
})

// --- Helpers Visuais ---

const getSubjectColor = (subjectName) => {
  const subject = scheduleStore.subjects.find(s => s.name === subjectName)
  return subject ? subject.color : '#999'
}

const getReviewLabel = (topic, dateStr) => {
  if (isOverdue(dateStr)) return 'Atrasada'
  // Extrai o tipo de revisão do tópico (Ex: "Revisão 1: ...")
  if (topic.includes('Revisão 1')) return 'D+1'
  if (topic.includes('Revisão 2')) return 'D+7'
  if (topic.includes('Revisão 3')) return 'D+14'
  return 'Revisão'
}

// ==========================================
// 4. ACTIONS (Interações do Usuário)
// ==========================================

/**
 * Abre/Fecha a gaveta de input de tempo.
 * Reseta o formulário ao abrir um novo card.
 */
const toggleDrawer = (task) => {
  if (activeCardId.value === task.id) {
    activeCardId.value = null // Fecha
  } else {
    activeCardId.value = task.id // Abre
    timeForm.value = { hours: 0, minutes: 30 } // Reseta
  }
}

/**
 * Valida o formulário e envia para a Store processar a conclusão.
 */
const confirmCompletion = (task) => {
  const totalMinutes = (parseInt(timeForm.value.hours) || 0) * 60 + (parseInt(timeForm.value.minutes) || 0)
  
  if (totalMinutes === 0) {
    alert("Informe o tempo dedicado.")
    return
  }

  // Delega a lógica de negócio para a Store (Model)
  scheduleStore.completeReview(task.id, totalMinutes)
  
  activeCardId.value = null // Fecha gaveta
}
</script>

<template>
  <div class="reviews-container">
    
    <header class="page-header">
      <div class="header-titles">
        <h2>Painel de Revisões</h2>
        <div class="badge-pill warning" v-if="overdueCount > 0">
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ overdueCount }} Atrasadas
        </div>
      </div>
    </header>

    <div class="kanban-board">
      
      <section class="column todo-column">
        <header class="column-header">
          <div class="title-group">
            <h3>A Fazer Hoje</h3>
            <span class="count-badge">{{ todoList.length }}</span>
          </div>
        </header>

        <div class="task-list">
          <div 
            v-for="task in todoList" 
            :key="task.id" 
            class="task-card-wrapper slide-up"
            :class="{ 'expanded': activeCardId === task.id }"
          >
            <div 
              class="task-card" 
              :class="{ 'is-overdue': isOverdue(task.fullDate) }"
            >
              <div class="task-color-strip" :style="{ backgroundColor: getSubjectColor(task.subject) }"></div>
              
              <div class="task-content">
                <div class="task-header">
                  <span class="subject-tag" :style="{ color: getSubjectColor(task.subject) }">
                    {{ task.subject }}
                  </span>
                  
                  <span 
                    class="date-tag" 
                    :class="{ 'overdue': isOverdue(task.fullDate), 'd-tag': !isOverdue(task.fullDate) }">
                    {{ getReviewLabel(task.topic, task.fullDate) }}
                  </span>
                </div>
                <h4>{{ task.topic.replace(/Revisão \d+: /, '') }}</h4>
              </div>
              
              <button 
                class="check-btn" 
                :class="{ 'active': activeCardId === task.id }"
                @click="toggleDrawer(task)" 
                title="Concluir">
                <i class="bi" :class="activeCardId === task.id ? 'bi-x-lg' : 'bi-check-lg'"></i>
              </button>
            </div>

            <div v-if="activeCardId === task.id" class="review-drawer">
              <div class="drawer-label">Quanto tempo você dedicou?</div>
              
              <div class="drawer-inputs">
                <div class="time-group">
                  <input type="number" v-model="timeForm.hours" min="0" placeholder="0">
                  <span>h</span>
                </div>
                <div class="time-group">
                  <input type="number" v-model="timeForm.minutes" min="0" max="59" placeholder="30">
                  <span>m</span>
                </div>
                
                <button class="btn-confirm" @click="confirmCompletion(task)">
                  Concluir <i class="bi bi-check2"></i>
                </button>
              </div>
            </div>

          </div>

          <div v-if="todoList.length === 0" class="empty-state">
            <div class="icon-circle"><i class="bi bi-trophy-fill"></i></div>
            <h3>Tudo em dia!</h3>
            <p>Nenhuma revisão pendente para hoje.</p>
          </div>
        </div>
      </section>

      <section class="column done-column">
        <header class="column-header">
          <div class="title-group">
            <h3>Concluídas</h3>
            <span class="count-badge done">{{ doneList.length }}</span>
          </div>
        </header>

        <div class="task-list">
          <transition-group name="list">
            <div v-for="task in doneList" :key="task.id" class="task-card done">
              <div class="task-color-strip" style="background: #e0e0e0"></div>
              <div class="task-content">
                <div class="task-header">
                  <span class="subject-tag" style="color: #bbb">{{ task.subject }}</span>
                </div>
                <h4 style="color: #aaa; text-decoration: line-through;">{{ task.topic.replace(/Revisão \d+: /, '') }}</h4>
              </div>
              <div class="done-icon"><i class="bi bi-check2-circle"></i></div>
            </div>
          </transition-group>

          <div v-if="doneList.length === 0" class="empty-state-simple">
            <p>Histórico vazio.</p>
          </div>
        </div>
      </section>

    </div>

  </div>
</template>

<style scoped>
/* --- LAYOUT GERAL --- */
.reviews-container { display: flex; flex-direction: column; height: 100%; max-width: 1200px; margin: 0 auto; gap: 20px; }

/* --- HEADER --- */
.page-header { padding: 10px 0; }
.header-titles { display: flex; align-items: center; gap: 15px; }
.page-header h2 { margin: 0; color: var(--color-blue); font-size: 1.5rem; }

/* Badge de Atraso */
.badge-pill.warning { 
  background: rgba(255, 71, 87, 0.1); color: #FF4757; 
  padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; 
  display: flex; gap: 5px; align-items: center; 
}

/* --- KANBAN BOARD STRUCTURE --- */
.kanban-board { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; flex: 1; overflow: hidden; padding-bottom: 20px; }
.column { 
  display: flex; flex-direction: column; background: white; 
  border-radius: 20px; padding: 25px; height: 100%; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid #f9f9f9; 
}

/* Column Headers */
.column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; }
.title-group { display: flex; align-items: center; gap: 10px; }
.column-header h3 { margin: 0; color: var(--color-blue); font-size: 1.1rem; }
.count-badge { background: #F3F4F6; color: #666; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }

/* Done Column Specifics */
.done-column .column-header h3 { color: #10B981; } 
.done-column .count-badge { background: #D1FAE5; color: #10B981; }

.task-list { flex: 1; overflow-y: auto; padding-right: 5px; display: flex; flex-direction: column; gap: 15px; }

/* --- CARD COMPONENT --- */

/* Wrapper (Container do Card + Drawer) */
.task-card-wrapper {
  background: #F8F9FA; border: 1px solid #eee; border-radius: 12px; overflow: hidden;
  transition: all 0.2s; min-height: 90px; flex-shrink: 0;
  display: flex; flex-direction: column;
}
.task-card-wrapper:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); background: white; border-color: transparent; }
.task-card-wrapper.expanded { background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-color: var(--color-purple); transform: translateY(-3px); }

/* O Card em si */
.task-card { display: flex; align-items: stretch; height: 90px; width: 100%; }
.task-card.is-overdue { background: #FFF5F5; } 

.task-color-strip { width: 5px; flex-shrink: 0; }
.task-content { flex: 1; padding: 15px 20px; display: flex; flex-direction: column; justify-content: center; }
.task-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
.task-content h4 { margin: 0; font-size: 1rem; color: #333; font-weight: 600; line-height: 1.4; }

/* Tags dentro do Card */
.subject-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.date-tag { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.date-tag.overdue { background: rgba(255, 71, 87, 0.1); color: #FF4757; }
.date-tag.d-tag { background: #E0F2F1; color: #00897B; border: 1px solid #B2DFDB; }

/* Botão de Check/Ação */
.check-btn {
  width: 60px; border: none; background: transparent; cursor: pointer; color: #ccc;
  font-size: 1.5rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
  border-left: 1px solid #eee;
}
.check-btn:hover { background: #ecfdf5; color: #10B981; }
.check-btn.active { background: #fee; color: #FF4757; } /* Estado "Cancelar/Fechar" */

/* --- DRAWER (GAVETA DE TEMPO) --- */
.review-drawer {
  background: #fff; border-top: 1px dashed #eee; padding: 15px 20px;
  animation: slideDown 0.2s ease-out;
}
.drawer-label { font-size: 0.85rem; color: #666; margin-bottom: 10px; font-weight: 600; }
.drawer-inputs { display: flex; align-items: center; gap: 10px; }

/* Input Group */
.time-group { display: flex; align-items: center; gap: 5px; position: relative; }
.time-group input {
  width: 50px; padding: 8px; border: 1px solid #ddd; border-radius: 8px; 
  text-align: center; font-weight: bold; color: var(--color-blue);
}
.time-group span { font-size: 0.8rem; color: #999; font-weight: bold; }

.btn-confirm {
  margin-left: auto; background: var(--color-purple); color: white; border: none; 
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; 
  display: flex; align-items: center; gap: 5px; transition: 0.2s;
}
.btn-confirm:hover { background: #3943B7; }

/* --- ESTADO CONCLUÍDO (Visual Opaco) --- */
.task-card.done { opacity: 0.6; background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 12px; height: 90px; }
.done-icon { width: 60px; display: flex; align-items: center; justify-content: center; color: #10B981; font-size: 1.5rem; }

/* --- ANIMAÇÕES --- */
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- RESPONSIVIDADE --- */
@media (max-width: 768px) {
  .kanban-board { grid-template-columns: 1fr; overflow-y: auto; }
  .column { height: auto; min-height: 300px; }
}
</style>