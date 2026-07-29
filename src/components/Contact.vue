<template>
  <section id="contact" class="relative py-24">
    <div class="max-w-5xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="reveal text-4xl md:text-5xl font-black mb-3">
          <span class="gradient-text">{{ t.contact.title }}</span>
        </h2>
        <p class="reveal text-gray-500 font-mono text-sm tracking-widest">{{ t.contact.subtitle }}</p>
      </div>

      <div class="grid md:grid-cols-5 gap-8">
        <!-- Left: Contact Info -->
        <div class="reveal-left md:col-span-2 space-y-6">
          <h3 class="text-lg font-bold text-white mb-4">{{ t.contact.info }}</h3>

          <!-- Location -->
          <div class="flex items-center gap-4 glass-card rounded-2xl p-4">
            <div class="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center text-lg">📍</div>
            <div>
              <div class="text-xs text-gray-500 font-mono">{{ i18n.locale === 'zh' ? '位置' : 'Location' }}</div>
              <div class="text-sm text-gray-200">{{ t.contact.location }}</div>
            </div>
          </div>

          <!-- Email -->
          <div class="flex items-center gap-4 glass-card rounded-2xl p-4">
            <div class="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center text-lg">✉️</div>
            <div>
              <div class="text-xs text-gray-500 font-mono">{{ t.contact.emailLabel }}</div>
              <div class="text-sm text-gray-200">{{ t.contact.email }}</div>
            </div>
          </div>

          <!-- Phone -->
          <div class="flex items-center gap-4 glass-card rounded-2xl p-4">
            <div class="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center text-lg">📱</div>
            <div>
              <div class="text-xs text-gray-500 font-mono">{{ t.contact.phoneLabel }}</div>
              <div class="text-sm text-gray-200">{{ t.contact.phone }}</div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="pt-4">
            <div class="text-xs text-gray-500 font-mono mb-3">{{ t.contact.social }}</div>
            <div class="flex gap-3">
              <a
                v-for="social in t.contact.socials"
                :key="social.name"
                :href="social.url"
                class="w-11 h-11 rounded-xl glass-card flex items-center justify-center text-lg hover:border-neon-cyan/40 hover:scale-110 transition-all"
                :title="social.name"
              >
                {{ social.icon }}
              </a>
            </div>
          </div>
        </div>

        <!-- Right: Contact Form -->
        <div class="reveal-right md:col-span-3">
          <form @submit.prevent="handleSubmit" class="glass-card rounded-3xl p-8 space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-xs text-gray-500 font-mono mb-2">{{ t.contact.name }}</label>
              <input
                v-model="form.name"
                type="text"
                :placeholder="t.contact.placeholderName"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs text-gray-500 font-mono mb-2">{{ t.contact.email }}</label>
              <input
                v-model="form.email"
                type="email"
                :placeholder="t.contact.placeholderEmail"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                required
              />
            </div>

            <!-- Message -->
            <div>
              <label class="block text-xs text-gray-500 font-mono mb-2">{{ t.contact.message }}</label>
              <textarea
                v-model="form.message"
                rows="5"
                :placeholder="t.contact.placeholderMessage"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all resize-none"
                required
              ></textarea>
            </div>

            <div v-if="error" class="text-sm text-neon-pink bg-neon-pink/10 rounded-lg px-4 py-2">
              {{ error }}
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading || sent"
            >
              {{ sent ? t.contact.sent : (loading ? '发送中...' : t.contact.send) }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue'
import { createContactMessage } from '../lib/api.js'

const i18n = inject('i18n')
const t = i18n.t

const form = ref({ name: '', email: '', message: '' })
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    await createContactMessage(form.value)
    sent.value = true
    form.value = { name: '', email: '', message: '' }
    setTimeout(() => {
      sent.value = false
    }, 3000)
  } catch (e) {
    error.value = e.message || '发送失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
