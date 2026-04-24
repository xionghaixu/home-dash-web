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
  return request({
    url: `/v1/file/parent/${parentId}`,
    params: options
  })
}

/**
 * 根据parentId分页获取文件列表
 * @param {Number} parentId - 父文件夹ID
 * @param {Object} [options] - 查询选项
 * @param {String} [options.sortBy] - 排序字段：fileName/size/updateTime
 * @param {String} [options.sortOrder] - 排序方式：ascending/descending
 * @param {Number} [options.page] - 页码，默认1
 * @param {Number} [options.pageSize] - 每页数量，默认20
 * @returns {Promise} 文件列表Promise，包含分页信息
 */
export const getFileListPaginated = (parentId, options = {}) => {
  return request({
    url: `/v1/file/parent/${parentId}/page`,
    params: {
      page: 1,
      pageSize: 20,
      ...options
    }
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
 * 获取最近上传文件列表
 * @param {Number} [limit=20] - 最近上传数量
 * @param {Object} [options] - 查询选项
 * @param {String} [options.sortBy] - 排序字段
 * @param {String} [options.sortOrder] - 排序方式
 * @returns {Promise} 最近上传文件Promise
 */
export const getRecentFiles = (limit = 20, options = {}) => {
  return request({
    url: '/v1/file/recent',
    params: { limit, ...options }
  })
}

/**
 * 获取分类摘要
 * @returns {Promise} 分类摘要Promise
 */
export const getCategorySummary = () => {
  return request({
    url: '/v1/file/category-summary'
  })
}

/**
 * 获取分类文件列表
 * @param {String} category - 分类编码
 * @param {Object} [options] - 查询参数
 * @returns {Promise} 分类文件列表Promise
 */
export const getCategoryFiles = (category, options = {}) => {
  return request({
    url: `/v1/file/category/${category}`,
    params: options
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

/**
 * 校验文件完整性
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 完整性校验结果Promise
 */
export const verifyFileMd5 = fileId => {
  return request({
    url: `/v1/file/${fileId}/verify-md5`
  })
}

/**
 * 搜索文件
 * @param {String} keyword - 搜索关键字
 * @param {Object} [options] - 查询选项
 * @param {String} [options.sortBy] - 排序字段：fileName/size/updateTime
 * @param {String} [options.sortOrder] - 排序方式：ascending/descending
 * @returns {Promise} 搜索结果Promise
 */
export const searchFiles = (keyword, options = {}) => {
  return request({
    url: '/v1/file/search',
    params: { keyword, ...options }
  })
}

/**
 * 获取文件夹大小
 * @param {Number} folderId - 文件夹ID
 * @returns {Promise} 文件夹大小Promise, data.size为总字节数
 */
export const getFolderSize = folderId => {
  return request({
    url: `/v1/file/folder/${folderId}/size`
  })
}

export const checkFileByMd5 = md5 => {
  return request({
    url: '/v1/file/md5/check',
    params: { md5 }
  })
}

export const instantUpload = (md5, fileName, parentId) => {
  return request({
    url: '/v1/file/instant-upload',
    method: 'post',
    data: { md5, fileName, parentId }
  })
}

export const uploadFile = (file, parentId) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('parentId', parentId)
  return request({
    url: '/v1/file/upload',
    method: 'post',
    data: formData
  })
}

export const getRecentUploadSummary = (limit = 20) => {
  return request({
    url: '/v1/file/recent-summary',
    params: { limit }
  })
}
