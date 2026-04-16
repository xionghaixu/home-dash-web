import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.scss'
import './utils/eventBus'
import { errorHandler } from './utils/errorHandler'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化主题
const themeStore = useThemeStore()
themeStore.init()

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
