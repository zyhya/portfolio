<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">联系信息</h1>
      <div class="flex items-center gap-2">
        <button v-if="unreadCount > 0" @click="handleReadAll" :disabled="readingAll"
          class="px-5 py-3 rounded-xl glass-card text-gray-400 text-sm hover:text-neon-cyan transition-colors disabled:opacity-50">
          {{ readingAll ? '处理中...' : `✓ 全部标记已读 (${unreadCount})` }}
        </button>
        <button @click="syncTable" :disabled="syncing"
          class="px-5 py-3 rounded-xl glass-card text-gray-400 text-sm hover:text-neon-cyan transition-colors disabled:opacity-50">
          {{ syncing ? '同步中...' : '🔧 同步数据表' }}
        </button>
        <button @click="refresh" :disabled="refreshing"
          class="px-5 py-3 rounded-xl glass-card text-gray-400 text-sm hover:text-neon-cyan transition-colors disabled:opacity-50">
          {{ refreshing ? '刷新中...' : '🔄 刷新' }}
        </button>
      </div>
    </div>

    <!-- Messages List -->
    <div class="space-y-4">
      <div v-for="message in state.contactMessages" :key="message.id"
        class="glass-card rounded-2xl p-5 group">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center text-lg">
                👤
              </div>
              <div>
                <div class="text-white font-medium">{{ message.name }}</div>
                <div class="text-xs text-gray-500 font-mono">{{ message.email }}</div>
              </div>
              <div v-if="!message.read" class="px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-mono">
                未读
              </div>
            </div>
            <div class="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed pl-[52px]">
              {{ message.message }}
            </div>
            <div class="flex items-center gap-4 mt-3 pl-[52px] text-xs text-gray-600 font-mono">
              <span>🕒 {{ formatDate(message.created_at) }}</span>
              <span v-if="message.ip">🌐 {{ message.ip }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button v-if="!message.read" @click="handleRead(message)" class="px-3 py-2 rounded-lg glass-card text-xs text-neon-cyan hover:bg-neon-cyan/10 transition-colors">
              标记已读
            </button>
            <button @click="handleDelete(message)" class="px-3 py-2 rounded-lg glass-card text-xs text-neon-pink hover:bg-neon-pink/10 transition-colors">
              删除
            </button>
          </div>
        </div>
      </div>

      <div v-if="!state.contactMessages.length" class="text-center py-16 text-gray-600">
        <div class="text-4xl mb-3">📭</div>
        <p>还没有收到任何联系消息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useData, useAdmin } from '../../composables/useData.js'

import { syncSchema } from '../../lib/api.js'

const { state } = useData()
const { refreshContactMessages, removeContactMessage, markContactMessageRead, markAllContactMessagesRead } = useAdmin()

const refreshing = ref(false)
const syncing = ref(false)
const readingAll = ref(false)

const unreadCount = computed(() => state.contactMessages.filter(m => !m.read).length)

async function refresh() {
  refreshing.value = true
  try {
    await refreshContactMessages()
  } catch (e) {
    alert(e.message || '刷新失败')
  } finally {
    refreshing.value = false
  }
}

async function syncTable() {
  syncing.value = true
  try {
    const res = await syncSchema()
    if (res.success) {
      alert('数据表同步成功')
      await refresh()
    } else {
      alert('同步完成，部分表可能已存在')
    }
  } catch (e) {
    alert(e.message || '同步失败')
  } finally {
    syncing.value = false
  }
}

async function handleDelete(message) {
  if (!confirm(`确定删除来自「${message.name}」的留言？`)) return
  try {
    await removeContactMessage(message.id)
  } catch (e) {
    alert(e.message || '删除失败')
  }
}

async function handleRead(message) {
  try {
    await markContactMessageRead(message.id)
  } catch (e) {
    alert(e.message || '标记已读失败')
  }
}

async function handleReadAll() {
  readingAll.value = true
  try {
    await markAllContactMessagesRead()
  } catch (e) {
    alert(e.message || '全部标记已读失败')
  } finally {
    readingAll.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
