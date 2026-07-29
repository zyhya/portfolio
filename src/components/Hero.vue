<template>
  <section id="home" class="min-h-screen relative flex items-center justify-center overflow-hidden">
    <!-- Particle Canvas -->
    <canvas ref="canvas" class="absolute inset-0 w-full h-full"></canvas>

    <!-- Content -->
    <div class="relative z-10 text-center px-6 max-w-4xl">
      <!-- Greeting -->
      <div class="reveal active mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
        <span class="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
        <span class="text-sm text-gray-400 font-mono">{{ t.hero.greeting }}</span>
      </div>

      <!-- Name -->
      <h1 class="reveal active text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
        <span class="gradient-text">{{ t.hero.name }}</span>
      </h1>

      <!-- Typing Role -->
      <div class="reveal active text-xl md:text-3xl font-mono text-gray-300 mb-4 h-10 flex items-center justify-center">
        <span class="text-neon-cyan">&gt;</span>
        <span class="ml-2">{{ displayText }}</span>
        <span class="cursor-blink text-neon-cyan ml-1">|</span>
      </div>

      <!-- Subtitle -->
      <p class="reveal active text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
        {{ t.hero.subtitle }}
      </p>

      <!-- CTA Buttons -->
      <div class="reveal active flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#projects"
          class="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-semibold overflow-hidden transition-all hover:scale-105"
          style="animation: pulse-glow 3s ease-in-out infinite"
        >
          <span class="relative z-10">{{ t.hero.cta1 }}</span>
          <div class="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="relative z-10 absolute right-3 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">→</span>
        </a>
        <a
          href="#contact"
          class="px-8 py-4 rounded-xl glass-card text-white font-semibold hover:border-neon-cyan/40 transition-all hover:scale-105"
        >
          {{ t.hero.cta2 }}
        </a>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
      <span class="text-xs text-gray-600 font-mono tracking-widest">{{ t.hero.scroll }}</span>
      <div class="w-5 h-9 rounded-full border-2 border-gray-700 flex items-start justify-center p-1">
        <div class="w-1 h-2 rounded-full bg-neon-cyan animate-bounce"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, watch } from 'vue'

const i18n = inject('i18n')
const t = i18n.t

const canvas = ref(null)
let ctx = null
let animationId = null
let particles = []

// Typing animation
const displayText = ref('')
let roleIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimer = null

function typeRole() {
  const roles = t.value.hero.roles
  const currentRole = roles[roleIndex]

  if (isDeleting) {
    displayText.value = currentRole.substring(0, charIndex - 1)
    charIndex--
  } else {
    displayText.value = currentRole.substring(0, charIndex + 1)
    charIndex++
  }

  let delay = isDeleting ? 50 : 100

  if (!isDeleting && charIndex === currentRole.length) {
    delay = 2000
    isDeleting = true
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false
    roleIndex = (roleIndex + 1) % roles.length
    delay = 500
  }

  typingTimer = setTimeout(typeRole, delay)
}

// Particle system
function initParticles() {
  const c = canvas.value
  if (!c) return
  ctx = c.getContext('2d')
  resizeCanvas()

  particles = []
  const count = Math.min(80, Math.floor((c.width * c.height) / 15000))
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 0.5,
      color: ['#00d4ff', '#a855f7', '#ec4899'][Math.floor(Math.random() * 3)],
    })
  }

  animateParticles()
}

function resizeCanvas() {
  const c = canvas.value
  if (!c || !ctx) return
  c.width = c.offsetWidth
  c.height = c.offsetHeight
}

function animateParticles() {
  if (!ctx || !canvas.value) return
  const c = canvas.value
  ctx.clearRect(0, 0, c.width, c.height)

  // Draw particles
  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy

    if (p.x < 0 || p.x > c.width) p.vx *= -1
    if (p.y < 0 || p.y > c.height) p.vy *= -1

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.globalAlpha = 0.6
    ctx.fill()
  })

  // Draw connections
  ctx.globalAlpha = 1
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = particles[i].color
        ctx.globalAlpha = (1 - dist / 120) * 0.15
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
  ctx.globalAlpha = 1

  animationId = requestAnimationFrame(animateParticles)
}

// Reset typing when language changes
watch(() => i18n.locale, () => {
  clearTimeout(typingTimer)
  displayText.value = ''
  roleIndex = 0
  charIndex = 0
  isDeleting = false
  typeRole()
})

onMounted(() => {
  initParticles()
  typeRole()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  clearTimeout(typingTimer)
  window.removeEventListener('resize', resizeCanvas)
})
</script>
