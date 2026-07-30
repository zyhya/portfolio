<template>
  <section id="projects" class="relative py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="reveal text-4xl md:text-5xl font-black mb-3">
          <span class="gradient-text">{{ t.projects.title }}</span>
        </h2>
        <p class="reveal text-gray-500 font-mono text-sm tracking-widest">{{ t.projects.subtitle }}</p>
      </div>

      <!-- Filter Buttons -->
      <div class="reveal flex flex-wrap justify-center gap-3 mb-12">
        <button
          v-for="(label, key) in t.projects.filters"
          :key="key"
          @click="activeFilter = key"
          class="px-5 py-2 rounded-full text-sm font-medium transition-all"
          :class="activeFilter === key
            ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark'
            : 'glass-card text-gray-400 hover:text-white'"
        >
          {{ label }}
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(project, i) in filteredProjects"
          :key="i"
          class="reveal-scale group relative rounded-3xl overflow-hidden glass-card tilt-card"
          @mousemove="handleTilt($event)"
          @mouseleave="resetTilt($event)"
          :style="{ transitionDelay: (i * 100) + 'ms' }"
        >
          <!-- Project Visual -->
          <div class="relative h-48 overflow-hidden">
            <!-- Video -->
            <video
              v-if="project.video"
              :src="project.video"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              autoplay
              muted
              loop
              playsinline
            ></video>
            <!-- Image -->
            <img
              v-else-if="project.image"
              :src="project.image"
              :alt="project.title"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <!-- Gradient fallback -->
            <div
              v-else
              class="absolute inset-0 bg-gradient-to-br opacity-90 transition-transform duration-500 group-hover:scale-110"
              :style="{ background: projectGradients[i % projectGradients.length] }"
            ></div>
            <!-- Pattern overlay -->
            <div class="absolute inset-0 opacity-20 svg-pattern"></div>
            <!-- Category Badge -->
            <div class="absolute top-4 left-4 px-3 py-1 rounded-full bg-bg-dark/60 backdrop-blur text-xs font-mono text-white border border-white/10">
              {{ project.categoryLabel }}
            </div>
            <!-- Media type indicator -->
            <div v-if="project.video" class="absolute top-4 right-4 px-2 py-1 rounded-full bg-bg-dark/60 backdrop-blur text-xs font-mono text-neon-cyan border border-white/10">
              ▶ 视频
            </div>
            <!-- Project number -->
            <div class="absolute bottom-4 right-4 text-5xl font-black text-white/10">
              {{ String(i + 1).padStart(2, '0') }}
            </div>
          </div>

          <!-- Project Info -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
              {{ project.title }}
            </h3>
            <p class="text-sm text-gray-400 mb-4 leading-relaxed">
              {{ project.desc }}
            </p>
            <!-- Tech Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tech in project.tech"
                :key="tech"
                class="px-2.5 py-1 rounded-md bg-white/5 text-xs font-mono text-gray-400 border border-white/5"
              >
                {{ tech }}
              </span>
            </div>
            <!-- View Link -->
            <a :href="project.link || '#'" class="inline-flex items-center gap-1.5 text-sm text-neon-cyan hover:gap-3 transition-all font-medium">
              {{ t.projects.viewMore }}
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const i18n = inject('i18n')
const t = i18n.t

const activeFilter = ref('all')

const projectGradients = [
  'linear-gradient(135deg, #00d4ff, #0066ff)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
  'linear-gradient(135deg, #00ff88, #00d4ff)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #14b8a6, #00d4ff)',
]

const filteredProjects = computed(() => {
  const items = t.value.projects.items
  if (activeFilter.value === 'all') return items
  return items.filter((p) => p.category === activeFilter.value)
})

function handleTilt(e) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = (y - centerY) / 20
  const rotateY = (centerX - x) / 20
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
}

function resetTilt(e) {
  e.currentTarget.style.transform = ''
}
</script>
