import request from './request'
import { getUploadUrl } from './url'

/**
 * 获取资源上传地址
 * @description 根据当前环境返回资源上传的URL地址
 * @returns {String} 资源上传的完整URL地址
 */
export const resourceUploadUrl = () => {
  return getUploadUrl()
}

/**
 * 合并上传的资源
 * @description 将分片上传的文件资源合并为完整文件
 * @param {Object} resource - 资源信息对象
 * @param {String} resource.fileName - 文件名
 * @param {Number} resource.size - 文件大小
 * @param {String} resource.identifier - 文件唯一标识符
 * @param {Number} resource.parentId - 父文件夹ID
 * @returns {Promise} 返回合并请求的Promise对象
 */
export const mergeResource = resource => {
  return request({
    url: '/v1/resource/merge',
    method: 'post',
    data: resource
  })
}

/**
 * 获取传输任务列表
 * @returns {Promise} 传输任务列表Promise
 */
export const getTransferTasks = () => {
  return request({
    url: '/v1/resource/transfers'
  })
}

/**
 * 取消上传任务
 * @param {String} identifier - 任务标识
 * @returns {Promise} 取消结果Promise
 */
export const cancelUploadTask = identifier => {
  return request({
    url: `/v1/resource/upload/${identifier}`,
    method: 'delete'
  })
}

/**
 * 清理传输任务记录
 * @param {String} [status='completed'] - 需要清理的状态
 * @returns {Promise} 清理结果Promise
 */
export const clearTransferTasks = (status = 'completed') => {
  return request({
    url: '/v1/resource/transfers',
    method: 'delete',
    params: { status }
  })
}

export const clearTransferTask = identifier => {
  return request({
    url: `/v1/resource/transfer/${identifier}`,
    method: 'delete'
  })
}

export const getUploadedChunks = identifier => {
  return request({
    url: `/v1/resource/chunks/${identifier}`
  })
}

export const verifyChunkIntegrity = (identifier, chunkNumber, md5) => {
  return request({
    url: '/v1/resource/chunk/verify',
    params: { identifier, chunkNumber, md5 }
  })
}

export const cleanupTimeoutUploads = () => {
  return request({
    url: '/v1/resource/cleanup',
    method: 'post'
  })
}

export const updateTransferStatus = (identifier, fileName, status, totalSize, parentId) => {
  return request({
    url: '/v1/resource/transfer/status',
    method: 'post',
    data: { identifier, fileName, status, totalSize, parentId }
  })
}

