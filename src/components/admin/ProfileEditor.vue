<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-white">个人信息</h1>

    <div v-if="!state.profile" class="glass-card rounded-2xl p-8 text-center text-gray-500">
      暂无个人信息数据，请先点击仪表盘的「初始化默认数据」
    </div>

    <div v-else class="glass-card rounded-2xl p-6 max-w-2xl space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">姓名（中文）</label>
          <input v-model="form.name_zh" type="text"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">姓名（英文）</label>
          <input v-model="form.name_en" type="text"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">职业头衔（中文）</label>
          <input v-model="form.title_zh" type="text" placeholder="插画师"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">职业头衔（英文）</label>
          <input v-model="form.title_en" type="text" placeholder="Illustrator"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">一句话标语（中文）</label>
          <input v-model="form.tagline_zh" type="text" placeholder="用画笔描绘世界，用色彩讲述故事"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">一句话标语（英文）</label>
          <input v-model="form.tagline_en" type="text" placeholder="Painting worlds with brushstrokes, telling stories with colors"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">个人简介（中文）</label>
        <textarea v-model="form.bio_zh" rows="3"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
      </div>
      <div>
        <label class="block text-xs text-gray-500 font-mono mb-2">个人简介（英文）</label>
        <textarea v-model="form.bio_en" rows="3"
          class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-cyan/50 focus:outline-none resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">所在地（中文）</label>
          <input v-model="form.location_zh" type="text" placeholder="中国 · 北京"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 font-mono mb-2">所在地（英文）</label>
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

const { state } = useData()
const { saveProfile } = useAdmin()

const saving = ref(false)
const error = ref('')
const saved = ref(false)

const form = ref({})

onMounted(() => {
  if (state.profile) {
    form.value = { ...state.profile }
  }
})

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
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    error.value = e.message
  }
  saving.value = false
}
</script>
