<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 fixed inset-y-0 left-0 z-40 glass-card border-r border-white/5 flex flex-col">
      <div class="p-6 border-b border-white/5">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-bold text-bg-dark">A</div>
          <span class="font-bold gradient-text">Admin</span>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          :class="activeTab === tab.id
            ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-white border border-neon-cyan/20'
            : 'text-gray-400 hover:text-white hover:bg-white/5'">
          <span class="text-lg">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>

      <div class="p-4 border-t border-white/5 space-y-1">
        <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-neon-pink hover:bg-neon-pink/5 transition-all">
          <span class="text-lg">🚪</span> 退出登录
        </button>
        <router-link to="/" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-all">
          <span class="text-lg">←</span> 返回网站
        </router-link>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 ml-64 p-8 min-h-screen">
      <!-- Loading -->
      <div v-if="loadingData" class="flex items-center justify-center min-h-[80vh]">
        <div class="loader-circle mb-6"></div>
        <span class="text-gray-500 font-mono ml-4">加载中...</span>
      </div>

      <!-- Not seeded -->
      <div v-else-if="!hasData" class="flex items-center justify-center min-h-[80vh]">
        <div class="glass-card rounded-3xl p-12 text-center max-w-lg">
          <div class="text-5xl mb-4">🌱</div>
          <h2 class="text-2xl font-bold text-white mb-2">初始化数据</h2>
          <p class="text-gray-400 mb-6">数据库还没有内容，点击下方按钮从模板导入默认数据</p>
          <div v-if="seedError" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2 mb-4">{{ seedError }}</div>
          <button @click="handleSeed" :disabled="seeding"
            class="px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold hover:scale-105 transition-transform disabled:opacity-50">
            {{ seeding ? '正在导入...' : '🌱 初始化默认数据' }}
          </button>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else-if="activeTab === 'dashboard'" class="space-y-6">
        <h1 class="text-3xl font-bold text-white mb-6">仪表盘</h1>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card rounded-2xl p-6">
            <div class="text-3xl font-black gradient-text mb-1">{{ state.projects.length }}</div>
            <div class="text-xs text-gray-500 font-mono">作品数量</div>
          </div>
          <div class="glass-card rounded-2xl p-6">
            <div class="text-3xl font-black gradient-text mb-1">{{ state.skills.length }}</div>
            <div class="text-xs text-gray-500 font-mono">技能数量</div>
          </div>
          <div class="glass-card rounded-2xl p-6">
            <div class="text-3xl font-black gradient-text mb-1">{{ socialLinks.length }}</div>
            <div class="text-xs text-gray-500 font-mono">社交链接</div>
          </div>
          <div class="glass-card rounded-2xl p-6">
            <div class="text-3xl font-black gradient-text mb-1">{{ state.profile ? '✓' : '✗' }}</div>
            <div class="text-xs text-gray-500 font-mono">个人信息</div>
          </div>
        </div>
      </div>

      <!-- Tab components -->
      <ProjectManager v-else-if="activeTab === 'projects'" />
      <SkillManager v-else-if="activeTab === 'skills'" />
      <ProfileEditor v-else-if="activeTab === 'profile'" />
      <ContactManager v-else-if="activeTab === 'contact'" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useData, useAdmin } from '../composables/useData.js'
import { adminSignOut, syncSchema } from '../lib/api.js'
import ProjectManager from '../components/admin/ProjectManager.vue'
import SkillManager from '../components/admin/SkillManager.vue'
import ProfileEditor from '../components/admin/ProfileEditor.vue'
import ContactManager from '../components/admin/ContactManager.vue'

const router = useRouter()
const { state, fetchAll, socialLinks } = useData()
const { initializeData } = useAdmin()
const loadingData = ref(true)
const seeding = ref(false)
const seedError = ref('')

const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: '仪表盘', icon: '📊' },
  { id: 'projects', label: '作品管理', icon: '📁' },
  { id: 'skills', label: '技能管理', icon: '💡' },
  { id: 'profile', label: '个人信息', icon: '👤' },
  { id: 'contact', label: '联系信息', icon: '✉️' },
]

const hasData = computed(() =>
  state.profile || state.projects.length || state.skills.length
)

onMounted(async () => {
  // 进入后台先静默同步表结构，确保 video 等新字段存在（失败可忽略，也可手动点同步按钮）
  try {
    await syncSchema()
  } catch (e) {
    console.warn('同步表结构失败，可稍后在作品管理页点「同步数据表」按钮：', e.message)
  }
  await fetchAll()
  loadingData.value = false
})

async function handleSeed() {
  seeding.value = true
  seedError.value = ''
  try {
    await initializeData()
  } catch (e) {
    seedError.value = e.message || '初始化失败'
    console.error('Seed failed:', e)
  }
  seeding.value = false
}

async function handleLogout() {
  await adminSignOut()
  router.push('/admin/login')
}
</script>

<style scoped>
.loader-circle {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
