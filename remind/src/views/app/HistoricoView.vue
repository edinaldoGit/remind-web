<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '../../stores/scheduleStore'

const scheduleStore = useScheduleStore()
const activeTab = ref('logs')

const isEditLogModalOpen = ref(false)
const logForm = ref({
  id: null,
  subjectName: '',
  topic: '',
  hours: 0,
  minutes: 0,
  difficulty: 'Médio'
})
const difficulties = ['Fácil', 'Médio', 'Difícil']

const formatDuration = (totalMinutes) => {
  if (!totalMinutes) return '0m'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const handleDeleteLog = async (id) => {
  if (confirm("Deseja remover este registro do histórico permanentemente?")) {
    await scheduleStore.deleteStudyLog(id)
  }
}

const handleEditLog = (log) => {
  logForm.value = {
    id: log.id,
    subjectName: log.disciplina,
    topic: log.conteudo,
    hours: Math.floor(log.duration / 60),
    minutes: log.duration % 60,
    difficulty: log.dificuldade || 'Médio'
  }
  isEditLogModalOpen.value = true
}

const saveEditLog = async () => {
  try {
    const totalMinutes = (parseInt(logForm.value.hours) || 0) * 60 + (parseInt(logForm.value.minutes) || 0)
    
    if (totalMinutes === 0) return alert('Tempo de estudo não pode ser zero.')
    if (!logForm.value.subjectName) return alert('Selecione uma disciplina.')

    await scheduleStore.updateStudyLog(logForm.value.id, {
      subjectName: logForm.value.subjectName,
      topic: logForm.value.topic,
      duration: totalMinutes,
      difficulty: logForm.value.difficulty
    })

    isEditLogModalOpen.value = false
    alert('Estudo atualizado com sucesso!')
  } catch (error) {
    alert('Erro ao atualizar estudo.')
  }
}

const handleEditSubject = (subject) => {
  scheduleStore.openEditSubjectModal(subject)
}

const handleDeleteSubject = async (id) => {
  if (confirm("Tem certeza? Isso pode afetar estudos vinculados.")) {
    await scheduleStore.deleteSubject(id)
  }
}

const logs = computed(() => scheduleStore.historyStudies || [])

onMounted(async () => {
  const todayISO = new Date().toISOString().split('T')[0]
  await scheduleStore.loadHistory(todayISO)
  await scheduleStore.loadSubjects()
})
</script>

<template>
  <div class="management-container">
    <header class="page-header">
      <h2>Histórico e Gestão</h2>
      <p>Visualize todo o seu progresso e gerencie suas matérias.</p>
    </header>

    <div class="tabs-header">
      <button class="tab-btn" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
        <i class="bi bi-clock-history"></i> Histórico
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'subjects' }" @click="activeTab = 'subjects'">
        <i class="bi bi-bookmarks"></i> Disciplinas
      </button>
    </div>

    <div class="tab-content">
      <section v-if="activeTab === 'logs'" class="content-section slide-up">
        <div v-if="logs.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Disciplina</th>
                <th>Tópico</th>
                <th>Tempo</th>
                <th style="text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td class="col-date">
                  <i class="bi bi-calendar3"></i>
                  {{ log.date }} às {{ log.time }}
                </td>
                <td>
                  <span class="subject-badge">{{ log.disciplina }}</span>
                </td>
                <td class="col-topic">{{ log.conteudo }}</td>
                <td class="col-duration">{{ formatDuration(log.duration) }}</td>
                <td style="text-align: center;">
                  <div class="action-buttons">
                    <button class="btn-icon edit" @click="handleEditLog(log)" title="Editar Estudo">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn-icon delete" @click="handleDeleteLog(log.id)" title="Excluir Estudo">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <i class="bi bi-journal-x"></i>
          <p>Nenhum estudo registrado ainda.</p>
        </div>
      </section>

      <section v-if="activeTab === 'subjects'" class="content-section slide-up">
        <div v-if="scheduleStore.subjects.length > 0" class="subjects-grid">
          <div v-for="sub in scheduleStore.subjects" :key="sub.id" class="subject-card" :style="{ borderTopColor: sub.color }">
            <div class="card-color-dot" :style="{ background: sub.color }"></div>
            <div class="card-info">
              <h3>{{ sub.name }}</h3>
              <p>Disciplina Ativa</p>
            </div>
            <div class="card-actions">
              <button class="btn-action edit" @click="handleEditSubject(sub)" title="Editar Disciplina">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn-action delete" @click="handleDeleteSubject(sub.id)" title="Excluir Disciplina">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="bi bi-bookmarks"></i>
          <p>Nenhuma disciplina cadastrada.</p>
        </div>
      </section>
    </div>

    <div v-if="isEditLogModalOpen" class="modal-overlay" @click.self="isEditLogModalOpen = false">
      <div class="modal-card">
        <h3>Editar Estudo</h3>
        <div class="form-group">
          <label>Disciplina</label>
          <select v-model="logForm.subjectName">
             <option v-for="sub in scheduleStore.subjects" :key="sub.id" :value="sub.name">
               {{ sub.name }}
             </option>
          </select>
        </div>
        <div class="form-group">
          <label>Tópico</label>
          <input type="text" v-model="logForm.topic">
        </div>
        <div class="form-group">
          <label>Tempo (H:M)</label>
          <div class="time-row">
            <input type="number" v-model="logForm.hours" min="0"> :
            <input type="number" v-model="logForm.minutes" min="0" max="59">
          </div>
        </div>
        <div class="form-group">
          <label>Dificuldade</label>
          <select v-model="logForm.difficulty">
            <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="isEditLogModalOpen = false">Cancelar</button>
          <button class="btn-save" @click="saveEditLog">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.management-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; height: 100%; }
