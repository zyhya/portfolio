<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">作品管理</h1>
      <button @click="startAdd"
        class="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform">
        + 新增作品
      </button>
    </div>

    <!-- List -->
    <div v-if="!editing" class="space-y-3">
      <div v-for="project in state.projects" :key="project.id"
        class="glass-card rounded-2xl p-5 flex items-center gap-4 group">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center text-xl">
          {{ categoryIcons[project.category] || '📦' }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-white font-bold truncate">{{ project.title_zh || project.title_en }}</h3>
            <span class="px-2 py-0.5 rounded-md bg-white/5 text-xs font-mono text-gray-400">{{ project.category }}</span>
            <span v-if="project.featured" class="px-2 py-0.5 rounded-md bg-neon-pink/10 text-xs text-neon-pink">★ 精选</span>
          </div>
          <p class="text-sm text-gray-500 truncate mt-1">{{ project.desc_zh || project.desc_en }}</p>
          <div v-if="project.tags?.length" class="flex gap-1.5 mt-2">
            <span v-for="t in project.tags" :key="t" class="px-1.5 py-0.5 rounded bg-white/5 text-xs font-mono text-gray-500">{{ t }}</span>
          </div>
        </div>
        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="startEdit(project)" class="px-3 py-2 rounded-lg glass-card text-sm text-neon-cyan hover:scale-105 transition-transform">编辑</button>
          <button @click="handleDelete(project)" class="px-3 py-2 rounded-lg glass-card text-sm text-neon-pink hover:scale-105 transition-transform">删除</button>
        </div>
      </div>
      <div v-if="!state.projects.length" class="text-center py-12 text-gray-600">
        暂无作品，点击右上角添加
      </div>
    </div>

    <!-- Form -->
    <div v-else class="glass-card rounded-2xl p-6 max-w-2xl">
      <h2 class="text-xl font-bold text-white mb-4">{{ form.id ? '编辑作品' : '新增作品' }}</h2>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">标题（中文）</label>
            <input v-model="form.title_zh" type="text" placeholder="智能数据看板"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">标题（英文）</label>
            <input v-model="form.title_en" type="text" placeholder="Smart Dashboard"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">分类</label>
            <select v-model="form.category"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none">
              <option value="web">网站</option>
              <option value="app">应用</option>
              <option value="game">游戏</option>
              <option value="design">设计</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">排序</label>
            <input v-model.number="form.sort_order" type="number" min="1"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">描述（中文）</label>
          <textarea v-model="form.desc_zh" rows="2" placeholder="项目描述..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">描述（英文）</label>
          <textarea v-model="form.desc_en" rows="2" placeholder="Project description..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">技术栈（逗号分隔）</label>
          <input v-model="tagsInput" type="text" placeholder="Vue 3, D3.js, WebSocket"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">链接</label>
            <input v-model="form.link" type="text" placeholder="https://..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">GitHub</label>
            <input v-model="form.github" type="text" placeholder="https://github.com/..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="form.featured" type="checkbox" class="w-4 h-4 accent-neon-cyan" />
          <span class="text-sm text-gray-300">设为精选作品</span>
        </label>

        <div v-if="error" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2">{{ error }}</div>

        <div class="flex gap-3 pt-2">
          <button @click="handleSave" :disabled="saving"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button @click="editing = false"
            class="px-6 py-3 rounded-xl glass-card text-gray-400 text-sm hover:text-white transition-colors">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useData, useAdmin } from '../../composables/useData.js'

const { state } = useData()
const { addProject, updateProject, deleteProject } = useAdmin()

const editing = ref(false)
const saving = ref(false)
const error = ref('')
const tagsInput = ref('')

const categoryIcons = { web: '🌐', app: '📱', game: '🎮', design: '🎨' }

const form = ref({
  id: null,
  title_zh: '', title_en: '',
  category: 'web',
  desc_zh: '', desc_en: '',
  link: '', github: '',
  sort_order: 1,
  featured: false,
})

function startAdd() {
  form.value = {
    id: null, title_zh: '', title_en: '', category: 'web',
    desc_zh: '', desc_en: '', link: '', github: '',
    sort_order: state.projects.length + 1, featured: false,
  }
  tagsInput.value = ''
  error.value = ''
  editing.value = true
}

function startEdit(project) {
  form.value = { ...project }
  tagsInput.value = (project.tags || []).join(', ')
  error.value = ''
  editing.value = true
}

async function handleSave() {
  saving.value = true
  error.value = ''
  try {
    const data = {
      title_zh: form.value.title_zh,
      title_en: form.value.title_en,
      category: form.value.category,
      desc_zh: form.value.desc_zh,
      desc_en: form.value.desc_en,
      tags: tagsInput.value.split(',').map(s => s.trim()).filter(Boolean),
      link: form.value.link || '',
      github: form.value.github || '',
      sort_order: form.value.sort_order || 1,
      featured: form.value.featured || false,
    }
    if (form.value.id) {
      await updateProject(form.value.id, data)
    } else {
      await addProject(data)
    }
    editing.value = false
  } catch (e) {
    error.value = e.message
  }
  saving.value = false
}

async function handleDelete(project) {
  if (!confirm(`确定删除「${project.title_zh || project.title_en}」？`)) return
  await deleteProject(project.id)
}
</script>
