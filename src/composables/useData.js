import { reactive, computed } from 'vue'
import { i18n } from '../i18n.js'
import {
  fetchProfile, saveProfile,
  fetchProjects, createProject, updateProject, deleteProject,
  fetchSkills, createSkill, updateSkill, deleteSkill,
  fetchContactMessages, updateContactMessage, markAllContactMessagesRead, deleteContactMessage,
  initData,
} from '../lib/api.js'

const state = reactive({
  loading: false,
  error: null,
  profile: null,
  projects: [],
  skills: [],
  contactMessages: [],
})

/** 从 profile.social_links（JSON 字符串）解析出社交链接数组 */
const socialLinks = computed(() => {
  if (!state.profile || !state.profile.social_links) return []
  try {
    const parsed = typeof state.profile.social_links === 'string'
      ? JSON.parse(state.profile.social_links)
      : state.profile.social_links
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

/** 将 API 数据合并到 i18n 翻译对象（中英双语） */
function mergeToI18n() {
  const t = i18n.t.value
  // profile
  if (state.profile) {
    const p = state.profile
    t.hero.name = i18n.locale === 'zh' ? p.name_zh : p.name_en
    t.hero.tagline = i18n.locale === 'zh' ? p.tagline_zh : p.tagline_en
    t.about.name = i18n.locale === 'zh' ? p.name_zh : p.name_en
    t.about.bio = i18n.locale === 'zh' ? p.bio_zh : p.bio_en
    t.about.title = i18n.locale === 'zh' ? p.title_zh : p.title_en
    t.about.stats.years = p.years_exp
    t.about.stats.projects = p.projects_count
    t.about.stats.clients = p.clients_count
    t.contact.email = p.email
    t.contact.phone = p.phone
    t.about.location = i18n.locale === 'zh' ? p.location_zh : p.location_en
    t.about.avatar = p.avatar
  }
  // projects
  if (state.projects.length) {
    t.projects.items = state.projects.map(p => ({
      title: i18n.locale === 'zh' ? p.title_zh : p.title_en,
      desc: i18n.locale === 'zh' ? p.desc_zh : p.desc_en,
      tags: p.tags || [],
      tech: p.tags || [],
      category: p.category,
      categoryLabel: (t.projects.filters && t.projects.filters[p.category]) || p.category,
      link: p.link,
      github: p.github,
      image: p.image,
      video: p.video,
      featured: p.featured,
    }))
  }
  // skills
  if (state.skills.length) {
    t.skills.items = state.skills.map(s => ({
      name: s.name,
      level: s.level,
      icon: s.icon,
      category: s.category,
    }))
  }
  // socials
  if (socialLinks.value.length) {
    t.contact.socials = socialLinks.value.map(s => ({
      name: s.name,
      url: s.url,
      icon: s.icon,
    }))
  }
}

/** 从后端拉取所有数据 */
async function fetchAll() {
  state.loading = true
  state.error = null
  try {
    const [profile, projects, skills, contactMessages] = await Promise.all([
      fetchProfile().catch(() => null),
      fetchProjects().catch(() => []),
      fetchSkills().catch(() => []),
      fetchContactMessages().catch(() => []),
    ])
    state.profile = profile
    state.projects = projects || []
    state.skills = skills || []
    state.contactMessages = contactMessages || []
    mergeToI18n()
  } catch (e) {
    state.error = e.message
    // 不报错，保持静态默认数据
  } finally {
    state.loading = false
  }
}

/** 初始化默认数据 */
async function initializeData() {
  const res = await initData()
  await fetchAll()
  return res
}

// ============ Admin composable ============

export function useData() {
  return {
    state,
    socialLinks,
    fetchAll,
    initializeData,
  }
}

export function useAdmin() {
  return {
    // Profile
    getProfile: () => state.profile,
    saveProfile: async (data) => {
      const saved = await saveProfile(data)
      state.profile = saved
      mergeToI18n()
      return saved
    },
    // Projects
    getProjects: () => state.projects,
    addProject: async (data) => {
      const created = await createProject(data)
      state.projects.push(created)
      mergeToI18n()
      return created
    },
    editProject: async (id, data) => {
      const updated = await updateProject(id, data)
      const idx = state.projects.findIndex(p => p.id === id)
      if (idx >= 0) state.projects[idx] = updated
      mergeToI18n()
      return updated
    },
    removeProject: async (id) => {
      await deleteProject(id)
      state.projects = state.projects.filter(p => p.id !== id)
      mergeToI18n()
    },
    // Skills
    getSkills: () => state.skills,
    addSkill: async (data) => {
      const created = await createSkill(data)
      state.skills.push(created)
      mergeToI18n()
      return created
    },
    editSkill: async (id, data) => {
      const updated = await updateSkill(id, data)
      const idx = state.skills.findIndex(s => s.id === id)
      if (idx >= 0) state.skills[idx] = updated
      mergeToI18n()
      return updated
    },
    removeSkill: async (id) => {
      await deleteSkill(id)
      state.skills = state.skills.filter(s => s.id !== id)
      mergeToI18n()
    },
    // Contact Messages
    getContactMessages: () => state.contactMessages,
    refreshContactMessages: async () => {
      const messages = await fetchContactMessages()
      state.contactMessages = messages || []
      return messages
    },
    markContactMessageRead: async (id) => {
      const updated = await updateContactMessage(id, { read: true })
      const idx = state.contactMessages.findIndex(m => m.id === id)
      if (idx >= 0) state.contactMessages[idx] = updated.message || updated
      return updated
    },
    markAllContactMessagesRead: async () => {
      const res = await markAllContactMessagesRead()
      state.contactMessages.forEach(m => { m.read = true })
      return res
    },
    removeContactMessage: async (id) => {
      await deleteContactMessage(id)
      state.contactMessages = state.contactMessages.filter(m => m.id !== id)
    },
    // Init
    initializeData,
  }
}
