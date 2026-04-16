/**
 * API URL 工具函数
 * @description 提供统一的API URL生成方法，处理开发和生产环境的差异
 */

/**
 * 获取API基础URL
 * @description 根据当前环境返回API基础URL
 * @returns {String} API基础URL
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return window.location.origin
  }
  return import.meta.env.VITE_API_BASE_URL || ''
}

/**
 * 构建API URL
 * @description 根据路径构建完整的API URL
 * @param {String} path - API路径
 * @returns {String} 完整的API URL
 */
export const buildApiUrl = path => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${path}`
}

/**
 * 获取文件下载URL
 * @description 根据文件ID生成文件下载URL
 * @param {Number} fileId - 文件ID
 * @returns {String} 文件下载URL
 */
export const getDownloadUrl = fileId => {
  return buildApiUrl(`/v1/file/${fileId}/download`)
}

/**
 * 获取资源上传URL
 * @description 获取分片上传的URL地址
 * @returns {String} 资源上传URL
 */
export const getUploadUrl = () => {
  return buildApiUrl('/v1/resource/chunk')
}

/**
 * 获取视频播放URL
 * @description 根据文件ID生成视频播放URL
 * @param {Number} fileId - 文件ID
 * @returns {String} 视频播放URL
 */
export const getVideoUrl = fileId => {
  return buildApiUrl(`/v1/file/${fileId}/download`)
}

export default {
  getApiBaseUrl,
  buildApiUrl,
  getDownloadUrl,
  getUploadUrl,
  getVideoUrl
}
