<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    :class="scrolled ? 'py-3 bg-bg-dark/80 backdrop-blur-lg border-b border-white/5' : 'py-5'"
  >
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <!-- Logo -->
      <a href="#home" class="flex items-center gap-2 group">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-bold text-bg-dark text-lg group-hover:scale-110 transition-transform">
          韩
        </div>
        <span class="font-bold text-lg gradient-text">Jingwen.art</span>
      </a>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <a
          v-for="(item, key) in t.nav"
          :key="key"
          :href="`#${key}`"
          class="animated-underline text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          {{ item }}
        </a>
      </div>

      <!-- Right Side -->
      <div class="flex items-center gap-4">
        <!-- Language Toggle -->
        <button
          @click="i18n.toggle()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-xs font-mono hover:border-neon-cyan/40 transition-all"
        >
          <span :class="i18n.locale === 'zh' ? 'text-neon-cyan' : 'text-gray-500'">中</span>
          <span class="text-gray-600">/</span>
          <span :class="i18n.locale === 'en' ? 'text-neon-cyan' : 'text-gray-500'">EN</span>
        </button>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenu = !mobileMenu"
          class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
        >
          <span class="w-5 h-0.5 bg-white transition-all" :class="mobileMenu ? 'rotate-45 translate-y-2' : ''"></span>
          <span class="w-5 h-0.5 bg-white transition-all" :class="mobileMenu ? 'opacity-0' : ''"></span>
          <span class="w-5 h-0.5 bg-white transition-all" :class="mobileMenu ? '-rotate-45 -translate-y-2' : ''"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-if="mobileMenu" class="md:hidden absolute top-full left-0 w-full bg-bg-dark/95 backdrop-blur-lg border-b border-white/5">
        <div class="flex flex-col p-6 gap-4">
          <a
            v-for="(item, key) in t.nav"
            :key="key"
            :href="`#${key}`"
            @click="mobileMenu = false"
            class="text-gray-400 hover:text-neon-cyan transition-colors py-2"
          >
            {{ item }}
          </a>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'

const i18n = inject('i18n')
const t = i18n.t

const scrolled = ref(false)
const mobileMenu = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
