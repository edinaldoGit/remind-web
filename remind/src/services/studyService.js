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

export async function markCompletedApi(revisionId, tempoDedicado) {
  if (!revisionId) throw new Error('ID da revisão ausente')
  if (!tempoDedicado) throw new Error('Tempo dedicado ausente')
  return api.post('/study/mark_completed', null, {
    params: {
      revision_id: String(revisionId),
      tempo_dedicado: String(tempoDedicado)
    }
  })
}

export async function getTodayStudies(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/today', { 
    params: { user_id: String(userId) } 
  })
  return data
}

export async function getCompletedStudiesApi(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/completed', { 
    params: { user_id: String(userId) } 
  })
  return data
}

export async function getHistoryStudies(userId, date) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/history', { 
    params: { user_id: String(userId), date } 
  })
  return data
}

export async function getScheduleStudies(userId, date = null) {
  if (!userId) throw new Error('user_id ausente')
  const params = { user_id: String(userId) }
  if (date) params.date = date
  const { data } = await api.get('/study/schedule', { params })
  return data
}

export async function getWeekStudies(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/study/week', { 
    params: { user_id: String(userId) } 
  })
  return data
}

export async function updateStudyApi(studyId, { disciplina, conteudo, horas, minutos, dificuldade }) {
  if (!studyId) throw new Error('study_id ausente')
  const params = { study_id: studyId }
  if (disciplina) params.disciplina = disciplina
  if (conteudo) params.conteudo = conteudo
  if (horas !== undefined) params.horas = horas
  if (minutos !== undefined) params.minutos = minutos
  if (dificuldade) params.dificuldade = dificuldade
  return api.put('/study/update', null, { params })
}

export async function deleteStudyLogApi(studyId) {
  if (!studyId) throw new Error('study_id ausente')
  return api.delete('/study/delete', {
    params: { study_id: studyId }
  })
}

export async function deleteStudyApi(revisionId) {
  if (!revisionId) throw new Error('ID ausente')
  return api.delete('/study/revision/delete', {
    params: { revision_id: revisionId }
  })
}

export async function getDisciplinesApi(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/discipline/list', { 
    params: { user_id: String(userId) } 
  })
  return data
}

export async function createDisciplineApi(userId, nome, cor) {
  if (!userId) throw new Error('user_id ausente')
  return api.post('/discipline/create', null, { 
    params: { user_id: String(userId), nome, cor } 
  })
}

export async function updateDisciplineApi(disciplineId, nome, cor) {
  if (!disciplineId) throw new Error('discipline_id ausente')
  const params = { discipline_id: disciplineId }
  if (nome) params.nome = nome
  if (cor) params.cor = cor
  return api.put('/discipline/update', null, { params })
}

export async function deleteDisciplineApi(disciplineId) {
  if (!disciplineId) throw new Error('discipline_id ausente')
  return api.delete('/discipline/delete', { 
    params: { discipline_id: disciplineId } 
  })
}

export async function getDashboardStatsApi(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/dashboard/', {
    params: { user_id: String(userId) }
  })
  return data
}

export async function getStreakApi(userId) {
  if (!userId) throw new Error('user_id ausente')
  const { data } = await api.get('/streak/', {
    params: { user_id: String(userId) }
  })
  return data
}

export async function getReportDownloadLinkApi(userId) {
  if (!userId) throw new Error('user_id ausente')
  return await api.get('/report/download', {
    params: { user_id: String(userId) },
    responseType: 'blob' 
  })
}