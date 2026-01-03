<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoInicio from '../../assets/img/LogoInicio.png'

// services
import { loginUser, registerUser } from '../../services/authService'

// store de autenticação
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)

const form = ref({
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
}

const handleSubmit = async () => {
  loading.value = true

  try {
    // 🔐 LOGIN
    if (isLogin.value) {
      const result = await loginUser({
        email: form.value.email,
        senha: form.value.senha
      })

      // ✅ SALVA O USUÁRIO INTEIRO (campo correto)
      authStore.setUser(result.user)

      router.push('/app/dashboard')
      return
    }

    // 📝 CADASTRO
    if (form.value.senha !== form.value.confirmarSenha) {
      alert('As senhas não conferem')
      return
    }

    await registerUser({
      nome: form.value.nome,
      email: form.value.email,
      senha: form.value.senha,
      confirma: form.value.confirmarSenha
    })

    alert('Usuário criado com sucesso! Faça login.')

    isLogin.value = true

    form.value = {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: ''
    }

  } catch (error) {
    console.error(error)
    alert(
      error.response?.data?.detail ||
      'Erro ao processar a requisição'
    )
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="login-page">
    
    <div class="login-card">
      
      <div class="col-visual">
        
        <div class="blob-decoration blob-top-right"></div>
        <div class="blob-decoration blob-top-left"></div>
        <div class="blob-decoration blob-lat-left"></div>
        <div class="blob-decoration blob-bottom-right"></div>

        <div class="brand-content">
          <div class="logo-area">
            <img :src="LogoInicio" alt="Logo ReMind" class="logo-img" />
          </div>
          
          <h2 class="slogan">Transforme estudo em memória de longo prazo.</h2>
        </div>

        <div class="legal-footer">
          <a href="#">Sobre</a>
          <a href="#">Privacidade</a>
          <a href="#">Termos de uso</a>
          <a href="#">FAQ</a>
        </div>
      </div>

      <div class="col-form">
        <div class="form-content">
          
          <h2 class="form-title">{{ isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta' }}</h2>
          <p class="form-subtitle">
            {{ isLogin ? 'Insira seus dados para entrar.' : 'Comece a organizar seus estudos hoje.' }}
          </p>

          <form @submit.prevent="handleSubmit">
            <div v-if="!isLogin" class="input-group slide-in">
              <label>Nome Completo</label>
              <input type="text" v-model="form.nome" placeholder="Ex: Edinaldo Silva" required>
            </div>

            <div class="input-group">
              <label>E-mail</label>
              <input type="email" v-model="form.email" placeholder="seu@email.com" required>
            </div>

            <div class="input-group">
              <label>Senha</label>
              <input type="password" v-model="form.senha" placeholder="••••••••" required>
            </div>

            <div v-if="!isLogin" class="input-group slide-in">
              <label>Confirmar Senha</label>
              <input type="password" v-model="form.confirmarSenha" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn-primary">
              {{ isLogin ? 'Entrar' : 'Criar Conta' }}
            </button>
          </form>

          <div class="toggle-area">
            <p v-if="isLogin">
              Não tem conta? 
              <a href="#" @click.prevent="toggleMode">Cadastre-se gratuitamente</a>
            </p>
            <p v-else>
              Já tem conta? 
              <a href="#" @click.prevent="toggleMode">Faça Login</a>
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- LAYOUT DA PÁGINA --- */
.login-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0B1240 0%, #8456B5 100%);
}

/* --- CARD PRINCIPAL --- */
.login-card {
  display: flex;
  width: 1200px;
  max-width: 95%;
  
  /* ALTURA FIXA DE NOVO */
  height: 750px; 
  max-height: 95vh;
  
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  z-index: 10;
  
  overflow-y: auto; 
  overflow-x: hidden;
}

.login-card::-webkit-scrollbar { width: 8px; }
.login-card::-webkit-scrollbar-track { background: transparent; }
.login-card::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; border: 2px solid white; }

/* --- COLUNA 1: VISUAL --- */
.col-visual {
  flex: 1;
  background-color: #F8F9FA; 
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden; 
}

/* Decorações */
.blob-decoration { position: absolute; border-radius: 50%; z-index: 0; }

.blob-top-right {
  width: 400px; height: 400px; top: -150px; right: -150px;
  background: linear-gradient(135deg, var(--color-purple, #8456B5), var(--color-blue, #0B1240)); opacity: 0.8;
}

.blob-top-left {
  width: 250px; height: 250px; top: -100px; right: 100px;
  background: linear-gradient(135deg, var(--color-cyan, #00D2FF), var(--color-blue, #0B1240));
}

.blob-lat-left {
  width: 250px; height: 250px; bottom: 100px; left: -150px;
  background: linear-gradient(135deg, var(--color-purple, #8456B5), var(--color-blue, #0B1240)); opacity: 0.8;
}

.blob-bottom-right {
  width: 150px; height: 150px; bottom: -50px; right: -50px;
  background: linear-gradient(135deg, var(--color-cyan, #00D2FF), var(--color-blue, #0B1240)); opacity: 0.8;
}

.brand-content { text-align: center; z-index: 1; }
.logo-area { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; }
.logo-img { max-width: 250px; height: auto; filter: drop-shadow(0 10px 20px rgba(11, 18, 64, 0.2)); }
.slogan {
  font-size: 1.1rem; font-weight: 600; color: var(--color-cool-gray, #555B70);
  text-align: center; margin-top: 40px; max-width: 70%; margin-left: auto; margin-right: auto; line-height: 1.5;
}

.legal-footer {
  position: absolute; bottom: 40px; left: 0; width: 100%;
  display: flex; justify-content: center; gap: 30px; z-index: 1;
}
.legal-footer a {
  text-decoration: none; color: var(--color-blue, #0B1240); font-size: 0.85rem; font-weight: 600; transition: color 0.3s;
}
.legal-footer a:hover { color: var(--color-purple, #8456B5); }

/* --- COLUNA 2: FORMULÁRIO --- */
.col-form {
  flex: 1;
  background-color: #ffffff;
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-visual, .col-form { height: auto; min-height: 100%; }

.form-content { width: 100%; max-width: 350px; }
.form-title { color: var(--color-blue, #0B1240); margin-bottom: 10px; font-size: 1.8rem; }
.form-subtitle { color: var(--color-cool-gray, #555B70); margin-bottom: 30px; font-size: 0.95rem; }

.input-group { margin-bottom: 20px; }
.input-group label {
  display: block; font-size: 0.85rem; color: var(--color-cool-gray, #555B70); margin-bottom: 8px; font-weight: 600;
}
.input-group input {
  width: 100%; padding: 12px 15px;
  border: 1px solid #e1e1e1; border-radius: 8px; font-size: 1rem;
  transition: all 0.3s; outline: none; background: #fafafa; color: #333;
}
.input-group input:focus {
  border-color: var(--color-purple, #8456B5); background: #fff;
  box-shadow: 0 0 0 3px rgba(132, 86, 181, 0.1);
}

.btn-primary {
  width: 100%; padding: 14px;
  background: var(--gradient-button, linear-gradient(135deg, #0B1240 0%, #8456B5 100%));
  color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem;
  cursor: pointer; transition: transform 0.2s, opacity 0.2s; margin-top: 10px;
}
.btn-primary:hover {
  background: var(--color-blue-button-hover, linear-gradient(135deg, #3943B7 50%, #00D2FF 100%));
  transform: translateY(-2px); opacity: 0.9;
}

.toggle-area { margin-top: 20px; text-align: center; font-size: 0.9rem; color: #666; }
.toggle-area a { color: var(--color-purple, #8456B5); font-weight: bold; text-decoration: none; }
.toggle-area a:hover { text-decoration: underline; }

.slide-in { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 950px) {
  .login-card { flex-direction: column; height: auto; margin: 20px; }
  .col-visual { padding: 60px 30px; min-height: 300px; }
  .col-form { padding: 40px 30px; }
  .blob-top-right { width: 200px; height: 200px; top: -80px; right: -80px; }
  .blob-bottom-left { width: 150px; height: 150px; bottom: -50px; left: -50px; }
  .legal-footer { position: relative; margin-top: 30px; bottom: auto; }
}
</style>