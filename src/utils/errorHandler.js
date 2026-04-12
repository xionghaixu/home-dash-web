import { ElMessage } from 'element-plus'
import router from '@/router'

/**
 * 错误类型枚举
 * @description 定义应用中可能出现的错误类型
 */
export const ErrorType = {
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  BUSINESS: 'BUSINESS_ERROR',
  AUTH: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

/**
 * 错误消息映射
 * @description 根据HTTP状态码返回对应的错误消息
 */
const ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
}

/**
 * 错误处理类
 * @description 统一处理应用中的各类错误
 */
class ErrorHandler {
  constructor() {
    this.errorQueue = []
    this.isShowing = false
  }

  /**
   * 获取错误类型
   * @param {Number} status - HTTP状态码
   * @returns {String} 错误类型
   */
  getErrorType(status) {
    if (status === 401) return ErrorType.AUTH
    if (status === 404) return ErrorType.NOT_FOUND
    if (status >= 400 && status < 500) return ErrorType.BUSINESS
    if (status >= 500) return ErrorType.SERVER
    return ErrorType.UNKNOWN
  }

  /**
   * 获取错误消息
   * @param {Object} error - 错误对象
   * @returns {String} 错误消息
   */
  getErrorMessage(error) {
    if (error.response) {
      const { status, data } = error.response
      if (data && data.msg) {
        return data.msg
      }
      return ERROR_MESSAGES[status] || `请求失败 (${status})`
    }
    if (error.message) {
      if (error.message.includes('timeout')) {
        return '请求超时，请稍后重试'
      }
      if (error.message.includes('Network Error')) {
        return '网络连接失败，请检查网络'
      }
      return error.message
    }
    return '未知错误'
  }

  /**
   * 显示错误提示
   * @param {String} message - 错误消息
   * @param {String} type - 消息类型
   */
  showError(message, type = 'error') {
    if (this.isShowing) {
      this.errorQueue.push({ message, type })
      return
    }
    this.isShowing = true
    ElMessage({
      message,
      type,
      duration: 3000,
      onClose: () => {
        this.isShowing = false
        if (this.errorQueue.length > 0) {
          const next = this.errorQueue.shift()
          this.showError(next.message, next.type)
        }
      }
    })
  }

  /**
   * 处理HTTP错误
   * @param {Object} error - 错误对象
   * @param {Object} options - 处理选项
   * @param {Boolean} options.showMessage - 是否显示错误消息
   * @param {Boolean} options.redirect - 是否重定向
   */
  handleHttpError(error, options = {}) {
    const { showMessage = true, redirect = true } = options

    if (!error.response) {
      if (!window.navigator.onLine) {
        this.showError('网络连接已断开，请检查网络')
        return { type: ErrorType.NETWORK, message: '网络连接已断开' }
      }
      this.showError('请求失败，请稍后重试')
      return { type: ErrorType.NETWORK, message: '请求失败' }
    }

    const { status } = error.response
    const errorType = this.getErrorType(status)
    const errorMessage = this.getErrorMessage(error)

    if (showMessage) {
      this.showError(errorMessage)
    }

    if (redirect) {
      this.handleRedirect(status)
    }

    return { type: errorType, message: errorMessage, status }
  }

  /**
   * 处理重定向
   * @param {Number} status - HTTP状态码
   */
  handleRedirect(status) {
    switch (status) {
      case 401:
        break
      case 404:
        router.push({ name: 'NotFound' })
        break
      default:
        break
    }
  }

  /**
   * 处理业务错误
   * @param {Object} response - 响应对象
   * @param {Boolean} showMessage - 是否显示错误消息
   * @returns {Object} 处理结果
   */
  handleBusinessError(response, showMessage = true) {
    if (response.code && response.code !== 200 && response.code !== 0) {
      const message = response.msg || response.message || '操作失败'
      if (showMessage) {
        this.showError(message)
      }
      return { success: false, message, code: response.code }
    }
    return { success: true, data: response.data }
  }

  /**
   * 异步操作错误包装器
   * @param {Function} fn - 异步函数
   * @param {Object} options - 错误处理选项
   * @returns {Function} 包装后的函数
   */
  asyncWrapper(fn, options = {}) {
    return async (...args) => {
      try {
        const result = await fn(...args)
        return { success: true, data: result }
      } catch (error) {
        const errorInfo = this.handleHttpError(error, options)
        return { success: false, error: errorInfo }
      }
    }
  }

  /**
   * 全局错误处理器
   * @param {Error} error - 错误对象
   * @param {Object} vm - Vue组件实例
   * @param {String} info - 错误信息
   */
  globalHandler(error, vm, info) {
    // eslint-disable-next-line no-console
    console.error('Global Error:', error, info)
    this.showError(error.message || '系统错误')
  }
}

export const errorHandler = new ErrorHandler()

export default errorHandler
