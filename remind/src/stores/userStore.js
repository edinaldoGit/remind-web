import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Repository } from '../services/repository'

export const useUserStore = defineStore('user', () => {
  
  // Carrega do repositório
  const user = ref(Repository.getUser())

  // Salva no repositório quando mudar
  watch(user, (newVal) => {
    Repository.saveUser(newVal)
  }, { deep: true })

  function updateProfile(newData) {
    user.value = { ...user.value, ...newData }
  }

  function deleteAccount() {
    Repository.deleteUser()
    window.location.href = '/' 
  }

  return { user, updateProfile, deleteAccount }
})