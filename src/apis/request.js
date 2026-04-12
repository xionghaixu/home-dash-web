import Axios from 'axios'
import { errorHandler } from '@/utils/errorHandler'

/**
 * Axios实例配置
 * @description 创建Axios实例，配置基础URL和超时时间
 */
const req = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000
})

/**
 * 请求拦截器
 * @description 在请求发送前进行处理，如添加认证信息
 */
req.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * @description 统一处理响应和错误
 */
req.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error
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
