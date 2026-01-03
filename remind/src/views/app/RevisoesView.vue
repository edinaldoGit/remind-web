<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '../../stores/scheduleStore'

const scheduleStore = useScheduleStore()

// ==============================
// UI STATE
// ==============================
const activeCardId = ref(null)
const timeForm = ref({ hours: 0, minutes: 30 })

// ==============================
// HELPERS
// ==============================
const isOverdue = (isoDate) => {
  const date = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const getSubjectColor = (subjectName) => {
  const subject = scheduleStore.subjects.find(s => s.name === subjectName)
  return subject?.color || '#999'
}

const getReviewLabel = (date) => {
  return isOverdue(date) ? 'Atrasada' : 'Revisão'
}

// ==============================
// LISTAS (STORE-FIRST)
// ==============================
const todoList = computed(() =>
  scheduleStore.scheduleStudies.filter(r => r.status === 'pending')
)

const doneList = computed(() =>
  scheduleStore.scheduleStudies.filter(r => r.status === 'done')
)

const overdueCount = computed(() =>
  todoList.value.filter(t => isOverdue(t.date)).length
)

// ==============================
// ACTIONS
// ==============================
const toggleDrawer = (task) => {
  activeCardId.value = activeCardId.value === task.id ? null : task.id
  timeForm.value = { hours: 0, minutes: 30 }
}

const confirmCompletion = async (task) => {
  const totalMinutes =
    (parseInt(timeForm.value.hours) || 0) * 60 +
    (parseInt(timeForm.value.minutes) || 0)

  if (!totalMinutes) {
    alert('Informe o tempo dedicado.')
    return
  }

  await scheduleStore.completeReview(task.id, totalMinutes)
  activeCardId.value = null
}

// ==============================
// LOAD
// ==============================
onMounted(async () => {
  const today = new Date().toISOString().split('T')[0]
  await scheduleStore.loadSchedule(today)
})
</script>

<template>
  <div class="reviews-container">

    <!-- HEADER -->
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

      <!-- =============================== -->
      <!-- A FAZER -->
      <!-- =============================== -->
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
            :class="{ expanded: activeCardId === task.id }"
          >
            <div
              class="task-card"
              :class="{ 'is-overdue': isOverdue(task.date) }"
            >
              <div
                class="task-color-strip"
                :style="{ backgroundColor: getSubjectColor(task.disciplina) }"
              ></div>

              <div class="task-content">
                <div class="task-header">
                  <span
                    class="subject-tag"
                    :style="{ color: getSubjectColor(task.disciplina) }"
                  >
                    {{ task.disciplina }}
                  </span>

                  <span
                    class="date-tag"
                    :class="{ overdue: isOverdue(task.date), 'd-tag': !isOverdue(task.date) }"
                  >
                    {{ getReviewLabel(task.date) }}
                  </span>
                </div>

                <h4>{{ task.conteudo }}</h4>
                <small class="tempo-info">{{ task.tempo }}</small>
              </div>

              <button
                class="check-btn"
                :class="{ active: activeCardId === task.id }"
                @click="toggleDrawer(task)"
              >
                <i
                  class="bi"
                  :class="activeCardId === task.id ? 'bi-x-lg' : 'bi-check-lg'"
                ></i>
              </button>
            </div>

            <!-- DRAWER -->
            <div v-if="activeCardId === task.id" class="review-drawer">
              <div class="drawer-label">Quanto tempo você dedicou?</div>

              <div class="drawer-inputs">
                <div class="time-group">
                  <input type="number" v-model="timeForm.hours" min="0" />
                  <span>h</span>
                </div>

                <div class="time-group">
                  <input type="number" v-model="timeForm.minutes" min="0" max="59" />
                  <span>m</span>
                </div>

                <button class="btn-confirm" @click="confirmCompletion(task)">
                  Concluir <i class="bi bi-check2"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-if="todoList.length === 0" class="empty-state">
            <div class="icon-circle">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <h3>Tudo em dia!</h3>
            <p>Nenhuma revisão pendente.</p>
          </div>
        </div>
      </section>

      <!-- =============================== -->
      <!-- CONCLUÍDAS -->
      <!-- =============================== -->
      <section class="column done-column">
        <header class="column-header">
          <div class="title-group">
            <h3>Concluídas</h3>
            <span class="count-badge done">{{ doneList.length }}</span>
          </div>
        </header>

        <div class="task-list">
          <transition-group name="list">
            <div
              v-for="task in doneList"
              :key="task.id"
              class="task-card done"
            >
              <div class="task-color-strip" style="background:#e0e0e0"></div>

              <div class="task-content">
                <span class="subject-tag" style="color:#bbb">
                  {{ task.disciplina }}
                </span>
                <h4 style="text-decoration: line-through">
                  {{ task.conteudo }}
                </h4>
                <small>{{ task.tempo }}</small>
              </div>

              <div class="done-icon">
                <i class="bi bi-check2-circle"></i>
              </div>
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