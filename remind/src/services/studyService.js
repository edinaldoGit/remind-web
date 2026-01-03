import { api } from './api'

export async function registerStudyApi({
  userId,
  disciplina,
  conteudo,
  horas,
  minutos,
  dificuldade
}) {
  return api.post('/study/register', null, {
    params: {
      user_id: userId, 
      disciplina,
      conteudo,
      horas,
      minutos,
      dificuldade
    }
  })
}
