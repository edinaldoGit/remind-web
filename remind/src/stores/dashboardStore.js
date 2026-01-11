import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getDashboardStatsApi, 
  getStreakApi, 
  getReportDownloadLinkApi,
  getWeekStudies,
  getScheduleStudies
} from '../services/studyService'
import { useAuthStore } from './authStore'

export const useDashboardStore = defineStore('dashboard', () => {
  
  const authStore = useAuthStore()

  const isLoading = ref(false)
  const isGeneratingReport = ref(false)
  
  const stats = ref([
    { title: 'Revisões Hoje', value: 0, icon: 'bi-check2-circle', color: '#2F80ED', bg: 'rgba(47, 128, 237, 0.1)' },
    { title: 'Dias de Ofensiva', value: '0 dias', icon: 'bi-fire', color: '#F2994A', bg: 'rgba(242, 153, 74, 0.1)' },
    { title: 'Tempo Geral', value: '0h', icon: 'bi-hourglass-split', color: '#8456B5', bg: 'rgba(132, 86, 181, 0.1)' },
    { title: 'Mais Estudada', value: '-', icon: 'bi-book', color: '#F2C94C', bg: 'rgba(242, 201, 76, 0.1)' }
  ])

  const weeklyActivity = ref([]) 
  const upcomingReviews = ref([]) 

  const dayMap = {
    'Sun': 'Dom', 'Mon': 'Seg', 'Tue': 'Ter', 'Wed': 'Qua', 'Thu': 'Qui', 'Fri': 'Sex', 'Sat': 'Sáb'
  }
  
  const daysPT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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

  async function loadDashboardData() {
    isLoading.value = true
    try {
      const userId = resolveUserId()

      const [dashData, streakData, weekCalendar] = await Promise.all([
        getDashboardStatsApi(userId),
        getStreakApi(userId),
        getWeekStudies(userId).catch(() => []) 
      ])

      const cards = dashData.cards || {}
      stats.value[0].value = cards.revisoes_hoje || 0
      
      const dias = (typeof streakData === 'object') ? (streakData.current_streak || streakData.days || 0) : streakData
      stats.value[1].value = `${dias} dias`

      stats.value[2].value = cards.tempo_total || '0h'
      stats.value[3].value = cards.disciplina_mais_estudada || 'Nenhuma'

      if (dashData.atividade_semanal && Array.isArray(dashData.atividade_semanal)) {
        const maxValue = Math.max(...dashData.atividade_semanal.map(d => d.total || 0), 4)
        const todayLabel = daysPT[new Date().getDay()]

        weeklyActivity.value = dashData.atividade_semanal.map(item => {
          const ptLabel = dayMap[item.dia] || item.dia
          return {
            day: ptLabel,
            value: item.total || 0,
            percent: Math.round(((item.total || 0) / maxValue) * 100),
            isToday: ptLabel === todayLabel
          }
        })
      } else {
        weeklyActivity.value = []
      }

      let datesToFetch = []
      if (Array.isArray(weekCalendar)) {
        const todayStr = new Date().toISOString().split('T')[0]
        datesToFetch = weekCalendar
          .filter(day => day.tem_conteudo === true && day.data >= todayStr)
          .map(day => day.data) 
      }

      if (datesToFetch.length === 0) {
        datesToFetch.push(new Date().toISOString().split('T')[0])
      }

      const schedulePromises = datesToFetch.map(date => 
        getScheduleStudies(userId, date)
          .then(res => res.revisions || res.schedule || res || []) 
          .catch(() => [])
      )

      const results = await Promise.all(schedulePromises)
      const allUpcoming = results.flat()

      upcomingReviews.value = allUpcoming
        .filter(item => !item.realizada)
        .slice(0, 6)
        .map(item => ({
          id: item._id || item.id,
          subject: item.disciplina || 'Sem Disciplina',
          topic: item.conteudo || 'Sem Tópico',
          date: item.data_revisao 
            ? new Date(item.data_revisao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : '--/--',
          status: 'pending',
          tag: 'Pendente'
        }))

    } catch (error) {
    } finally {
      isLoading.value = false
    }
  }

  async function downloadReport() {
    isGeneratingReport.value = true
    try {
      const userId = resolveUserId()
      const response = await getReportDownloadLinkApi(userId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Relatorio_ReMind.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erro ao gerar relatório.')
    } finally {
      isGeneratingReport.value = false
    }
  }

  return {
    isLoading,
    isGeneratingReport,
    stats,
    weeklyActivity,
    upcomingReviews,
    loadDashboardData,
    downloadReport
  }
})