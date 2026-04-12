import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.scss'
import './utils/eventBus'
import { errorHandler } from './utils/errorHandler'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.performance = true

app.config.errorHandler = (err, vm, info) => {
  errorHandler.globalHandler(err, vm, info)
}

if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn('Vue Warning:', msg, trace)
  }
}

app.mount('#app')
