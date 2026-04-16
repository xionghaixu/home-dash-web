import Axios from 'axios'
import { errorHandler } from '@/utils/errorHandler'

/**
 * Axios实例配置
 * @description 创建Axios实例，配置基础URL和超时时间
 */
const req = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * @description 在请求发送前进行处理，如添加认证信息
 */
req.interceptors.request.use(
  config => {
    const startTime = Date.now()
    config.metadata = { startTime }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * @description 统一处理响应和错误
 */
req.interceptors.response.use(
  response => {
    const { config } = response
    if (config?.metadata?.startTime) {
      const duration = Date.now() - config.metadata.startTime
      if (import.meta.env.DEV && duration > 3000) {
        console.warn(`[API Slow] ${config.url} took ${duration}ms`)
      }
    }

    const data = response.data

    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code !== 200 && data.code !== 0 && data.code !== '00000') {
        const error = new Error(data.msg || '业务处理失败')
        error.data = data
        errorHandler.handleBusinessError(data, false)
        return Promise.reject(error)
      }
    }

    return data
  },
  error => {
    const { response, config } = error

    if (config?.metadata?.startTime) {
      const duration = Date.now() - config.metadata.startTime
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${config?.url || 'unknown'} failed after ${duration}ms`, error)
      }
    }

    if (response) {
      errorHandler.handleHttpError(error, { redirect: true })
      return Promise.reject(response)
    } else {
      if (!window.navigator.onLine) {
        errorHandler.showError('网络连接已断开，请检查网络')
      } else {
        errorHandler.handleHttpError(error, { redirect: false })
      }
    }
    return Promise.reject(error)
  }
)

export default req
