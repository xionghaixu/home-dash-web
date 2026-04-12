import request from './request'
import { getDownloadUrl } from './url'

/**
 * 根据parentId获取所有的文件
 * @param {Number} parentId - 父文件夹ID
 * @param {Object} [options] - 查询选项
 * @param {String} [options.sortBy] - 排序字段：fileName/size/updateTime
 * @param {String} [options.sortOrder] - 排序方式：ascending/descending
 * @returns {Promise} 文件列表Promise
 */
export const getFileList = (parentId, options = {}) => {
  const params = { parentId, ...options }
  return request({
    url: `/v1/file/parent/${parentId}`,
    params
  })
}

/**
 * 根据fileId获取文件
 * @param {Number} fileId - 文件id
 * @returns {Promise} 文件信息Promise
 */
export const getFile = fileId => {
  return request({
    url: `/v1/file/${fileId}`
  })
}

/**
 * 下载文件URL
 * @param {Number} fileId - 文件ID
 * @returns {String} 文件下载URL
 */
export const downloadFileUrl = fileId => {
  return getDownloadUrl(fileId)
}

/**
 * 创建新的文件
 * @param {Number} parentId - 父文件夹id
 * @param {String} fileName - 文件名
 * @param {String} type - 文件类型：folder/txt/pdf...
 * @returns {Promise} 创建结果Promise
 */
export const createFile = (parentId, fileName, type) => {
  return request({
    url: `/v1/file`,
    method: 'post',
    data: {
      parentId,
      fileName,
      type
    }
  })
}

/**
 * 文件重命名
 * @param {Number} fileId - 文件id
 * @param {String} fileName - 新文件名
 * @returns {Promise} 重命名结果Promise
 */
export const renameFile = (fileId, fileName) => {
  return request({
    url: `/v1/file/${fileId}/rename`,
    method: 'put',
    data: {
      fileName
    }
  })
}

/**
 * 根据文件id删除文件
 * @param {Array} fileIds - 文件ids数组
 * @returns {Promise} 删除结果Promise
 */
export const deleteFiles = fileIds => {
  return request({
    url: `/v1/file`,
    method: 'delete',
    data: fileIds
  })
}

/**
 * 移动或复制文件
 * @param {Array} fileIds - 源文件ids
 * @param {Array} targetIds - 目标文件ids
 * @param {String} type - 操作类型：move/copy
 * @returns {Promise} 操作结果Promise
 */
export const moveOrCopyFiles = (fileIds, targetIds, type) => {
  return request({
    url: '/v1/file',
    method: 'put',
    data: {
      fileIds,
      targetIds,
      type
    }
  })
}
