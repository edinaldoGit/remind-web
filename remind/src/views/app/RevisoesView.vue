<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '../../stores/scheduleStore'

const scheduleStore = useScheduleStore()

const activeCardId = ref(null)
const timeForm = ref({ hours: 0, minutes: 30 })

const isOverdue = (isoDate) => {
  if (!isoDate) return false
  const date = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const getSubjectColor = (subjectName) => {
  const subject = scheduleStore.subjects.find(s => s.name === subjectName)
  return subject?.color || '#ccc'
}

const getReviewLabel = (date) => {
  return isOverdue(date) ? 'Atrasada' : 'Revisão'
}

const todoList = computed(() => {
  const today = new Date().toISOString().split('T')[0]

  return scheduleStore.scheduleStudies
    .filter(r => {
      if (r.status !== 'pending') return false
      if (r.date > today) return false

      if (r.createdAt) {
        const createdDate = r.createdAt.split('T')[0]
        if (createdDate === r.date) return false
      }

      return true
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const doneList = computed(() => {
  return scheduleStore.scheduleStudies
    .filter(r => r.status === 'done')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const overdueCount = computed(() =>
  todoList.value.filter(t => isOverdue(t.date)).length
)

const toggleDrawer = (task) => {
  activeCardId.value = activeCardId.value === task.id ? null : task.id
  timeForm.value = { hours: 0, minutes: 30 }
}

const confirmCompletion = async (task) => {
  const totalMinutes =
    (parseInt(timeForm.value.hours) || 0) * 60 +
    (parseInt(timeForm.value.minutes) || 0)

  if (totalMinutes === 0) {
    alert('Informe o tempo dedicado.')
    return
  }

  await scheduleStore.completeReview(task.id, totalMinutes)
  activeCardId.value = null
}

onMounted(async () => {
  await scheduleStore.loadSubjects()
  await scheduleStore.loadReviewsPanel()
})
</script>

<template>
  <div class="reviews-container">
    <header class="page-header">
      <div class="header-titles">
        <h2>Painel de Revisões</h2>
        <div class="badge-pill warning" v-if="overdueCount > 0">
          <i class="bi bi-exclamation-circle-fill"></i> {{ overdueCount }} Atrasadas
        </div>
      </div>
    </header>

    <div class="kanban-board">
      <section class="column todo-column">
        <header class="column-header">
          <div class="title-group">
            <h3>Pendentes</h3> <span class="count-badge">{{ todoList.length }}</span>
          </div>
        </header>
        <div class="task-list">
           <div v-for="task in todoList" :key="task.id" class="task-card-wrapper slide-up" :class="{ expanded: activeCardId === task.id }">
            <div class="task-card" :class="{ 'is-overdue': isOverdue(task.date) }">
              <div class="task-color-strip" :style="{ backgroundColor: getSubjectColor(task.disciplina) }"></div>
              <div class="task-content">
                <div class="task-header">
                  <span class="subject-tag" :style="{ color: getSubjectColor(task.disciplina) }">{{ task.disciplina }}</span>
                  <span class="date-tag" :class="{ overdue: isOverdue(task.date), 'd-tag': !isOverdue(task.date) }">
                    {{ getReviewLabel(task.date) }} <small>({{ task.date ? task.date.split('-').reverse().slice(0,2).join('/') : '--' }})</small>
                  </span>
                </div>
                <h4>{{ task.conteudo }}</h4>
              </div>
              <button class="check-btn" :class="{ active: activeCardId === task.id }" @click="toggleDrawer(task)">
                <i class="bi" :class="activeCardId === task.id ? 'bi-x-lg' : 'bi-check-lg'"></i>
              </button>
            </div>
            <div v-if="activeCardId === task.id" class="review-drawer">
              <div class="drawer-label">Quanto tempo levou?</div>
              <div class="drawer-inputs">
                <div class="time-group"><input type="number" v-model="timeForm.hours" min="0" /><span>h</span></div>
                <div class="time-group"><input type="number" v-model="timeForm.minutes" min="0" max="59" /><span>m</span></div>
                <button class="btn-confirm" @click="confirmCompletion(task)">Concluir <i class="bi bi-check2"></i></button>
              </div>
            </div>
          </div>
          <div v-if="todoList.length === 0" class="empty-state">
            <div class="icon-circle gold-trophy"><i class="bi bi-trophy-fill"></i></div>
            <h3>Tudo em dia!</h3><p>Você zerou suas revisões pendentes.</p>
          </div>
        </div>
      </section>

      <section class="column done-column">
        <header class="column-header">
          <div class="title-group">
            <h3>Concluídas</h3> <span class="count-badge done">{{ doneList.length }}</span>
          </div>
        </header>
        <div class="task-list">
          <transition-group name="list">
            <div v-for="task in doneList" :key="task.id" class="task-card done">
              <div class="task-color-strip" style="background:#e0e0e0"></div>
              <div class="task-content">
                <span class="subject-tag" style="color:#bbb">{{ task.disciplina }}</span>
                <h4 style="text-decoration: line-through">{{ task.conteudo }}</h4>
                <small v-if="task.tempo">Tempo: {{ task.tempo }}</small>
              </div>
              <div class="done-icon"><i class="bi bi-check2-circle"></i></div>
            </div>
          </transition-group>
          <div v-if="doneList.length === 0" class="empty-state-simple">
            <i class="bi bi-clock-history"></i><p>Histórico vazio.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.reviews-container { display: flex; flex-direction: column; height: 100%; max-width: 1200px; margin: 0 auto; gap: 20px; }
.page-header { padding: 10px 0; }
.header-titles { display: flex; align-items: center; gap: 15px; }
.page-header h2 { margin: 0; color: var(--color-blue); font-size: 1.5rem; }
.badge-pill.warning { background: rgba(255, 71, 87, 0.1); color: #FF4757; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; display: flex; gap: 5px; align-items: center; }
.kanban-board { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; flex: 1; overflow: hidden; padding-bottom: 20px; }
.column { display: flex; flex-direction: column; background: white; border-radius: 20px; padding: 0; height: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; overflow: hidden; }
.column-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 1px solid #f5f5f5; background: #fff; }
.title-group { display: flex; align-items: center; gap: 10px; }
.column-header h3 { margin: 0; color: var(--color-blue); font-size: 1.1rem; font-weight: 700; }
.count-badge { background: #F3F4F6; color: #666; padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }
.done-column .column-header h3 { color: #10B981; } 
.done-column .count-badge { background: #D1FAE5; color: #10B981; }
.task-list { flex: 1; overflow-y: auto; padding: 20px 25px; display: flex; flex-direction: column; gap: 15px; background: #fafafa; }
.task-card-wrapper { background: white; border: 1px solid #eee; border-radius: 16px; overflow: hidden; transition: all 0.3s ease; min-height: 90px; flex-shrink: 0; display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.task-card-wrapper:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); border-color: transparent; }
.task-card-wrapper.expanded { box-shadow: 0 8px 25px rgba(132, 86, 181, 0.15); border-color: var(--color-purple); transform: translateY(-3px); }
.task-card { display: flex; align-items: stretch; min-height: 90px; width: 100%; position: relative; }
.task-card.is-overdue { background: #FFF9FA; } 
.task-color-strip { width: 6px; flex-shrink: 0; }
.task-content { flex: 1; padding: 15px 20px; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
.task-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
.task-content h4 { margin: 0; font-size: 1rem; color: #333; font-weight: 600; line-height: 1.4; }
.subject-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
.date-tag { font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.date-tag.overdue { background: #FFEAEA; color: #FF4757; }
.date-tag.d-tag { background: #E0F2F1; color: #00897B; border: 1px solid #B2DFDB; }
.check-btn { width: 65px; border: none; background: transparent; cursor: pointer; color: #ddd; font-size: 1.6rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; border-left: 1px solid #f5f5f5; }
.check-btn:hover { background: #ecfdf5; color: #10B981; }
.check-btn.active { background: #FFF5F5; color: #FF4757; } 
.review-drawer { background: #fcfcfc; border-top: 1px solid #eee; padding: 15px 20px; animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-label { font-size: 0.85rem; color: #666; margin-bottom: 10px; font-weight: 600; }
.drawer-inputs { display: flex; align-items: center; gap: 10px; }
.time-group { display: flex; align-items: center; gap: 5px; }
.time-group input { width: 55px; padding: 8px; border: 1px solid #ddd; border-radius: 8px; text-align: center; font-weight: bold; color: var(--color-blue); outline: none; transition: 0.2s; }
.time-group input:focus { border-color: var(--color-purple); box-shadow: 0 0 0 3px rgba(132, 86, 181, 0.1); }
.time-group span { font-size: 0.8rem; color: #999; font-weight: bold; }
.btn-confirm { margin-left: auto; background: var(--color-purple); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-size: 0.9rem; }
.btn-confirm:hover { background: #3943B7; transform: translateY(-1px); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: 40px 20px; color: #888; }
.icon-circle.gold-trophy { width: 90px; height: 90px; background: linear-gradient(135deg, #FFF9C4 0%, #FFF3E0 100%); color: #F2994A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(242, 153, 74, 0.2); border: 4px solid #fff; }
.empty-state h3 { color: #333; margin: 0 0 5px 0; font-size: 1.2rem; font-weight: 700; }
.empty-state p { margin: 0; font-size: 0.95rem; opacity: 0.7; }
.empty-state-simple { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #bbb; gap: 10px; border: 2px dashed #eee; border-radius: 16px; }
.empty-state-simple i { font-size: 2rem; }
.empty-state-simple p { margin: 0; font-size: 0.9rem; }
.task-card.done { opacity: 0.7; background: #fff; border: 1px solid #eee; border-radius: 16px; min-height: 80px; box-shadow: none; transition: 0.2s; }
.task-card.done:hover { opacity: 1; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.done-icon { width: 60px; display: flex; align-items: center; justify-content: center; color: #10B981; font-size: 1.5rem; }
@media (max-width: 768px) { .kanban-board { grid-template-columns: 1fr; overflow-y: auto; } .column { height: auto; min-height: 350px; } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.slide-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>