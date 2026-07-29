<template>
  <div class="noise-overlay min-h-screen bg-bg-dark text-gray-200 relative overflow-hidden">
    <!-- Loading Screen -->
    <transition name="fade">
      <div v-if="loading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-dark">
        <div class="loader-circle mb-6"></div>
        <div class="text-neon-cyan font-mono text-sm tracking-widest">LOADING...</div>
      </div>
    </transition>

    <!-- Grid Background -->
    <div class="fixed inset-0 grid-bg pointer-events-none"></div>

    <!-- Animated Gradient Orbs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-neon-purple/10 blur-[120px] animate-float"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-neon-cyan/10 blur-[120px] animate-float" style="animation-delay: 2s"></div>
      <div class="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-neon-pink/5 blur-[100px] animate-float" style="animation-delay: 4s"></div>
    </div>

    <!-- Router View -->
    <div v-show="!loading">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { i18n } from './i18n.js'
import { useData } from './composables/useData.js'

provide('i18n', i18n)

const { fetchAll } = useData()
const loading = ref(true)

onMounted(async () => {
  await fetchAll()
  setTimeout(() => {
    loading.value = false
    initScrollReveal()
  }, 800)
})

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    },
    { threshold: 0.15 }
  )

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
    observer.observe(el)
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
