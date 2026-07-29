<template>
  <section id="skills" class="relative py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="reveal text-4xl md:text-5xl font-black mb-3">
          <span class="gradient-text">{{ t.skills.title }}</span>
        </h2>
        <p class="reveal text-gray-500 font-mono text-sm tracking-widest">{{ t.skills.subtitle }}</p>
      </div>

      <!-- Skills Grid -->
      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="(catItems, catKey) in t.skills.items"
          :key="catKey"
          class="reveal-scale glass-card rounded-3xl p-8 group"
        >
          <!-- Category Title -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center text-lg">
              {{ categoryIcons[catKey] }}
            </div>
            <h3 class="text-lg font-bold text-white">{{ t.skills.categories[catKey] }}</h3>
          </div>

          <!-- Skill Items -->
          <div class="space-y-4">
            <div v-for="(skill, i) in catItems" :key="i">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-300 font-medium">{{ skill.name }}</span>
                <span class="text-xs text-gray-500 font-mono">{{ skill.level }}%</span>
              </div>
              <!-- Progress Bar -->
              <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-1000 ease-out"
                  :style="{ width: isVisible ? skill.level + '%' : '0%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'

const i18n = inject('i18n')
const t = i18n.t

const isVisible = ref(false)
const categoryIcons = {
  frontend: '💻',
  backend: '⚙️',
  design: '🎨',
  devops: '🚀',
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          isVisible.value = true
        }, 300)
      }
    },
    { threshold: 0.2 }
  )

  const section = document.getElementById('skills')
  if (section) observer.observe(section)
})
</script>
