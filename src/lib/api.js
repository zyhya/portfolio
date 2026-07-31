/**
 * REST API 客户端 — 对接 Vercel Serverless Functions
 */
import { upload } from '@vercel/blob/client'

/** API 基础地址（开发环境空字符串 = 同源，生产环境也是同源因为前端和 API 部署在同一域名） */
const API_BASE = import.meta.env.VITE_API_BASE || ''

/** 本地存储 token 的 key */
const TOKEN_KEY = 'portfolio_admin_token'

/** 获取 token */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

/** 设置 token */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/** 是否已配置后端（始终 true，因为是同源部署） */
export function isConfigured() {
  return true
}

/** 统一请求方法 */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  try {
    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.error || `请求失败 (${res.status})`)
    }
    return await res.json()
  } catch (e) {
    // 网络错误或服务不可用
    if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
      throw new Error('无法连接服务器，请检查网络或后端是否已部署')
    }
    throw e
  }
}

// ============ 认证 ============

/** 管理员登录 */
export async function adminLogin(username, password) {
  try {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (data.token) {
      setToken(data.token)
      return { data, error: null }
    }
    return { data: null, error: '登录失败' }
  } catch (e) {
    return { data: null, error: e.message || '登录失败' }
  }
}

/** 检查管理员登录状态 */
export async function checkAdminAuth() {
  if (!getToken()) return false
  try {
    const data = await request('/api/auth/check')
    return data.authenticated === true
  } catch {
    setToken('')
    return false
  }
}

/** 管理员登出 */
export async function adminSignOut() {
  setToken('')
}

// ============ Profile ============

export async function fetchProfile() {
  return request('/api/profile')
}

export async function saveProfile(data) {
  return request('/api/profile', { method: 'PUT', body: JSON.stringify(data) })
}

// ============ Projects ============

export async function fetchProjects() {
  return request('/api/projects')
}

export async function createProject(data) {
  return request('/api/projects', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateProject(id, data) {
  return request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteProject(id) {
  return request(`/api/projects/${id}`, { method: 'DELETE' })
}

// ============ Skills ============

export async function fetchSkills() {
  return request('/api/skills')
}

export async function createSkill(data) {
  return request('/api/skills', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateSkill(id, data) {
  return request(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteSkill(id) {
  return request(`/api/skills/${id}`, { method: 'DELETE' })
}

// ============ Contact Messages ============

export async function fetchContactMessages() {
  return request('/api/contact')
}

export async function createContactMessage(data) {
  return request('/api/contact', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateContactMessage(id, data) {
  return request(`/api/contact/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function markAllContactMessagesRead() {
  return request('/api/contact', { method: 'PATCH' })
}

export async function deleteContactMessage(id) {
  return request(`/api/contact/${id}`, { method: 'DELETE' })
}

export async function initData() {
  return request('/api/init', { method: 'POST' })
}

// ============ Schema Sync ============

export async function syncSchema() {
  return request('/api/init', { method: 'POST', body: JSON.stringify({ syncOnly: true }) })
}

// ============ 文件上传（Vercel Blob 客户端直传）============

/**
 * 上传本地文件到 Vercel Blob，返回可公开访问的 URL。
 * 支持图片（jpg/png/webp/gif/svg）与视频（mp4/webm/mov）。
 * 上传授权由 /api/blob（仅管理员）颁发，自动携带登录 token。
 * @param {File} file 本地文件
 * @param {string} folder 存储目录，如 'artworks' / 'avatars'
 */
export async function uploadFile(file, folder = 'artworks') {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const pathname = `${folder}/${safeName}`
  const token = getToken()
  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/blob',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  })
  return blob.url
}
