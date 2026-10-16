<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-white">个人信息</h1>

    <div v-if="!state.profile" class="glass-card rounded-2xl p-8 text-center text-gray-500">
      暂无个人信息数据，请先点击仪表盘的「初始化默认数据」
    </div>

    <div v-else class="glass-card rounded-2xl p-6 max-w-2xl space-y-5">
      <!-- 头像上传 -->
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center text-3xl flex-shrink-0">
          <img v-if="form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
          <span v-else>🎨</span>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">头像</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            @change="onAvatarChange"
            class="block text-sm text-gray-400 file:mr-3 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-neon-cyan file:to-neon-purple file:text-bg-dark file:font-bold file:cursor-pointer file:hover:scale-105 file:transition-transform" />
          <span v-if="uploadingAvatar" class="text-xs text-neon-cyan mt-1 block">上传中...</span>
        </div>
      </div>

      <!-- 翻译提示 -->
      <div v-if="translateError" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2">
        {{ translateError }}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">姓名（中文）</label>
          <input v-model="form.name_zh" type="text" @blur="autoTranslate('name_en')"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
          <span class="text-xs text-gray-600 mt-1 block">失焦自动翻译</span>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">
            姓名（英文）
            <span v-if="translating.name_en" class="text-neon-cyan ml-2">翻译中...</span>
          </label>
          <input v-model="form.name_en" type="text"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">职业头衔（中文）</label>
          <input v-model="form.title_zh" type="text" placeholder="插画师" @blur="autoTranslate('title_en')"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          <span class="text-xs text-gray-600 mt-1 block">失焦自动翻译</span>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">
            职业头衔（英文）
            <span v-if="translating.title_en" class="text-neon-cyan ml-2">翻译中...</span>
          </label>
          <input v-model="form.title_en" type="text" placeholder="Illustrator"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">一句话标语（中文）</label>
          <input v-model="form.tagline_zh" type="text" placeholder="用画笔描绘世界，用色彩讲述故事" @blur="autoTranslate('tagline_en')"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          <span class="text-xs text-gray-600 mt-1 block">失焦自动翻译</span>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">
            一句话标语（英文）
            <span v-if="translating.tagline_en" class="text-neon-cyan ml-2">翻译中...</span>
          </label>
          <input v-model="form.tagline_en" type="text" placeholder="Painting worlds with brushstrokes, telling stories with colors"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">
          个人简介（中文）
          <span class="text-gray-600 ml-2">失焦自动翻译</span>
        </label>
        <textarea v-model="form.bio_zh" rows="3" @blur="autoTranslate('bio_en')"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
      </div>
      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">
          个人简介（英文）
          <span v-if="translating.bio_en" class="text-neon-cyan ml-2">翻译中...</span>
        </label>
        <textarea v-model="form.bio_en" rows="3"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">所在地（中文）</label>
          <input v-model="form.location_zh" type="text" placeholder="中国 · 北京" @blur="autoTranslate('location_en')"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          <span class="text-xs text-gray-600 mt-1 block">失焦自动翻译</span>
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">
            所在地（英文）
            <span v-if="translating.location_en" class="text-neon-cyan ml-2">翻译中...</span>
          </label>
          <input v-model="form.location_en" type="text" placeholder="Beijing, China"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">邮箱</label>
          <input v-model="form.email" type="email"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">电话</label>
          <input v-model="form.phone" type="text"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <!-- 社交链接编辑 -->
      <div class="pt-4 border-t border-white/5">
        <div class="flex items-center justify-between mb-3">
          <label class="text-xs text-gray-500 font-mono">社交链接</label>
          <button @click="addLink" class="text-xs text-neon-cyan hover:underline">+ 添加链接</button>
        </div>
        <div v-for="(link, idx) in links" :key="idx" class="grid grid-cols-12 gap-2 mb-2 items-center">
          <input v-model="link.icon" placeholder="🔗"
            class="col-span-1 px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-center text-white" />
          <input v-model="link.name" placeholder="名称"
            class="col-span-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          <input v-model="link.url" placeholder="链接 URL"
            class="col-span-6 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
          <button @click="removeLink(idx)"
            class="col-span-1 px-2 py-2 rounded-lg text-neon-pink hover:bg-neon-pink/10 transition-colors text-center">✕</button>
        </div>
        <p v-if="!links.length" class="text-xs text-gray-600">暂无社交链接，点击「+ 添加链接」</p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">年经验</label>
          <input v-model.number="form.years_exp" type="number" min="0"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">项目数</label>
          <input v-model.number="form.projects_count" type="number" min="0"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">客户数</label>
          <input v-model.number="form.clients_count" type="number" min="0"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div v-if="error" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2">{{ error }}</div>
      <div v-if="saved" class="text-sm text-green-400 bg-green-400/10 rounded-lg px-4 py-2">✓ 保存成功</div>

      <button @click="handleSave" :disabled="saving"
        class="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50">
        {{ saving ? '保存中...' : '保存修改' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useData, useAdmin } from '../../composables/useData.js'
import { uploadFile, translateText } from '../../lib/api.js'

const { state } = useData()
const { saveProfile } = useAdmin()

const saving = ref(false)
const error = ref('')
const saved = ref(false)
const uploadingAvatar = ref(false)
const links = ref([])

// 翻译状态：每个英文字段独立 loading
const translating = ref({
  name_en: false,
  title_en: false,
  tagline_en: false,
  bio_en: false,
  location_en: false,
})
const translateError = ref('')

const form = ref({})

// 中文失焦自动翻译到对应英文框
// enField: 'name_en' / 'title_en' / 'tagline_en' / 'bio_en' / 'location_en'
async function autoTranslate(enField) {
  const zhField = enField.replace('_en', '_zh')
  const text = (form.value[zhField] || '').toString().trim()
  if (!text) return // 中文为空不触发
  translating.value[enField] = true
  translateError.value = ''
  try {
    const data = await translateText(text)
    if (data.translated) {
      form.value[enField] = data.translated
    } else {
      translateError.value = `${enField} 翻译未返回结果`
      setTimeout(() => { translateError.value = '' }, 3000)
    }
  } catch (e) {
    translateError.value = `${enField} 翻译失败: ${e.message}`
    setTimeout(() => { translateError.value = '' }, 5000)
  } finally {
    translating.value[enField] = false
  }
}

function parseSocialLinks(raw) {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || [])
    return Array.isArray(arr) ? arr.map(l => ({ ...l })) : []
  } catch {
    return []
  }
}

