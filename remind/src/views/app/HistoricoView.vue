<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, computed } from 'vue'
import { useScheduleStore } from '../../stores/scheduleStore'

// ==========================================
// 2. MODEL ACCESS (Store)
// ==========================================
const scheduleStore = useScheduleStore()

// ==========================================
// 3. VIEW MODEL (Lógica de Tela)
// ==========================================

// Estado da UI (Qual aba está visível)
const activeTab = ref('logs') // 'logs' | 'subjects'

// --- Formatadores (Helpers de Apresentação) ---

/**
 * Formata a data para exibição na tabela.
 * @param {string|number} dateStr - Dia do mês
 * @param {string} timeStr - Hora (HH:mm)
 */
const formatDate = (dateStr, timeStr) => {
  // Nota: Aqui assumimos que dateStr é o dia do mês atual ou uma string simples.
  // Se mudar o formato no backend, ajustar aqui.
  return `Dia ${dateStr} às ${timeStr}`
}

/**
 * Converte minutos totais em string legível (ex: "1h 30m").
 * @param {number} totalMinutes 
 */
const formatDuration = (totalMinutes) => {
  if (!totalMinutes) return '0m'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// --- Dados Computados ---

/**
 * Retorna os logs de estudo ordenados do mais recente (ID maior) para o mais antigo.
 * Isso garante que o último estudo apareça no topo da tabela.
 */
const sortedLogs = computed(() => {
  // Cria uma cópia com [...] para não mutar o array original do Pinia durante o sort
  return [...scheduleStore.studyLogs].sort((a, b) => b.id - a.id)
})
</script>

<template>
  <div class="management-container">
    
    <header class="page-header">
      <h2>Histórico e Gestão</h2>
      <p>Visualize todo o seu progresso e gerencie suas matérias.</p>
    </header>

    <div class="tabs-header">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'logs' }" 
        @click="activeTab = 'logs'">
        <i class="bi bi-clock-history"></i> Histórico de Estudos
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'subjects' }" 
        @click="activeTab = 'subjects'">
        <i class="bi bi-bookmarks"></i> Disciplinas
      </button>
    </div>

    <div class="tab-content">
      
      <section v-if="activeTab === 'logs'" class="content-section slide-up">
        
        <div v-if="sortedLogs.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Disciplina</th>
                <th>Tópico Estudado</th>
                <th>Tempo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in sortedLogs" :key="log.id">
                <td class="col-date">
                  <i class="bi bi-calendar3"></i> {{ formatDate(log.day, log.time) }}
                </td>
                <td>
                  <span class="subject-badge">{{ log.subject }}</span>
                </td>
                <td class="col-topic">{{ log.topic }}</td>
                <td class="col-duration">{{ formatDuration(log.duration) }}</td>
                <td class="col-actions">
                  <button class="btn-icon-delete" @click="scheduleStore.deleteStudyLog(log.id)" title="Excluir Registro">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <i class="bi bi-journal-x"></i>
          <p>Nenhum estudo registrado ainda.</p>
        </div>

      </section>

      <section v-if="activeTab === 'subjects'" class="content-section slide-up">
        
        <div v-if="scheduleStore.subjects.length > 0" class="subjects-grid">
          <div v-for="sub in scheduleStore.subjects" :key="sub.id" class="subject-card" :style="{ borderTopColor: sub.color }">
            <div class="card-color-dot" :style="{ background: sub.color }"></div>
            <div class="card-info">
              <h3>{{ sub.name }}</h3>
              <p>Disciplina Ativa</p>
            </div>
            <button class="btn-delete-sub" @click="scheduleStore.deleteSubject(sub.id)">
              Excluir
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="bi bi-bookmarks"></i>
          <p>Nenhuma disciplina cadastrada.</p>
        </div>

      </section>

    </div>
  </div>
</template>

<style scoped>
/* --- LAYOUT GERAL --- */
.management-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; height: 100%; }

/* Header */
.page-header h2 { margin: 0; color: var(--color-blue); font-size: 1.8rem; }
.page-header p { color: #888; margin-top: 5px; }

/* Content Area */
.tab-content { flex: 1; overflow-y: auto; padding-right: 5px; }

/* --- ABAS (TABS) --- */
.tabs-header { display: flex; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.tab-btn {
  background: none; border: none; padding: 10px 20px; font-size: 1rem; font-weight: 600; 
  color: #888; cursor: pointer; border-radius: 8px; transition: 0.2s; 
  display: flex; gap: 8px; align-items: center;
}
.tab-btn:hover { background: #f5f5f5; color: #555; }
.tab-btn.active { background: var(--color-purple); color: white; box-shadow: 0 4px 10px rgba(132, 86, 181, 0.2); }

/* --- TABELA DE LOGS --- */
.table-container { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 15px; color: #888; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #eee; }
td { padding: 15px; border-bottom: 1px solid #f9f9f9; vertical-align: middle; color: #555; }
tr:last-child td { border-bottom: none; }

/* Colunas Específicas */
.col-date { font-weight: 600; color: #666; font-size: 0.9rem; white-space: nowrap; }
.col-date i { color: var(--color-purple); margin-right: 5px; }
.col-topic { font-weight: 500; }
.col-duration { font-family: monospace; font-size: 1rem; color: #444; background: #eee; padding: 4px 8px; border-radius: 6px; display: inline-block; }
.subject-badge { background: #F3F4F6; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }

/* Botões da Tabela */
.btn-icon-delete { 
  width: 35px; height: 35px; border-radius: 8px; border: none; background: #FFF5F5; 
  color: #FF4757; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; 
}
.btn-icon-delete:hover { background: #FF4757; color: white; }

/* --- GRADE DE DISCIPLINAS --- */
.subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.subject-card {
  background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  display: flex; align-items: center; justify-content: space-between; gap: 15px;
  border-top: 4px solid #ccc; /* Cor dinâmica via style no html */
  transition: transform 0.2s;
}
.subject-card:hover { transform: translateY(-3px); }

.card-color-dot { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; opacity: 0.2; }
.card-info h3 { margin: 0; font-size: 1.1rem; color: #444; }
.card-info p { margin: 0; font-size: 0.8rem; color: #999; }

.btn-delete-sub {
  background: none; border: 1px solid #eee; color: #999; padding: 6px 12px; border-radius: 8px; 
  cursor: pointer; font-size: 0.8rem; transition: 0.2s;
}
.btn-delete-sub:hover { border-color: #FF4757; color: #FF4757; background: #FFF5F5; }

/* --- ESTADOS VAZIOS & ANIMAÇÃO --- */
.empty-state { text-align: center; margin-top: 50px; color: #ccc; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 10px; }

.slide-up { animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>