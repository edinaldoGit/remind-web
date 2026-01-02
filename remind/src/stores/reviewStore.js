// src/stores/reviewStore.js
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useScheduleStore } from './scheduleStore'

export const useReviewStore = defineStore('reviews', () => {
  
  // Acessa a store principal onde os dados REAIS vivem
  const scheduleStore = useScheduleStore()

  // 1. ESTADO (Espelha os dados da scheduleStore)
  const tasks = computed(() => scheduleStore.futureReviews)

  // 2. GETTERS (Filtros baseados nos dados reais)
  const pendingList = computed(() => {
    return tasks.value.filter(t => t.status === 'pending')
  })

  const doneList = computed(() => {
    return tasks.value.filter(t => t.status === 'done')
  })
  
  // Contadores
  const overdueCount = computed(() => {
    const today = new Date()
    today.setHours(0,0,0,0)
    return tasks.value.filter(t => {
      const d = new Date(t.fullDate + 'T00:00:00')
      return t.status === 'pending' && d < today
    }).length
  })

  const todayCount = computed(() => {
    const today = new Date()
    today.setHours(23,59,59,999)
    return tasks.value.filter(t => {
      const d = new Date(t.fullDate + 'T00:00:00')
      return t.status === 'pending' && d <= today
    }).length
  })

  // 3. ACTIONS (Chama a ação real na scheduleStore)
  function completeTask(id, duration = 30) {
    scheduleStore.completeReview(id, duration)
  }

  return { 
    tasks, 
    pendingList, 
    doneList, 
    overdueCount, 
    todayCount,
    completeTask 
  }
})