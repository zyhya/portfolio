<template>
  <footer class="relative py-12 border-t border-white/5">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- Left: Logo & Copyright -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-bold text-bg-dark text-sm">
            M
          </div>
          <div>
            <div class="text-sm font-bold text-white">Ming Zhang</div>
            <div class="text-xs text-gray-500 font-mono">© {{ year }} {{ t.footer.rights }}</div>
          </div>
        </div>

        <!-- Center: Quick Links -->
        <div class="flex gap-6">
          <a
            v-for="(item, key) in t.nav"
            :key="key"
            :href="`#${key}`"
            class="text-xs text-gray-500 hover:text-neon-cyan transition-colors font-medium"
          >
            {{ item }}
          </a>
        </div>

        <!-- Right: Made With -->
        <div class="text-xs text-gray-500 font-mono">
          {{ t.footer.madeWith }}
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { inject } from 'vue'

const i18n = inject('i18n')
const t = i18n.t

const year = new Date().getFullYear()
</script>
