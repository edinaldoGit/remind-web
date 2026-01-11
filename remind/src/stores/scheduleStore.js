import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Repository } from '../services/repository'
import {
  registerStudyApi,
  deleteStudyApi,
  deleteStudyLogApi,
  updateStudyApi,
  markCompletedApi,
  getTodayStudies,
  getHistoryStudies,
  getScheduleStudies,
  getWeekStudies,
  getDisciplinesApi,
  createDisciplineApi,
  updateDisciplineApi,
  deleteDisciplineApi,
  getCompletedStudiesApi
} from '../services/studyService'
import { useAuthStore } from './authStore'

export const useScheduleStore = defineStore('schedule', () => {
  const authStore = useAuthStore()

  const isStudyModalOpen = ref(false)
  const modalPreFill = ref(null)
  const subjectToEdit = ref(null)

  function openStudyModal(preFillData = null) {
    modalPreFill.value = preFillData
    isStudyModalOpen.value = true
  }

  function openEditSubjectModal(subject) {
    subjectToEdit.value = { ...subject }
    isStudyModalOpen.value = true
  }

  function closeStudyModal() {
    isStudyModalOpen.value = false
    modalPreFill.value = null
    subjectToEdit.value = null
  }

  const subjects = ref([])
  const studyLogs = ref([])
  const futureReviews = ref([])
  const todayStudies = ref([])
  const historyStudies = ref([])
  const scheduleStudies = ref([])
  const weekStudies = ref([])

  function resolveUserId() {
    let uid = authStore.user?.id || authStore.user?._id || authStore.user?.uid || authStore.user?.email
    if (!uid) {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        uid = parsed.id || parsed._id || parsed.uid || parsed.email
      }
    }
    if (!uid) throw new Error('Usuário não autenticado.')
    return uid
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0]
  }

  async function loadData() {
    try {
      await loadSubjects()
      studyLogs.value = await Repository.getStudyLogs() || []
      futureReviews.value = await Repository.getReviews() || []
    } catch (error) {}
  }

  loadData()

  async function loadSubjects() {
    try {
      const userId = resolveUserId()
      const data = await getDisciplinesApi(userId)
      const lista = Array.isArray(data) ? data : (data.disciplinas || [])
      subjects.value = lista.map(d => ({
        id: d.id || d._id || d.discipline_id,
        name: d.nome,
        color: d.cor
      }))
    } catch (error) {}
  }

  async function createSubject(name, color) {
    try {
      const userId = resolveUserId()
      await createDisciplineApi(userId, name, color)
      await loadSubjects()
    } catch (error) {
      throw error
    }
  }

  async function updateSubject(id, name, color) {
    try {
      await updateDisciplineApi(id, name, color)
      await loadSubjects()
      subjectToEdit.value = null
    } catch (error) {
      throw error
    }
  }

  async function deleteSubject(id) {
    try {
      await deleteDisciplineApi(id)
      subjects.value = subjects.value.filter(s => s.id !== id)
    } catch (error) {
      throw error
    }
  }

  async function loadToday() {
    try {
      const userId = resolveUserId()
      const response = await getTodayStudies(userId)
      let lista = response.studies || []
      lista = lista.filter(item => !item.user_id || String(item.user_id) === String(userId))
      todayStudies.value = lista.map(item => ({
        id: item._id,
        subject: item.disciplina,
        topic: item.conteudo,
        difficulty: item.dificuldade,
        duration: (item.tempo_horas * 60) + item.tempo_minutos,
        time: new Date(item.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: item.conteudo.toLowerCase().includes('revisão') ? 'review' : undefined
      }))
    } catch (e) {}
  }

  async function loadHistory(date) {
    try {
      const userId = resolveUserId()
      const response = await getHistoryStudies(userId, date)
      let lista = Array.isArray(response) ? response : (response.studies || [])
      lista = lista.filter(item => !item.user_id || String(item.user_id) === String(userId))
      historyStudies.value = lista.map(item => ({
        id: item._id,
        date: new Date(item.criado_em).toLocaleDateString('pt-BR'),
        time: new Date(item.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disciplina: item.disciplina,
        conteudo: item.conteudo,
        duration: (item.tempo_horas * 60) + item.tempo_minutos,
        dificuldade: item.dificuldade
      }))
    } catch (e) {}
  }

  async function loadSchedule(date) {
    try {
      const userId = resolveUserId()
      const response = await getScheduleStudies(userId, date)
      let lista = response.revisions || response.schedule || response || []
      if (!Array.isArray(lista)) lista = []
      lista = lista.filter(item => !item.user_id || String(item.user_id) === String(userId))
      scheduleStudies.value = lista.map(r => ({
        id: r._id || r.id,
        date: r.data_revisao ? r.data_revisao.split('T')[0] : date,
        time: r.data_revisao ? new Date(r.data_revisao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
        disciplina: r.disciplina || 'Sem disciplina',
        conteudo: r.conteudo || 'Sem conteúdo',
        dificuldade: r.dificuldade || 'Médio',
        tempo: r.tempo_dedicado,
        status: r.realizada ? 'done' : 'pending'
      }))
    } catch (e) {}
  }

  async function loadWeek() {
    try {
      const userId = resolveUserId()
      weekStudies.value = await getWeekStudies(userId)
    } catch (e) {}
  }

  async function loadReviewsPanel() {
    try {
      const userId = resolveUserId()
      const [todayData, completedData] = await Promise.all([
        getTodayStudies(userId).catch(() => []), 
        getCompletedStudiesApi(userId).catch(() => []) 
      ])
      const rawPending = Array.isArray(todayData) ? todayData : (todayData.studies || [])
      const pendingMapped = rawPending.map(item => ({
        id: item._id || item.id || item.revision_id,
        disciplina: item.disciplina || 'Sem Nome',
        conteudo: item.conteudo || 'Revisão',
        date: item.data_revisao || new Date().toISOString().split('T')[0],
        createdAt: item.criado_em || item.created_at || new Date().toISOString(), 
        status: 'pending'
      }))
      const rawDone = Array.isArray(completedData) ? completedData : (completedData.completed || [])
      const doneMapped = rawDone.map(item => ({
        id: item._id || item.id || item.revision_id,
        disciplina: item.disciplina || 'Sem Nome',
        conteudo: item.conteudo || 'Revisão',
        date: item.data_revisao || item.data_conclusao,
        tempo: item.tempo_dedicado,
        status: 'done'
      }))
      scheduleStudies.value = [...pendingMapped, ...doneMapped]
    } catch (error) {}
  }

  async function registerStudy(payload) {
    const today = new Date()
    const newLog = {
      id: Date.now(),
      subject: payload.subjectName,
      topic: payload.topic,
      difficulty: payload.difficulty,
      duration: Number(payload.duration),
      time: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: today.getDate(),
      fullDate: today.toISOString()
    }
    studyLogs.value.unshift(newLog)
    try {
      const userId = resolveUserId()
      const totalMinutes = Number(payload.duration)
      await registerStudyApi({
        userId,
        disciplina: payload.subjectName,
        conteudo: payload.topic,
        horas: Math.floor(totalMinutes / 60),
        minutos: totalMinutes % 60,
        dificuldade: payload.difficulty
      })
      await loadToday()
      await loadWeek()
      await loadSchedule(todayISO())
    } catch (error) {
      studyLogs.value.shift()
      throw error
    }
  }

  async function deleteStudyLog(id) {
    try {
      await deleteStudyLogApi(id)
      studyLogs.value = studyLogs.value.filter(l => l.id !== id)
      historyStudies.value = historyStudies.value.filter(h => h.id !== id)
      todayStudies.value = todayStudies.value.filter(t => t.id !== id)
      loadWeek()
    } catch (error) {
      alert('Erro ao excluir estudo.')
    }
  }

  async function updateStudyLog(id, payload) {
    try {
      const totalMinutes = Number(payload.duration)
      const horas = Math.floor(totalMinutes / 60)
      const minutos = totalMinutes % 60
      await updateStudyApi(id, {
        disciplina: payload.subjectName,
        conteudo: payload.topic,
        dificuldade: payload.difficulty,
        horas: horas,
        minutos: minutos
      })
      const todayISO = new Date().toISOString().split('T')[0]
      await loadHistory(todayISO)
      await loadToday()
    } catch (error) {
      throw error
    }
  }

  async function completeReview(reviewId, durationInMinutes = 30) {
    try {
      const tempoString = String(durationInMinutes)
      await markCompletedApi(reviewId, tempoString) 
      const taskIndex = scheduleStudies.value.findIndex(t => t.id === reviewId)
      if (taskIndex !== -1) {
        scheduleStudies.value[taskIndex].status = 'done'
        scheduleStudies.value[taskIndex].tempo = `${durationInMinutes} min`
      }
      await loadReviewsPanel()
      await loadToday() 
    } catch (error) {
      alert('Erro ao salvar conclusão.')
    }
  }

  watch(studyLogs, val => Repository.saveStudyLogs(JSON.parse(JSON.stringify(val))), { deep: true })
  watch(futureReviews, val => Repository.saveReviews(JSON.parse(JSON.stringify(val))), { deep: true })

  return {
    isStudyModalOpen,
    modalPreFill,
    subjectToEdit,
    subjects,
    studyLogs,
    futureReviews,
    todayStudies,
    historyStudies,
    scheduleStudies,
    weekStudies,
    openStudyModal,
    openEditSubjectModal, 
    closeStudyModal,
    registerStudy,
    deleteStudyLog, 
    updateStudyLog, 
    completeReview,
    createSubject,
    updateSubject,
    deleteSubject,
    loadData,
    loadSubjects,
    loadToday,
    loadHistory,
    loadSchedule,
    loadWeek,
    loadReviewsPanel
  }
})