import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.css'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import componentsPlugin from './components'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(componentsPlugin)

app.mount('#app')
