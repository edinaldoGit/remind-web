import { api } from './api'

export const authService = {
  async login(email, senha) {
    const response = await api.post('/users/login', null, {
      params: { email, senha }
    })
    return response.data
  },

  async register({ nome, email, senha, confirma }) {
    const response = await api.post('/users/', null, {
      params: { nome, email, senha, confirma }
    })
    return response.data
  },

  async deleteUser(email) {
    const response = await api.delete(`/users/${email}`)
    return response.data
  },

  async updateUser(userId, novoNome) {
    const response = await api.put('/users/update', null, {
      params: { 
        user_id: userId, 
        name: novoNome 
      }
    })
    return response.data
  }
}