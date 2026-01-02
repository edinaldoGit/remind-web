<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import TopHeader from './TopHeader.vue'
import { useScheduleStore } from '../../stores/scheduleStore'

// ==========================================
// 2. MODEL ACCESS
// ==========================================
const scheduleStore = useScheduleStore()

// ==========================================
// 3. VIEW MODEL (Estado Local do Formulário)
// ==========================================

// Estado do formulário de registro de estudo
const form = ref({ 
  id: null,           // Se existir, é uma edição/revisão
  subjectId: '', 
  topic: '', 
  hours: 0,
  minutes: 30,
  difficulty: 'Médio'
})

// Opções de Dificuldade (Estática)
const difficulties = [
  { label: 'Fácil', value: 'Fácil', color: '#27AE60', bg: 'rgba(39, 174, 96, 0.1)' },
  { label: 'Médio', value: 'Médio', color: '#F2994A', bg: 'rgba(242, 153, 74, 0.1)' },
  { label: 'Difícil', value: 'Difícil', color: '#EB5757', bg: 'rgba(235, 87, 87, 0.1)' }
]

// Cores para criação de disciplinas
const presetColors = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#9F1239', '#78350F', '#64748B', '#1E293B']

// Estado para o sub-modal de criar disciplina
const showSubjectCreation = ref(false)
const newSubjectName = ref('')
const newSubjectColor = ref(presetColors[6])

// --- WATCHER (Preenchimento Automático) ---
// Observa se a Store pediu para abrir o modal com dados pré-preenchidos (ex: clicou em Revisar)
watch(() => scheduleStore.modalPreFill, (newItem) => {
  if (newItem) {
    // Modo Edição/Revisão: Busca a matéria pelo nome e preenche o form
    const subject = scheduleStore.subjects.find(s => s.name === newItem.subject)
    form.value.subjectId = subject ? subject.id : ''
    form.value.topic = newItem.topic
    form.value.id = newItem.id 
    form.value.hours = 0
    form.value.minutes = 30
  } else {
    // Modo Novo: Limpa o form
    form.value = { subjectId: '', topic: '', hours: 0, minutes: 30, difficulty: 'Médio', id: null }
  }
})

// ==========================================
// 4. ACTIONS
// ==========================================

/**
 * Envia o formulário de estudo para a Store.
 */
const handleSubmit = () => {
  if (!form.value.subjectId || !form.value.topic) return
  
  const subjectObj = scheduleStore.subjects.find(s => s.id === form.value.subjectId)
  
  // Converte horas/minutos para total em minutos
  const totalMinutes = (parseInt(form.value.hours) || 0) * 60 + (parseInt(form.value.minutes) || 0)

  if (totalMinutes === 0) {
    alert("Informe o tempo de estudo.")
    return
  }
  
  // Chama a Action do Model
  scheduleStore.registerStudy({
    originId: form.value.id,
    subjectName: subjectObj.name,
    topic: form.value.topic,
    difficulty: form.value.difficulty,
    duration: totalMinutes 
  })
  
  scheduleStore.closeStudyModal()
}

/**
 * Cria uma nova disciplina diretamente pelo modal.
 */
const handleCreateSubject = () => {
  if(newSubjectName.value) {
    scheduleStore.addSubject(newSubjectName.value, newSubjectColor.value)
    showSubjectCreation.value = false
    newSubjectName.value = ''
    newSubjectColor.value = presetColors[6] // Reseta cor padrão
  }
}
</script>

