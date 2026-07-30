<template>
  <section id="about" class="relative py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="reveal text-4xl md:text-5xl font-black mb-3">
          <span class="gradient-text">{{ t.about.title }}</span>
        </h2>
        <p class="reveal text-gray-500 font-mono text-sm tracking-widest">{{ t.about.subtitle }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Left: Avatar / Visual -->
        <div class="reveal-left relative">
          <div class="relative w-full max-w-sm mx-auto">
            <!-- Decorative rings -->
            <div class="absolute inset-0 rounded-3xl border border-neon-cyan/20 animate-spin-slow"></div>
            <div class="absolute inset-4 rounded-3xl border border-neon-purple/20 animate-spin-slow" style="animation-direction: reverse; animation-duration: 15s;"></div>

            <!-- Avatar placeholder -->
            <div class="relative m-8 rounded-3xl glass-card overflow-hidden aspect-square flex items-center justify-center">
              <div class="text-9xl gradient-text font-black opacity-50">韩</div>
              <!-- Floating badges -->
              <div class="absolute top-4 right-4 px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-xs font-mono border border-neon-green/30">
                ● Available
              </div>
            </div>

            <!-- Floating tech icons -->
            <div class="absolute -top-4 -right-4 w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-2xl animate-float">
              🎨
            </div>
            <div class="absolute -bottom-4 -left-4 w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-2xl animate-float" style="animation-delay: 2s">
              ✏️
            </div>
          </div>
        </div>

        <!-- Right: Bio & Stats -->
        <div class="reveal-right space-y-6">
          <p class="text-gray-300 text-lg leading-relaxed">
            {{ t.about.bio1 }}
          </p>
          <p class="text-gray-400 leading-relaxed">
            {{ t.about.bio2 }}
          </p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div
              v-for="(stat, i) in t.about.stats"
              :key="i"
              class="glass-card rounded-2xl p-5 text-center group hover:border-neon-cyan/40 transition-all"
            >
              <div class="text-3xl font-black gradient-text mb-1 group-hover:scale-110 transition-transform">{{ stat.number }}</div>
              <div class="text-xs text-gray-500 font-mono tracking-wide">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue'

const i18n = inject('i18n')
const t = i18n.t
</script>
