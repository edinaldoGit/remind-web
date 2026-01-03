import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Repository } from '../services/repository'
import {
  registerStudyApi,
  getTodayStudies,
  getHistoryStudies,
  getScheduleStudies,
  getWeekStudies
} from '../services/studyService'
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
  // DADOS LOCAIS (UI / SRS / OFFLINE)
  // =========================================================
  const subjects = ref([])
  const studyLogs = ref([])
  const futureReviews = ref([])

  // =========================================================
  // DADOS BACKEND (FONTE DA VERDADE)
  // =========================================================
  const todayStudies = ref([])
  const historyStudies = ref([])
  const scheduleStudies = ref([])
  const weekStudies = ref([])

  // =========================================================
  // LOAD LOCAL (Repository)
  // =========================================================
  async function loadData() {
    try {
      subjects.value = await Repository.getSubjects() || []
      studyLogs.value = await Repository.getStudyLogs() || []
      futureReviews.value = await Repository.getReviews() || []
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error)
    }
  }

  loadData()

  // =========================================================
  // HELPERS
  // =========================================================
  function resolveUserId() {
    let userId = authStore.user?.id

    if (!userId) {
      const persisted = localStorage.getItem('auth')
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted)
          userId = parsed?.user?.id
        } catch (_) {}
      }
    }

    if (!userId) {
      console.error('ERRO CRÍTICO: user_id não disponível')
      throw new Error('Usuário não autenticado')
    }

    return userId
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0]
  }

  // =========================================================
  // INTEGRAÇÕES BACKEND (READ)
  // =========================================================
  async function loadToday() {
  try {
    const userId = resolveUserId()
    const response = await getTodayStudies(userId)

    todayStudies.value = response.studies.map(item => {
      const createdAt = new Date(item.criado_em)

      return {
        id: item._id,
        subject: item.disciplina,
        topic: item.conteudo,
        difficulty: item.dificuldade,
        duration: (item.tempo_horas * 60) + item.tempo_minutos,
        time: createdAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: item.conteudo.toLowerCase().includes('revisão')
          ? 'review'
          : undefined
      }
    })
  } catch (e) {
    console.error('Erro ao carregar visão de hoje', e)
  }
}


  async function loadHistory(date) {
  try {
    const userId = resolveUserId()
    const response = await getHistoryStudies(userId, date)

    historyStudies.value = response.map(item => {
      const createdAt = new Date(item.criado_em)

      return {
        id: item._id,
        date: createdAt.toLocaleDateString('pt-BR'),
        time: createdAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        disciplina: item.disciplina,
        conteudo: item.conteudo,
        duration: (item.tempo_horas * 60) + item.tempo_minutos,
        dificuldade: item.dificuldade
      }
    })
  } catch (e) {
    console.error('Erro ao carregar histórico', e)
  }
}


  /**
   * 🔒 BLINDADO: schedule SEMPRE recebe uma data
   */
  async function loadSchedule(date) {
  try {
    const userId = resolveUserId()
    const response = await getScheduleStudies(userId, date)

    scheduleStudies.value = response.revisions.map(r => {
      const dateObj = new Date(r.data_revisao)

      return {
        id: r._id,

        date: dateObj.toISOString().split('T')[0],
        time: dateObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),

        disciplina: r.disciplina,
        conteudo: r.conteudo,
        dificuldade: r.dificuldade,
        tempo: r.tempo_dedicado, // 🔥 STRING VEM PRONTA

        status: r.realizada ? 'done' : 'pending'
      }
    })
  } catch (e) {
    console.error('Erro ao carregar cronograma de revisões', e)
  }
}

  async function loadWeek() {
    try {
      const userId = resolveUserId()
      weekStudies.value = await getWeekStudies(userId)
    } catch (e) {
      console.error('Erro ao carregar semana', e)
    }
  }

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
    // BACKEND REAL
    // -----------------------------
    try {
      const userId = resolveUserId()
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

      // Atualiza visões backend
      await loadToday()
      await loadWeek()
      await loadSchedule(todayISO())

    } catch (error) {
      console.error('Erro ao registrar estudo no backend', error)
    }

    // -----------------------------
    // LÓGICA DE REVISÃO (SRS LOCAL)
    // -----------------------------
    if (payload.originId) {
      const review = futureReviews.value.find(r => r.id === payload.originId)
      if (review) {
        review.status = 'done'
        review.completedAt = new Date().toISOString()
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

  // =========================================================
  // EXPORT
  // =========================================================
  return {
    // UI
    isStudyModalOpen,
    modalPreFill,
    openStudyModal,
    closeStudyModal,

    // Local
    subjects,
    studyLogs,
    futureReviews,

    // Backend
    todayStudies,
    historyStudies,
    scheduleStudies,
    weekStudies,

    // Loaders backend
    loadToday,
    loadHistory,
    loadSchedule,
    loadWeek,

    // Actions
    registerStudy,
    completeReview,
    addSubject,
    deleteSubject,
    deleteStudyLog,
    loadData
  }
})
