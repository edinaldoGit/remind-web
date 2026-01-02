/*
  ARQUIVO: src/services/repository.js
  DESCRIÇÃO: Camada de acesso a dados (Data Layer).
  PADRÃO: Repository Pattern.
  FUNCIONALIDADE: 
    - Gerencia a persistência no LocalStorage.
    - Fornece dados Mockados (fictícios) inteligentes se o storage estiver vazio.
    - Centraliza as chaves de acesso.
*/

// ==========================================
// 1. CONFIGURAÇÃO
// ==========================================

const STORAGE_KEYS = {
  USER: 'remind_user',
  SUBJECTS: 'remind_subjects',
  LOGS: 'remind_logs',
  REVIEWS: 'remind_reviews'
}

// ==========================================
// 2. DADOS INICIAIS (MOCK DATA)
// ==========================================
// Estes dados são usados para "semear" o aplicativo na primeira execução.
// Usamos funções geradoras de data para que o conteúdo pareça sempre "fresco" (datas relativas a hoje).

const MOCK_DATA = {
  user: {
    name: 'Edinaldo',
    email: 'edinaldo@email.com',
    // Avatar de exemplo (URL externa)
    avatar: 'https://media-for2-1.cdn.whatsapp.net/v/t61.24694-24/604001656_1522573769045870_8194881025642434034_n.jpg?ccb=11-4&oh=01_Q5Aa3QHa7wDmawCYNE1OttbZ1-EVkItmNMnEjAbwhRm-NFusqQ&oe=695D1C93&_nc_sid=5e03e0&_nc_cat=106'
  },
  
  subjects: [
    { id: 1, name: 'Matemática', color: '#F2994A' },
    { id: 2, name: 'Português', color: '#8456B5' },
    { id: 3, name: 'História', color: '#2F80ED' },
    { id: 4, name: 'Biologia', color: '#27AE60' },
    { id: 5, name: 'Inglês', color: '#EB5757' }
  ],

  // Gera logs de estudo baseados na data atual
  getLogs: () => {
    // Helper para criar data relativa: d(-1) = ontem, d(0) = hoje
    const d = (offset) => {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      return date
    }
    return [
      { id: 101, subject: 'História', topic: 'Revolução Francesa', difficulty: 'Médio', duration: 45, time: '14:30', day: d(-14).getDate(), fullDate: d(-14).toISOString() },
      { id: 102, subject: 'Matemática', topic: 'Funções', difficulty: 'Difícil', duration: 90, time: '10:00', day: d(-7).getDate(), fullDate: d(-7).toISOString() },
      { id: 103, subject: 'Biologia', topic: 'Citologia', difficulty: 'Fácil', duration: 30, time: '16:00', day: d(-2).getDate(), fullDate: d(-2).toISOString() },
      { id: 104, subject: 'Português', topic: 'Crase', difficulty: 'Médio', duration: 60, time: '09:15', day: d(0).getDate(), fullDate: d(0).toISOString() }
    ]
  },

  // Gera revisões agendadas (passadas e futuras)
  getReviews: () => {
    const d = (offset) => {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const dateStr = date.toISOString().split('T')[0]
      return { day: date.getDate(), full: dateStr }
    }
    return [
      // Passadas/Concluídas
      { id: 201, subject: 'História', topic: 'Revisão 1: Rev. Francesa', day: d(-13).day, fullDate: d(-13).full, status: 'done', type: 'review' },
      { id: 202, subject: 'História', topic: 'Revisão 2: Rev. Francesa', day: d(-7).day, fullDate: d(-7).full, status: 'done', type: 'review' },
      
      // Pendentes (Hoje)
      { id: 203, subject: 'História', topic: 'Revisão 3: Rev. Francesa', day: d(0).day, fullDate: d(0).full, status: 'pending', type: 'review' },
      { id: 204, subject: 'Matemática', topic: 'Revisão 2: Funções', day: d(0).day, fullDate: d(0).full, status: 'pending', type: 'review' },
      
      // Atrasada (Ontem)
      { id: 205, subject: 'Biologia', topic: 'Revisão 1: Citologia', day: d(-1).day, fullDate: d(-1).full, status: 'pending', type: 'review' },
      
      // Futura (Amanhã)
      { id: 206, subject: 'Português', topic: 'Revisão 1: Crase', day: d(1).day, fullDate: d(1).full, status: 'pending', type: 'review' }
    ]
  }
}

// ==========================================
// 3. HELPERS DE PERSISTÊNCIA
// ==========================================

/**
 * Tenta carregar do localStorage. Se não existir, salva o mock e retorna o mock.
 */
function loadOrMock(key, mockValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error("Erro ao ler localStorage", e)
  }
  
  // Inicialização (Seeding)
  localStorage.setItem(key, JSON.stringify(mockValue))
  return mockValue
}

/**
 * Salva dados no localStorage.
 */
function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error("Erro ao salvar no localStorage", e)
  }
}

// ==========================================
// 4. API PÚBLICA (EXPORTS)
// ==========================================
// As Stores chamarão apenas estes métodos.

export const Repository = {
  
  // --- USUÁRIO ---
  getUser: () => loadOrMock(STORAGE_KEYS.USER, MOCK_DATA.user),
  saveUser: (user) => save(STORAGE_KEYS.USER, user),
  deleteUser: () => {
    localStorage.clear()
    window.location.reload() // Força recarregamento para resetar estados
  },

  // --- MATÉRIAS ---
  getSubjects: () => loadOrMock(STORAGE_KEYS.SUBJECTS, MOCK_DATA.subjects),
  saveSubjects: (subjects) => save(STORAGE_KEYS.SUBJECTS, subjects),

  // --- LOGS DE ESTUDO ---
  getStudyLogs: () => loadOrMock(STORAGE_KEYS.LOGS, MOCK_DATA.getLogs()),
  saveStudyLogs: (logs) => save(STORAGE_KEYS.LOGS, logs),

  // --- REVISÕES ---
  getReviews: () => loadOrMock(STORAGE_KEYS.REVIEWS, MOCK_DATA.getReviews()),
  saveReviews: (reviews) => save(STORAGE_KEYS.REVIEWS, reviews)
}