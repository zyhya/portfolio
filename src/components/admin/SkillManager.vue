<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">技能管理</h1>
      <button @click="startAdd"
        class="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform">
        + 新增技能
      </button>
    </div>

    <!-- List grouped by category -->
    <div v-if="!editing" class="space-y-6">
      <div v-for="(skills, cat) in groupedSkills" :key="cat" class="glass-card rounded-2xl p-5">
        <h3 class="text-sm font-bold text-neon-cyan mb-3 flex items-center gap-2">
          <span>{{ categoryIcons[cat] || '💡' }}</span>
          {{ categoryLabels[cat] || cat }}
          <span class="text-gray-600 font-normal">({{ skills.length }})</span>
        </h3>
        <div class="space-y-2">
          <div v-for="skill in skills" :key="skill.id"
            class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
            <div class="flex-1">
              <span class="text-white font-medium text-sm">{{ skill.name }}</span>
            </div>
            <div class="w-32 h-2 rounded-full bg-white/5 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                :style="{ width: skill.level + '%' }"></div>
            </div>
            <span class="text-xs text-gray-500 font-mono w-10 text-right">{{ skill.level }}%</span>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="startEdit(skill)" class="px-2 py-1 rounded-lg glass-card text-xs text-neon-cyan">编辑</button>
              <button @click="handleDelete(skill)" class="px-2 py-1 rounded-lg glass-card text-xs text-neon-pink">删除</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!state.skills.length" class="text-center py-12 text-gray-600">暂无技能，点击右上角添加</div>
    </div>

    <!-- Form -->
    <div v-else class="glass-card rounded-2xl p-6 max-w-md">
      <h2 class="text-xl font-bold text-white mb-4">{{ form.id ? '编辑技能' : '新增技能' }}</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">分类</label>
          <select v-model="form.category"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none">
            <option value="illustration">插画绘制</option>
            <option value="digital">数字绘画</option>
            <option value="traditional">传统媒介</option>
            <option value="animation">动画与3D</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">技能名称</label>
          <input v-model="form.name" type="text" placeholder="角色设计"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">熟练度: {{ form.level }}%</label>
          <input v-model.number="form.level" type="range" min="0" max="100"
            class="w-full accent-neon-cyan" />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData, useAdmin } from '../../composables/useData.js'

const { state } = useData()
const { addSkill, updateSkill, deleteSkill } = useAdmin()

const editing = ref(false)
const saving = ref(false)
const error = ref('')

const categoryIcons = { illustration: '✏️', digital: '💻', traditional: '🖌️', animation: '🎬' }
const categoryLabels = { illustration: '插画绘制', digital: '数字绘画', traditional: '传统媒介', animation: '动画与3D' }

const form = ref({ id: null, category: 'illustration', name: '', level: 80, sort_order: 1 })

const groupedSkills = computed(() => {
  const grouped = {}
  state.skills.forEach(s => {
    const cat = s.category || 'illustration'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(s)
  })
  return grouped
})

function startAdd() {
  form.value = { id: null, category: 'illustration', name: '', level: 80, sort_order: state.skills.length + 1 }
  error.value = ''
  editing.value = true
}

function startEdit(skill) {
  form.value = { ...skill }
  error.value = ''
  editing.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) {
    error.value = '请输入技能名称'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const data = {
      category: form.value.category,
      name: form.value.name,
      level: form.value.level,
      sort_order: form.value.sort_order || 1,
    }
    if (form.value.id) {
      await updateSkill(form.value.id, data)
    } else {
      await addSkill(data)
    }
    editing.value = false
  } catch (e) {
    error.value = e.message
  }
  saving.value = false
}

async function handleDelete(skill) {
  if (!confirm(`确定删除「${skill.name}」？`)) return
  await deleteSkill(skill.id)
}
</script>
