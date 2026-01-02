/*
  ARQUIVO: src/stores/dashboardStore.js
  DESCRIÇÃO: ViewModel do Dashboard.
  ARQUITETURA:
    - Atua como uma camada de computação (Read-Only).
    - Consome dados brutos da 'scheduleStore' (Model).
    - Entrega dados formatados para a 'DashboardView' (View).
*/

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useScheduleStore } from './scheduleStore'

export const useDashboardStore = defineStore('dashboard', () => {
  
  // Acesso ao Model (Dados Reais)
  const scheduleStore = useScheduleStore()

  // ==========================================
  // 1. CARDS DE ESTATÍSTICAS (STATS)
  // ==========================================
  // Retorna um array de objetos prontos para serem iterados no v-for da View.
  
  const stats = computed(() => {
    
    // --- 1.1 REVISÕES PARA HOJE ---
    const reviewsToday = scheduleStore.futureReviews.filter(r => {
      const rDate = new Date(r.fullDate + 'T00:00:00')
      // Conta se está pendente E se a data é hoje ou passado (atrasada)
      return r.status === 'pending' && rDate <= new Date()
    }).length

    // --- 1.2 CÁLCULO DE OFENSIVA (STREAK) ---
    // Algoritmo para contar dias consecutivos de estudo
    const uniqueDays = [...new Set(scheduleStore.studyLogs.map(l => {
      // Extrai apenas a data YYYY-MM-DD
      return new Date(l.fullDate).toISOString().split('T')[0]
    }))].sort((a, b) => new Date(b) - new Date(a)) // Ordena do mais recente

    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Só calcula se houver histórico
    if (uniqueDays.length > 0) {
      const lastStudyDate = uniqueDays[0]
      
      // A ofensiva só é válida se o último estudo foi Hoje ou Ontem.
      // Se o último estudo foi anteontem, a sequência quebrou.
      if (lastStudyDate === today || lastStudyDate === yesterdayStr) {
        
        // Itera para trás contando dias consecutivos
        for (let i = 0; i < uniqueDays.length; i++) {
          if (i === 0) {
            streak = 1 // Começa a contagem
          } else {
            // Verifica a distância entre o dia atual (i) e o anterior (i-1)
            const prevDate = new Date(uniqueDays[i-1])
            const currDate = new Date(uniqueDays[i])
            const gap = (prevDate - currDate) / (1000 * 60 * 60 * 24)
            
            // Se a diferença for exatamente 1 dia, incrementa. Senão, para.
            if (gap === 1) streak++ 
            else break
          }
        }
      }
    }

    // --- 1.3 TEMPO TOTAL DE ESTUDO ---
    const totalMinutes = scheduleStore.studyLogs.reduce((acc, log) => acc + (log.duration || 0), 0)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    const timeString = `${h}h ${m}m`

    // --- 1.4 DISCIPLINA MAIS ESTUDADA ---
    const subjectTimes = {}
    // Agrupa tempo por matéria
    scheduleStore.studyLogs.forEach(log => {
      subjectTimes[log.subject] = (subjectTimes[log.subject] || 0) + log.duration
    })
    
    // Encontra a maior
    let topSubject = 'Nenhuma'
    let maxVal = 0
    for (const [sub, time] of Object.entries(subjectTimes)) {
      if (time > maxVal) { maxVal = time; topSubject = sub }
    }

    // Retorna estrutura visual (Ícone, Valor, Título, Cor)
    return [
      { 
        icon: 'bi-calendar-event', value: reviewsToday, title: 'Revisões Hoje', 
        color: '#2F80ED', bg: 'rgba(47, 128, 237, 0.1)' 
      },
      { 
        icon: 'bi-fire', value: streak, title: 'Dias de Ofensiva', 
        color: '#F2994A', bg: 'rgba(242, 153, 74, 0.1)' 
      },
      { 
        icon: 'bi-hourglass-split', value: timeString, title: 'Tempo Geral', 
        color: '#8456B5', bg: 'rgba(132, 86, 181, 0.1)' 
      },
      { 
        icon: 'bi-star-fill', value: topSubject, title: 'Mais Estudada', 
        color: '#F2C94C', bg: 'rgba(242, 201, 76, 0.1)' 
      }
    ]
  })

  // ==========================================
  // 2. GRÁFICO DE ATIVIDADE SEMANAL
  // ==========================================
  const weeklyActivity = computed(() => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    // Inicializa array zerado
    const activity = daysOfWeek.map(day => ({ day, minutes: 0, percent: 0 }))

    // Soma minutos por dia da semana (0-6)
    scheduleStore.studyLogs.forEach(log => {
      if (log.fullDate) {
        const d = new Date(log.fullDate)
        const dayIndex = d.getDay() // 0 = Domingo, etc.
        if (activity[dayIndex]) activity[dayIndex].minutes += (log.duration || 0)
      }
    })

    // Calcula porcentagem relativa ao maior valor (para altura da barra CSS)
    const maxMinutes = Math.max(...activity.map(a => a.minutes), 60) // Mínimo de 60 para não quebrar escala
    
    return activity.map(item => ({
      day: item.day,
      minutes: item.minutes,
      percent: Math.round((item.minutes / maxMinutes) * 100)
    }))
  })

  // ==========================================
  // 3. LISTA DE PRÓXIMAS REVISÕES
  // ==========================================
  const upcomingReviews = computed(() => {
    const today = new Date()
    today.setHours(0,0,0,0)

    return scheduleStore.futureReviews
      .filter(r => r.status === 'pending')
      .filter(r => new Date(r.fullDate) >= today) // Apenas futuras ou hoje (não mostra atrasadas aqui)
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
      .slice(0, 4) // Pega apenas as 4 primeiras
      .map(r => {
        // Formata data DD/MM
        const d = new Date(r.fullDate)
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth()+1).toString().padStart(2, '0')
        
        return {
          subject: r.subject,
          topic: r.topic.replace(/Revisão \d+: /, ''), // Remove prefixo técnico
          date: `${day}/${month}`,
          tag: r.topic.includes('Revisão') ? 'Revisão' : 'Estudo'
        }
      })
  })

  return { stats, weeklyActivity, upcomingReviews }
})