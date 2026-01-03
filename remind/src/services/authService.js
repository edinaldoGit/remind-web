import { api } from './api'

export const loginUser = async ({ email, senha }) => {
  const response = await api.post('/users/login', null, {
    params: {
      email,
      senha
    }
  })

  return response.data
}

export const registerUser = async ({ nome, email, senha, confirma }) => {
  const response = await api.post('/users/', null, {
    params: {
      nome,
      email,
      senha,
      confirma
    }
  })

  return response.data
}
