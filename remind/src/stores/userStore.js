import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Repository } from '../services/repository'
import { authService } from '../services/authService'
import { useAuthStore } from './authStore'

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()
  
  const user = ref(Repository.getUser())

  watch(user, (newVal) => {
    if (newVal) {
      Repository.saveUser(newVal)
    }
  }, { deep: true })

  async function updateProfile(newData) {
    try {
      const userId = user.value?.id || user.value?._id || user.value?.uid || authStore.user?.id

      if (!userId) {
        throw new Error('ID do usuário não identificado para atualização.')
      }

      if (newData.nome && newData.nome !== user.value.nome) {
        await authService.updateUser(userId, newData.nome)
      }

      user.value = { ...user.value, ...newData }
      authStore.setUser(user.value)

    } catch (error) {
      throw error 
    }
  }

  async function deleteAccount() {
    try {
      const emailParaExcluir = user.value?.email
      if (emailParaExcluir) {
        await authService.deleteUser(emailParaExcluir)
      }

    } catch (error) {
      if (error.response && error.response.status !== 404) {
        throw error 
      }
    }

    Repository.deleteUser()
    authStore.clearUser() 
    window.location.href = '/' 
  }

  function setUser(userData) {
    user.value = userData
  }

  return { 
    user, 
    setUser,
    updateProfile, 
    deleteAccount 
  }
})