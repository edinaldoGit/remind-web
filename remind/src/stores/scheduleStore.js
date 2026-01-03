import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Repository } from '../services/repository'
import { registerStudyApi } from '../services/studyService'
import { useAuthStore } from './authStore'

export const useScheduleStore = defineStore('schedule', () => {

  // =========================================================
  // AUTH STORE (fonte primária)
  // =========================================================
  const authStore = useAuthStore()

  // =========================================================
  // UI CONTROL
  // =========================================================
  const isStudyModalOpen = ref(false)
  const modalPreFill = ref(null)

  function openStudyModal(preFillData = null) {
    modalPreFill.value = preFillData
    isStudyModalOpen.value = true
  }

  function closeStudyModal() {
    isStudyModalOpen.value = false
    modalPreFill.value = null
  }

  // =========================================================
  // DADOS
  // =========================================================
  const subjects = ref([])
  const studyLogs = ref([])
  const futureReviews = ref([])

  // =========================================================
  // LOAD INICIAL
  // =========================================================
  async function loadData() {
    try {
      subjects.value = await Repository.getSubjects() || []
      studyLogs.value = await Repository.getStudyLogs() || []
      futureReviews.value = await Repository.getReviews() || []
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  loadData()

  // =========================================================
  // PERSISTÊNCIA LOCAL
  // =========================================================
  watch(subjects, val =>
    Repository.saveSubjects(JSON.parse(JSON.stringify(val))),
    { deep: true }
  )

  watch(studyLogs, val =>
    Repository.saveStudyLogs(JSON.parse(JSON.stringify(val))),
    { deep: true }
  )

  watch(futureReviews, val =>
    Repository.saveReviews(JSON.parse(JSON.stringify(val))),
    { deep: true }
  )

  // =========================================================
  // AÇÕES
  // =========================================================
  async function registerStudy(payload) {
    const today = new Date()

    // -----------------------------
    // UI OTIMISTA
    // -----------------------------
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

    // -----------------------------
    // RESOLUÇÃO SEGURA DO USER_ID
    // -----------------------------
    let userId = authStore.user?.id

    // 🔐 Fallback do estado persistido do Pinia
    if (!userId) {
      const persisted = localStorage.getItem('auth')
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted)
          userId = parsed?.user?.id
        } catch (_) {}
      }
    }

    // ❌ FAIL-FAST REAL
    if (!userId) {
      console.error('ERRO CRÍTICO: user_id não disponível')
      console.log('authStore.user:', authStore.user)
      throw new Error('Usuário não autenticado')
    }

    // -----------------------------
    // BACKEND REAL
    // -----------------------------
    try {
      const horas = Math.floor(payload.duration / 60)
      const minutos = payload.duration % 60

      await registerStudyApi({
        userId,
        disciplina: payload.subjectName,
        conteudo: payload.topic,
        horas,
        minutos,
        dificuldade: payload.difficulty.toLowerCase()
      })
    } catch (error) {
      console.error('Erro ao registrar estudo no backend', error)
    }

    // -----------------------------
    // LÓGICA DE REVISÃO (SRS)
    // -----------------------------
    if (payload.originId) {
      const reviewIndex = futureReviews.value.findIndex(
        r => r.id === payload.originId
      )

      if (reviewIndex !== -1) {
        futureReviews.value[reviewIndex].status = 'done'
        futureReviews.value[reviewIndex].completedAt = new Date().toISOString()
      }
    } else {
      const intervals = [1, 7, 14]

      intervals.forEach((daysToAdd, index) => {
        const futureDate = new Date(today)
        futureDate.setDate(today.getDate() + daysToAdd)

        futureReviews.value.push({
          id: Date.now() + index + 100,
          originLogId: newLog.id,
          subject: payload.subjectName,
          topic: `Revisão ${index + 1}: ${payload.topic}`,
          day: futureDate.getDate(),
          fullDate: futureDate.toISOString().split('T')[0],
          status: 'pending',
          type: 'review'
        })
      })
    }
  }

  function addSubject(name, color) {
    subjects.value.push({
      id: Date.now(),
      name,
      color: color || '#333'
    })
  }

  function deleteSubject(id) {
    const subject = subjects.value.find(s => s.id === id)
    subjects.value = subjects.value.filter(s => s.id !== id)

    if (subject) {
      futureReviews.value = futureReviews.value.filter(
        r => r.subject !== subject.name
      )
    }
  }

  function deleteStudyLog(id) {
    studyLogs.value = studyLogs.value.filter(l => l.id !== id)
  }

  function completeReview(reviewId, durationInMinutes = 30) {
    const review = futureReviews.value.find(r => r.id === reviewId)

    if (!review) return

    review.status = 'done'
    review.completedAt = new Date().toISOString()

    registerStudy({
      subjectName: review.subject,
      topic: review.topic,
      duration: durationInMinutes,
      difficulty: 'Médio',
      originId: reviewId
    })
  }

  return {
    subjects,
    studyLogs,
    futureReviews,
    isStudyModalOpen,
    modalPreFill,
    openStudyModal,
    closeStudyModal,
    registerStudy,
    completeReview,
    addSubject,
    deleteSubject,
    deleteStudyLog,
    loadData
  }
})
