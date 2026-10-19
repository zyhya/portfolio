import { createApp } from 'vue'
import Admin from './Support.vue'
import Customer from './Customer.vue'
import './support.css'

const app = createApp(location.pathname.startsWith('/admin') ? Admin : Customer)
app.mount('#app')
