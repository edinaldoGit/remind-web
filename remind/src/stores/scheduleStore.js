import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Repository } from '../services/repository'

export const useScheduleStore = defineStore('schedule', () => {
  
  // --- UI CONTROL ---
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

  // --- DADOS (Inicializam vazios para evitar erro de Promessa) ---
  const subjects = ref([])
  const studyLogs = ref([])
  const futureReviews = ref([])

  // --- FUNÇÃO PARA CARREGAR DADOS ---
  // Essa função garante que os dados sejam buscados corretamente
  async function loadData() {
    try {
      // Tenta buscar. Se for síncrono (Mock), resolve na hora.
      // Se for assíncrono (API/Async), espera chegar.
      const subjectsData = await Repository.getSubjects()
      const logsData = await Repository.getStudyLogs()
      const reviewsData = await Repository.getReviews()
      
      subjects.value = subjectsData || []
      studyLogs.value = logsData || []
      futureReviews.value = reviewsData || []
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  // Chama o carregamento imediatamente ao iniciar a store
  loadData()

  // --- PERSISTÊNCIA AUTOMÁTICA ---
  // Observa mudanças para salvar
  watch(subjects, async (val) => { await Repository.saveSubjects(JSON.parse(JSON.stringify(val))) }, { deep: true })
  watch(studyLogs, async (val) => { await Repository.saveStudyLogs(JSON.parse(JSON.stringify(val))) }, { deep: true })
  watch(futureReviews, async (val) => { await Repository.saveReviews(JSON.parse(JSON.stringify(val))) }, { deep: true })


  // --- AÇÕES ---
  
  async function registerStudy(payload) {
    const today = new Date()
    
    // 1. Cria o Log
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

    // Adiciona na lista local (feedback visual imediato)
    studyLogs.value.unshift(newLog)

    // 2. Trata Revisão
    if (payload.originId) {
      const reviewIndex = futureReviews.value.findIndex(r => r.id === payload.originId)
      if (reviewIndex !== -1) {
        futureReviews.value[reviewIndex].status = 'done'
        futureReviews.value[reviewIndex].completedAt = new Date().toISOString()
      }
    } else {
      // Novo Estudo -> Gera SRS
      const intervals = [1, 7, 14]
      intervals.forEach((daysToAdd, index) => {
        const futureDate = new Date(today)
        futureDate.setDate(today.getDate() + daysToAdd)
        
        futureReviews.value.push({
          id: Date.now() + index + 100,
          originLogId: Date.now(),
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

  async function addSubject(name, color) {
    const newSubject = { id: Date.now(), name, color: color || '#333' }
    
    // Adiciona na lista local
    subjects.value.push(newSubject)
    
    // Se estivesse usando API real, aqui você chamaria Repository.addSubject
  }
  
  function deleteSubject(id) {
    const s = subjects.value.find(sub => sub.id === id)
    subjects.value = subjects.value.filter(sub => sub.id !== id)
    if(s) futureReviews.value = futureReviews.value.filter(r => r.subject !== s.name)
  }

  function deleteStudyLog(id) {
    studyLogs.value = studyLogs.value.filter(l => l.id !== id)
  }

  function completeReview(reviewId, durationInMinutes = 30) {
    const reviewIndex = futureReviews.value.findIndex(r => r.id === reviewId)
    if (reviewIndex !== -1) {
      const review = futureReviews.value[reviewIndex]
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
  }

  return { 
    subjects, studyLogs, futureReviews, 
    isStudyModalOpen, modalPreFill, openStudyModal, closeStudyModal, 
    registerStudy, completeReview, addSubject, deleteSubject, deleteStudyLog,
    loadData // Exporta caso precise forçar recarregamento na view
  }
})