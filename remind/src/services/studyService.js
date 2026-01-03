import { api } from './api'

export async function registerStudyApi({
  userId,
  disciplina,
  conteudo,
  horas,
  minutos,
  dificuldade
}) {
  if (!userId) throw new Error('user_id ausente')

  return api.post('/study/register', null, {
    params: {
      user_id: String(userId),
      disciplina,
      conteudo,
      horas,
      minutos,
      dificuldade
    }
  })
}

// CONSULTAS

export async function getTodayStudies(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/today', {
    params: { user_id: userId }
  })
  return data
}

export async function getHistoryStudies(userId, date) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/history', {
    params: { user_id: userId, date }
  })
  return data
}

export async function getScheduleStudies(userId, date) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/schedule', {
    params: { user_id: userId, date }
  })
  return data
}

export async function getWeekStudies(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/week', {
    params: { user_id: userId }
  })
  return data
}