<template>
  <div class="app-layout">
    
    <div class="main-column">
      <Sidebar />
      <div class="vertical-wrapper">
        <TopHeader />
        <main class="content-area"><router-view></router-view></main>
      </div>
    </div>
    
    <aside class="aux-column">
      <div class="placeholder-content"><p>AUXILIAR</p></div>
    </aside>

    <div v-if="scheduleStore.isStudyModalOpen" class="modal-overlay" @click.self="scheduleStore.closeStudyModal()">
      <div class="modal-card">
        
        <div class="modal-header">
          <h2>{{ showSubjectCreation ? 'Nova Disciplina' : 'Registrar Estudo' }}</h2>
          <button class="close-btn" @click="scheduleStore.closeStudyModal()"><i class="bi bi-x-lg"></i></button>
        </div>

        <div v-if="showSubjectCreation" class="sub-modal-content slide-in">
           <div class="form-group">
                <input type="text" v-model="newSubjectName" placeholder="Nome da matéria..." autofocus>
             </div>
             <div class="color-grid">
               <div v-for="color in presetColors" :key="color" class="color-option" 
                 :style="{ backgroundColor: color }" 
                 :class="{ 'selected': newSubjectColor === color }" 
                 @click="newSubjectColor = color">
                 <i v-if="newSubjectColor === color" class="bi bi-check-lg"></i>
               </div>
             </div>
             <div class="modal-actions">
               <button class="btn-text" @click="showSubjectCreation = false">Voltar</button>
               <button class="btn-primary" @click="handleCreateSubject">Salvar</button>
             </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="study-form slide-in">
          
          <div class="form-group">
            <label>Disciplina</label>
            <div class="input-row">
              <select v-model="form.subjectId" required>
                <option value="" disabled selected>Selecione...</option>
                <option v-for="sub in scheduleStore.subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
              </select>
              <button type="button" class="btn-add" @click="showSubjectCreation = true" title="Nova Matéria"><i class="bi bi-plus-lg"></i></button>
            </div>
          </div>

          <div class="form-group">
            <label>O que foi estudado?</label>
            <input type="text" v-model="form.topic" placeholder="Ex: Cap. 4 - Revolução Industrial" required>
          </div>

          <div class="form-group">
            <label>Tempo Dedicado</label>
            <div class="time-inputs">
              <div class="time-field">
                <input type="number" v-model="form.hours" min="0" placeholder="0">
                <span>horas</span>
              </div>
              <div class="time-field">
                <input type="number" v-model="form.minutes" min="0" max="59" placeholder="30">
                <span>min</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Nível de Dificuldade</label>
            <div class="difficulty-grid">
              <div v-for="diff in difficulties" :key="diff.value" class="diff-card"
                :class="{ 'selected': form.difficulty === diff.value }"
                :style="{ '--color': diff.color, background: form.difficulty === diff.value ? diff.bg : 'white' }"
                @click="form.difficulty = diff.value">
                <span class="dot" :style="{ background: diff.color }"></span>
                {{ diff.label }}
              </div>
            </div>
          </div>

          <button type="submit" class="btn-submit-large">
            Registrar Estudo
            <i class="bi bi-check-lg"></i>
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- LAYOUT GERAL --- */
.app-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
.main-column { width: 80%; background-color: #EAECF0; display: flex; flex-direction: row; position: relative; }
.vertical-wrapper { display: flex; flex-direction: column; flex: 1; height: 100%; overflow: hidden; padding: 25px 0; }
.content-area { flex: 1; overflow-y: auto; padding: 20px 40px; padding-bottom: 0; }
.aux-column { width: 20%; background-color: white; border-left: 1px solid #eee; display: flex; justify-content: center; padding-top: 40px; }
.placeholder-content { color: #ccc; font-weight: 600; text-align: center; }

/* --- MODAL (Global) --- */
.modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
  background: rgba(11, 18, 64, 0.6); backdrop-filter: blur(5px); z-index: 9999; 
  display: flex; justify-content: center; align-items: center; 
}
.modal-card { 
  background: white; width: 100%; max-width: 500px; border-radius: 24px; padding: 30px; 
  box-shadow: 0 20px 50px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 20px; transition: height 0.3s; 
}
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; color: var(--color-blue); font-size: 1.5rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }

/* --- FORMULÁRIO --- */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-weight: 600; color: #444; margin-bottom: 8px; }

/* Inputs */
.input-row { display: flex; gap: 10px; }
input[type="text"], select { 
  width: 100%; padding: 14px; border: 1px solid #e0e0e0; border-radius: 12px; 
  font-size: 1rem; background: #F9FAFB; outline: none; 
}
input:focus, select:focus { border-color: var(--color-purple); background: white; }

.btn-add { width: 50px; background: #eee; border: none; border-radius: 12px; cursor: pointer; font-size: 1.2rem; color: #666; }
.btn-add:hover { background: var(--color-purple); color: white; }

/* Input de Tempo */
.time-inputs { display: flex; gap: 20px; }
.time-field { display: flex; align-items: center; gap: 8px; flex: 1; }
.time-field input { 
  width: 100%; padding: 14px; border: 1px solid #e0e0e0; border-radius: 12px; 
  font-size: 1.1rem; text-align: center; font-weight: bold; color: var(--color-blue);
}
.time-field span { font-weight: 600; color: #888; font-size: 0.9rem; }

/* Grid de Dificuldade */
.difficulty-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.diff-card { 
  border: 1px solid #eee; border-radius: 12px; padding: 10px; text-align: center; cursor: pointer; 
  font-weight: 600; color: #555; display: flex; flex-direction: column; align-items: center; font-size: 0.9rem; 
}
.diff-card .dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 5px; }
.diff-card.selected { border-color: var(--color); color: var(--color); font-weight: bold; background: white; transform: scale(1.05); }

/* Grid de Cores (Nova Disciplina) */
.color-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 5px; }
.color-option { 
  width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; 
  display: flex; align-items: center; justify-content: center; color: white; 
}
.color-option.selected { border-color: #333; transform: scale(1.1); }

/* Botões */
.btn-submit-large { 
  background: var(--color-purple); color: white; border: none; padding: 16px; border-radius: 16px; 
  font-size: 1.1rem; font-weight: bold; cursor: pointer; display: flex; justify-content: center; 
  align-items: center; gap: 10px; margin-top: 10px; width: 100%; transition: 0.3s; 
}
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-text { background: none; border: none; color: #666; font-weight: 600; cursor: pointer; }
.btn-primary { background: var(--color-purple); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; }

/* Animações */
@keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.slide-in { animation: slideIn 0.3s ease; }

@media (max-width: 900px) { .main-column { width: 100%; } .aux-column { display: none; } }
</style>