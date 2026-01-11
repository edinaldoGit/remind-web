import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const savedUser = localStorage.getItem('user')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)

  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function clearUser() {
    user.value = null
    localStorage.removeItem('user')
  }

  function isAuthenticated() {
    return user.value !== null
  }

  return {
    user,
    setUser,
    clearUser,
    isAuthenticated
  }
})