onMounted(() => {
  if (state.profile) {
    form.value = { ...state.profile }
    links.value = parseSocialLinks(state.profile.social_links)
  }
})

async function onAvatarChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  uploadingAvatar.value = true
  try {
    form.value.avatar = await uploadFile(file, 'avatars')
  } catch (err) {
    alert('头像上传失败: ' + (err.message || err))
  }
  uploadingAvatar.value = false
}

function addLink() {
  links.value.push({ name: '', url: '', icon: '🔗' })
}

function removeLink(idx) {
  links.value.splice(idx, 1)
}

async function handleSave() {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    await saveProfile({
      id: form.value.id,
      name_zh: form.value.name_zh || '',
      name_en: form.value.name_en || '',
      title_zh: form.value.title_zh || '',
      title_en: form.value.title_en || '',
      tagline_zh: form.value.tagline_zh || '',
      tagline_en: form.value.tagline_en || '',
      bio_zh: form.value.bio_zh || '',
      bio_en: form.value.bio_en || '',
      location_zh: form.value.location_zh || '',
      location_en: form.value.location_en || '',
      email: form.value.email || '',
      phone: form.value.phone || '',
      years_exp: form.value.years_exp || 0,
      projects_count: form.value.projects_count || 0,
      clients_count: form.value.clients_count || 0,
      avatar: form.value.avatar || '',
      social_links: JSON.stringify(links.value.filter(l => l.name || l.url)),
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    error.value = e.message
  }
  saving.value = false
}
</script>
