<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">作品管理</h1>
      <div class="flex items-center gap-2">
        <button @click="syncTable" :disabled="syncing"
          class="px-5 py-3 rounded-xl glass-card text-gray-400 text-sm hover:text-neon-cyan transition-colors disabled:opacity-50">
          {{ syncing ? '同步中...' : '🔧 同步数据表' }}
        </button>
        <button @click="startAdd"
          class="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform">
          + 新增作品
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-if="!editing" class="space-y-3">
      <div v-for="project in state.projects" :key="project.id"
        class="glass-card rounded-2xl p-5 flex items-center gap-4 group">
        <!-- Thumbnail -->
        <div class="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-xl flex-shrink-0"
          :class="project.image || project.video ? '' : 'bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20'">
          <img v-if="project.image" :src="project.image" class="w-full h-full object-cover" />
          <video v-else-if="project.video" :src="project.video" class="w-full h-full object-cover" muted />
          <span v-else>{{ categoryIcons[project.category] || '🎨' }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="text-white font-bold truncate">{{ project.title_zh || project.title_en }}</h3>
            <span class="px-2 py-0.5 rounded-md bg-white/5 text-xs font-mono text-gray-400">{{ project.category }}</span>
            <span v-if="project.featured" class="px-2 py-0.5 rounded-md bg-neon-pink/10 text-xs text-neon-pink">★ 精选</span>
            <span v-if="project.video" class="px-2 py-0.5 rounded-md bg-neon-cyan/10 text-xs text-neon-cyan">▶ 视频</span>
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
            <input v-model="form.title_zh" type="text" placeholder="春日少女"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">标题（英文）</label>
            <input v-model="form.title_en" type="text" placeholder="Spring Girl"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">分类</label>
            <select v-model="form.category"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none">
              <option value="illustration">插画</option>
              <option value="character">角色</option>
              <option value="scene">场景</option>
              <option value="commercial">商业</option>
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
          <textarea v-model="form.desc_zh" rows="2" placeholder="作品描述..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">描述（英文）</label>
          <textarea v-model="form.desc_en" rows="2" placeholder="Artwork description..."
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">标签（逗号分隔）</label>
          <input v-model="tagsInput" type="text" placeholder="Procreate, 角色设计, 数字绘画"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <!-- Image Upload -->
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">作品图片（jpg / png / webp / gif）</label>
          <div class="flex items-center gap-3">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              @change="onFileChange($event, 'image', 'artworks')"
              class="block w-full text-sm text-gray-400 file:mr-3 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-neon-cyan file:to-neon-purple file:text-bg-dark file:font-bold file:cursor-pointer file:hover:scale-105 file:transition-transform" />
            <span v-if="uploading.image" class="text-xs text-neon-cyan whitespace-nowrap">上传中...</span>
          </div>
          <p class="text-xs text-gray-600 mt-2">或粘贴图片链接：</p>
          <input v-model="form.image" type="text" placeholder="https://example.com/artwork.jpg"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none mt-1" />
          <div v-if="form.image" class="mt-2 rounded-xl overflow-hidden h-32 bg-white/5">
            <img :src="form.image" class="w-full h-full object-cover" @error="onImgError" />
          </div>
        </div>
        <!-- Video Upload -->
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">作品视频（可选，mp4 / webm / mov）</label>
          <div class="flex items-center gap-3">
            <input type="file" accept="video/mp4,video/webm,video/quicktime"
              @change="onFileChange($event, 'video', 'videos')"
              class="block w-full text-sm text-gray-400 file:mr-3 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-neon-cyan file:to-neon-purple file:text-bg-dark file:font-bold file:cursor-pointer file:hover:scale-105 file:transition-transform" />
            <span v-if="uploading.video" class="text-xs text-neon-cyan whitespace-nowrap">上传中...</span>
          </div>
          <p class="text-xs text-gray-600 mt-2">或粘贴视频链接：</p>
          <input v-model="form.video" type="text" placeholder="https://example.com/process.mp4"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none mt-1" />
          <div v-if="form.video" class="mt-2 rounded-xl overflow-hidden h-32 bg-white/5">
            <video :src="form.video" class="w-full h-full object-cover" muted controls />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">链接</label>
            <input v-model="form.link" type="text" placeholder="https://..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 font-mono mb-2">外部链接（如 Behance）</label>
            <input v-model="form.github" type="text" placeholder="https://..."
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
import { ref, reactive } from 'vue'
import { useData, useAdmin } from '../../composables/useData.js'
import { syncSchema, uploadFile } from '../../lib/api.js'

const { state } = useData()
const { addProject, updateProject, deleteProject } = useAdmin()

const editing = ref(false)
const saving = ref(false)
const error = ref('')
const syncing = ref(false)
const tagsInput = ref('')
const uploading = reactive({ image: false, video: false })

async function syncTable() {
  syncing.value = true
  try {
    const res = await syncSchema()
    if (res && res.success) {
      alert('数据表同步成功！（已确保视频字段等结构存在）')
    } else {
      alert('同步完成')
    }
  } catch (e) {
    alert('同步失败: ' + e.message)
  }
  syncing.value = false
}

const categoryIcons = { illustration: '🎨', character: '👤', scene: '🏔️', commercial: '💼' }

const form = ref({
  id: null,
  title_zh: '', title_en: '',
  category: 'illustration',
  desc_zh: '', desc_en: '',
  image: '', video: '',
  link: '', github: '',
  sort_order: 1,
  featured: false,
})

function startAdd() {
  form.value = {
    id: null, title_zh: '', title_en: '', category: 'illustration',
    desc_zh: '', desc_en: '', image: '', video: '', link: '', github: '',
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

function onImgError(e) {
  e.target.style.display = 'none'
}

function onFileChange(e, field, folder) {
  const file = e.target.files?.[0]
  e.target.value = '' // 允许再次选择同一文件
  if (!file) return
  uploadToField(file, field, folder)
}

async function uploadToField(file, field, folder) {
  uploading[field] = true
  try {
    const url = await uploadFile(file, folder)
    form.value[field] = url
  } catch (err) {
    alert('上传失败: ' + (err.message || err))
  }
  uploading[field] = false
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
      image: form.value.image || '',
      video: form.value.video || '',
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
