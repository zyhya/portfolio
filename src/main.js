import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import { i18n } from './i18n.js'

const app = createApp(App)
app.provide('i18n', i18n)
app.use(router)
app.mount('#app')
