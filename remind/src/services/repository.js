const STORAGE_KEYS = {
  USER: 'user', 
  SUBJECTS: 'remind_subjects',
  LOGS: 'remind_logs',
  REVIEWS: 'remind_reviews'
}

const MOCK_DATA = {
  subjects: [
    { id: 1, name: 'Matemática', color: '#F2994A' },
    { id: 2, name: 'Português', color: '#8456B5' },
    { id: 3, name: 'História', color: '#2F80ED' },
    { id: 4, name: 'Biologia', color: '#27AE60' },
    { id: 5, name: 'Inglês', color: '#EB5757' }
  ],

  getLogs: () => {
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

  getReviews: () => {
    const d = (offset) => {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const dateStr = date.toISOString().split('T')[0]
      return { day: date.getDate(), full: dateStr }
    }
    return [
      { id: 201, subject: 'História', topic: 'Revisão 1: Rev. Francesa', day: d(-13).day, fullDate: d(-13).full, status: 'done', type: 'review' },
      { id: 202, subject: 'História', topic: 'Revisão 2: Rev. Francesa', day: d(-7).day, fullDate: d(-7).full, status: 'done', type: 'review' },
      { id: 203, subject: 'História', topic: 'Revisão 3: Rev. Francesa', day: d(0).day, fullDate: d(0).full, status: 'pending', type: 'review' },
      { id: 204, subject: 'Matemática', topic: 'Revisão 2: Funções', day: d(0).day, fullDate: d(0).full, status: 'pending', type: 'review' },
      { id: 205, subject: 'Biologia', topic: 'Revisão 1: Citologia', day: d(-1).day, fullDate: d(-1).full, status: 'pending', type: 'review' },
      { id: 206, subject: 'Português', topic: 'Revisão 1: Crase', day: d(1).day, fullDate: d(1).full, status: 'pending', type: 'review' }
    ]
  }
}

function loadOrMock(key, mockValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  
  localStorage.setItem(key, JSON.stringify(mockValue))
  return mockValue
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const Repository = {
  getUser: () => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER)
    return saved ? JSON.parse(saved) : null 
  },
  
  saveUser: (user) => save(STORAGE_KEYS.USER, user),
  
  deleteUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  getSubjects: () => loadOrMock(STORAGE_KEYS.SUBJECTS, MOCK_DATA.subjects),
  saveSubjects: (subjects) => save(STORAGE_KEYS.SUBJECTS, subjects),

  getStudyLogs: () => loadOrMock(STORAGE_KEYS.LOGS, MOCK_DATA.getLogs()),
  saveStudyLogs: (logs) => save(STORAGE_KEYS.LOGS, logs),

  getReviews: () => loadOrMock(STORAGE_KEYS.REVIEWS, MOCK_DATA.getReviews()),
  saveReviews: (reviews) => save(STORAGE_KEYS.REVIEWS, reviews)
}