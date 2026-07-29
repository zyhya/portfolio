<template>
  <div class="min-h-screen flex items-center justify-center px-6">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-bold text-bg-dark text-lg">A</div>
          <span class="font-bold text-xl gradient-text">Admin</span>
        </div>
        <p class="text-gray-500 text-sm font-mono">作品集后台管理系统</p>
      </div>

      <div class="glass-card rounded-3xl p-8">
        <h2 class="text-2xl font-bold text-white mb-6">登录</h2>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">用户名</label>
            <input v-model="username" type="text" placeholder="admin"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
              required />
          </div>
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">密码</label>
            <input v-model="password" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
              required />
          </div>
          <div v-if="error" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2">{{ error }}</div>
          <button type="submit" :disabled="loading"
            class="w-full py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold hover:scale-[1.02] transition-transform disabled:opacity-50">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        <div class="mt-6 text-center">
          <router-link to="/" class="text-sm text-gray-500 hover:text-neon-cyan transition-colors">← 返回网站</router-link>
        </div>
      </div>

      <div class="mt-4 text-center text-xs text-gray-600">
        默认账号 admin / admin123，部署后请在 Vercel 环境变量中修改
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../lib/api.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  const { error: loginError } = await adminLogin(username.value, password.value)
  if (loginError) {
    error.value = loginError
    loading.value = false
  } else {
    router.push('/admin')
  }
}
</script>
