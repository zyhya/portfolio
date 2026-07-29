<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">社交链接</h1>
      <button @click="startAdd"
        class="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform">
        + 新增链接
      </button>
    </div>

    <!-- List -->
    <div v-if="!editing" class="space-y-3">
      <div v-for="social in state.socials" :key="social.id"
        class="glass-card rounded-2xl p-4 flex items-center gap-4 group">
        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">{{ social.icon }}</div>
        <div class="flex-1">
          <div class="text-white font-medium text-sm">{{ social.name }}</div>
          <div class="text-xs text-gray-500 truncate">{{ social.url }}</div>
        </div>
        <span class="text-xs text-gray-600 font-mono">#{{ social.sort_order }}</span>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="startEdit(social)" class="px-2 py-1 rounded-lg glass-card text-xs text-neon-cyan">编辑</button>
          <button @click="handleDelete(social)" class="px-2 py-1 rounded-lg glass-card text-xs text-neon-pink">删除</button>
        </div>
      </div>
      <div v-if="!state.socials.length" class="text-center py-12 text-gray-600">暂无链接，点击右上角添加</div>
    </div>

    <!-- Form -->
    <div v-else class="glass-card rounded-2xl p-6 max-w-md space-y-4">
      <h2 class="text-xl font-bold text-white">{{ form.id ? '编辑链接' : '新增链接' }}</h2>
      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">名称</label>
        <input v-model="form.name" type="text" placeholder="GitHub"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">图标（Emoji）</label>
        <input v-model="form.icon" type="text" placeholder="🐙"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">链接</label>
        <input v-model="form.url" type="text" placeholder="https://github.com/username"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">排序</label>
        <input v-model.number="form.sort_order" type="number" min="1"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
      </div>
      <div v-if="error" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2">{{ error }}</div>
      <div class="flex gap-3 pt-2">
        <button @click="handleSave" :disabled="saving"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button @click="editing = false" class="px-6 py-3 rounded-xl glass-card text-gray-400 text-sm hover:text-white transition-colors">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useData, useAdmin } from '../../composables/useData.js'

const { state } = useData()
const { addSocial, updateSocial, deleteSocial } = useAdmin()

const editing = ref(false)
const saving = ref(false)
const error = ref('')
const form = ref({ id: null, name: '', icon: '🔗', url: '', sort_order: 1 })

function startAdd() {
  form.value = { id: null, name: '', icon: '🔗', url: '', sort_order: state.socials.length + 1 }
  error.value = ''
  editing.value = true
}

function startEdit(social) {
  form.value = { ...social }
  error.value = ''
  editing.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) {
    error.value = '请输入名称'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const data = {
      name: form.value.name,
      icon: form.value.icon || '🔗',
      url: form.value.url || '#',
      sort_order: form.value.sort_order || 1,
    }
    if (form.value.id) {
      await updateSocial(form.value.id, data)
    } else {
      await addSocial(data)
    }
    editing.value = false
  } catch (e) {
    error.value = e.message
  }
  saving.value = false
}

async function handleDelete(social) {
  if (!confirm(`确定删除「${social.name}」？`)) return
  await deleteSocial(social.id)
}
</script>