.page-header h2 { margin: 0; color: var(--color-blue); font-size: 1.8rem; }
.page-header p { color: #888; margin-top: 5px; }
.tab-content { flex: 1; overflow-y: auto; padding-right: 5px; }
.tabs-header { display: flex; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.tab-btn { background: none; border: none; padding: 10px 20px; font-size: 1rem; font-weight: 600; color: #888; cursor: pointer; border-radius: 8px; transition: 0.2s; display: flex; gap: 8px; align-items: center; }
.tab-btn:hover { background: #f5f5f5; color: #555; }
.tab-btn.active { background: var(--color-purple); color: white; box-shadow: 0 4px 10px rgba(132, 86, 181, 0.2); }
.table-container { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 15px; color: #888; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #eee; }
td { padding: 15px; border-bottom: 1px solid #f9f9f9; vertical-align: middle; color: #555; }
.col-date { font-weight: 600; color: #666; font-size: 0.9rem; white-space: nowrap; }
.col-duration { font-family: monospace; font-size: 1rem; color: #444; background: #eee; padding: 4px 8px; border-radius: 6px; display: inline-block; }
.subject-badge { background: #F3F4F6; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }
.action-buttons { display: flex; justify-content: center; gap: 8px; }
.btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-icon.delete { background: #FFF5F5; color: #FF4757; }
.btn-icon.delete:hover { background: #FF4757; color: white; }
.btn-icon.edit { background: #EBF8FF; color: #3182CE; }
.btn-icon.edit:hover { background: #3182CE; color: white; }
.subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.subject-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: space-between; gap: 15px; border-top: 4px solid #ccc; transition: transform 0.2s; }
.subject-card:hover { transform: translateY(-3px); }
.card-color-dot { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; opacity: 0.2; }
.card-info { flex: 1; }
.card-info h3 { margin: 0; font-size: 1.1rem; color: #444; }
.card-info p { margin: 0; font-size: 0.8rem; color: #999; }
.card-actions { display: flex; gap: 8px; }
.btn-action { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-action.delete { background: #FFF5F5; color: #FF4757; }
.btn-action.delete:hover { background: #FF4757; color: white; }
.btn-action.edit { background: #EBF8FF; color: #3182CE; }
.btn-action.edit:hover { background: #3182CE; color: white; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-card { background: white; width: 400px; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 15px; }
.modal-card h3 { margin: 0; color: var(--color-blue); }
.form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 5px; color: #555; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
.time-row { display: flex; align-items: center; gap: 10px; font-weight: bold; }
.time-row input { text-align: center; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.btn-cancel { background: #eee; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; color: #555; }
.btn-save { background: var(--color-purple); border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; color: white; }
.empty-state { text-align: center; margin-top: 50px; color: #ccc; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 10px; }
.slide-up { animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>