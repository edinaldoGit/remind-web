<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()

const form = ref({
  nome: userStore.user?.nome || '', 
  email: userStore.user?.email || ''
})

const avatarPreview = ref(userStore.user?.avatar)
const fileInput = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleSave = () => {
  userStore.updateProfile({
    nome: form.value.nome,
    email: form.value.email,
    avatar: avatarPreview.value
  })
  alert('Perfil atualizado com sucesso!')
}

const handleDelete = async () => {
  if(confirm("Tem certeza? Isso apagará todos os seus dados e não pode ser desfeito.")) {
    try {
      await userStore.deleteAccount()
    } catch (error) {
      alert('Não foi possível excluir a conta. Tente novamente.')
    }
  }
}
</script>

<template>
  <div class="profile-container">
    <header class="page-header">
      <h2>Meu Perfil</h2>
      <p>Gerencie suas informações pessoais.</p>
    </header>

    <div class="profile-content slide-up">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              <i class="bi bi-person"></i>
            </div>
            <div class="avatar-overlay">
              <i class="bi bi-camera-fill"></i>
            </div>
          </div>
          <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;">
          <p class="avatar-hint">Clique na foto para alterar</p>
        </div>

        <form @submit.prevent="handleSave" class="profile-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <div class="input-wrapper">
              <i class="bi bi-person"></i>
              <input type="text" v-model="form.nome" required>
            </div>
          </div>

          <div class="form-group">
            <label>E-mail</label>
            <div class="input-wrapper">
              <i class="bi bi-envelope"></i>
              <input type="email" v-model="form.email" required disabled style="background-color: #f9f9f9; cursor: not-allowed; color: #666;">
            </div>
          </div>

          <button type="submit" class="btn-save">
            Salvar Alterações
          </button>
        </form>
      </div>

      <div class="danger-zone">
        <div class="danger-info">
          <h3>Excluir Conta</h3>
          <p>Ao excluir sua conta, todos os seus dados de estudos, histórico e cronogramas serão perdidos permanentemente.</p>
        </div>
        <button class="btn-delete" @click="handleDelete">
          <i class="bi bi-trash"></i> Excluir minha conta
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
.page-header h2 { margin: 0; color: var(--color-blue); font-size: 1.8rem; }
.page-header p { color: #888; margin-top: 5px; }
.profile-card {
  background: white; border-radius: 20px; padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  display: flex; gap: 40px; align-items: flex-start;
}
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.avatar-wrapper { 
  width: 120px; height: 120px; border-radius: 50%; overflow: hidden; position: relative; cursor: pointer; border: 4px solid #f0f0f0; transition: border-color 0.3s;
}
.avatar-wrapper:hover { border-color: var(--color-purple); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { width: 100%; height: 100%; background: #EAECF0; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #ccc; }
.avatar-overlay { 
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; 
  color: white; font-size: 1.5rem; opacity: 0; transition: opacity 0.3s; 
}
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }
.avatar-hint { font-size: 0.8rem; color: #999; }
.profile-form { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; font-weight: 600; color: #444; margin-bottom: 8px; font-size: 0.9rem; }
.input-wrapper { position: relative; }
.input-wrapper i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; }
.input-wrapper input { 
  width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #e0e0e0; border-radius: 12px; font-size: 1rem; outline: none; transition: 0.3s;
}
.input-wrapper input:focus { border-color: var(--color-purple); box-shadow: 0 0 0 3px rgba(132, 86, 181, 0.1); }
.btn-save { 
  background: var(--color-purple); color: white; border: none; padding: 12px; border-radius: 12px; 
  font-weight: 600; cursor: pointer; align-self: flex-start; margin-top: 10px; transition: 0.3s;
}
.btn-save:hover { background: #6D4499; transform: translateY(-2px); }
.danger-zone {
  margin-top: 30px; border: 1px solid #FFEBEE; background: #FFF5F5; border-radius: 20px; padding: 30px;
  display: flex; justify-content: space-between; align-items: center; gap: 20px;
}
.danger-info h3 { margin: 0 0 5px 0; color: #D32F2F; font-size: 1.1rem; }
.danger-info p { margin: 0; color: #B71C1C; font-size: 0.9rem; opacity: 0.8; }
.btn-delete {
  background: white; border: 1px solid #FFCDD2; color: #D32F2F; padding: 10px 20px; border-radius: 10px;
  font-weight: 600; cursor: pointer; transition: 0.3s; white-space: nowrap;
}
.btn-delete:hover { background: #D32F2F; color: white; border-color: #D32F2F; }
@media (max-width: 768px) {
  .profile-card { flex-direction: column; align-items: center; }
  .profile-form { width: 100%; }
  .danger-zone { flex-direction: column; text-align: center; }
  .btn-save { width: 100%; }
}
.slide-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>