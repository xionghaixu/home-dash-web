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

/**
 * 高级搜索文件
 * @param {String} keyword - 搜索关键字
 * @param {Object} [options] - 查询选项
 * @param {Array} [options.types] - 文件类型筛选
 * @param {Array} [options.dateRange] - 日期范围 [startDate, endDate]
 * @param {String} [options.sizeRange] - 大小范围
 * @param {Number} [options.folderId] - 目录ID
 * @param {Boolean} [options.favorite] - 收藏状态
 * @param {Array} [options.tags] - 标签
 * @param {String} [options.sortBy] - 排序字段
 * @param {String} [options.sortOrder] - 排序方式
 * @param {Number} [options.page] - 页码
 * @param {Number} [options.pageSize] - 每页数量
 * @returns {Promise} 搜索结果Promise
 */
export const searchFilesAdvanced = (keyword, options = {}) => {
  return request({
    url: '/v1/file/search',
    params: { keyword, ...options }
  })
}

/**
 * 获取搜索历史
 * @returns {Promise} 搜索历史Promise
 */
export const getSearchHistory = () => {
  return request({
    url: '/v1/search/history'
  })
}

/**
 * 清空搜索历史
 * @returns {Promise} 清空结果Promise
 */
export const clearSearchHistory = () => {
  return request({
    url: '/v1/search/history',
    method: 'delete'
  })
}

/**
 * 获取热门搜索词
 * @param {Number} [limit=10] - 返回数量
 * @returns {Promise} 热门搜索词Promise
 */
export const getHotSearchTerms = (limit = 10) => {
  return request({
    url: '/v1/search/hot',
    params: { limit }
  })
}

/**
 * 获取筛选视图列表
 * @returns {Promise} 筛选视图列表Promise
 */
export const getFilterViews = () => {
  return request({
    url: '/v1/search/views'
  })
}

/**
 * 保存筛选视图
 * @param {Object} view - 视图配置
 * @param {String} view.name - 视图名称
 * @param {Object} view.filters - 筛选条件
 * @returns {Promise} 保存结果Promise
 */
export const saveFilterView = view => {
  return request({
    url: '/v1/search/views',
    method: 'post',
    data: view
  })
}

/**
 * 删除筛选视图
 * @param {Number} viewId - 视图ID
 * @returns {Promise} 删除结果Promise
 */
export const deleteFilterView = viewId => {
  return request({
    url: `/v1/search/views/${viewId}`,
    method: 'delete'
  })
}

/**
 * 获取文件标签
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 标签列表Promise
 */
export const getFileTags = fileId => {
  return request({
    url: `/v1/tag/file/${fileId}`
  })
}

/**
 * 添加文件标签
 * @param {Number} fileId - 文件ID
 * @param {Array} tagNames - 标签名称数组
 * @returns {Promise} 添加结果Promise
 */
export const addFileTags = (fileId, tagNames) => {
  return request({
    url: '/v1/tag/batch/add',
    method: 'post',
    data: { fileIds: [fileId], tagNames }
  })
}

/**
 * 删除文件标签
 * @param {Number} fileId - 文件ID
 * @param {Number} tagId - 标签ID
 * @returns {Promise} 删除结果Promise
 */
export const removeFileTag = (fileId, tagId) => {
  return request({
    url: '/v1/tag/batch/remove',
    method: 'post',
    data: { fileIds: [fileId], tagIds: [tagId] }
  })
}

/**
 * 获取文件收藏状态
 * @param {Number} resourceId - 资源ID
 * @returns {Promise} 收藏状态Promise
 */
export const getFileFavorite = resourceId => {
  return request({
    url: `/v1/favorite/status/${resourceId}`
  })
}

/**
 * 切换收藏状态
 * @param {Number} resourceId - 资源ID
 * @returns {Promise} 切换结果Promise
 */
export const toggleFavorite = resourceId => {
  return request({
    url: `/v1/favorite/${resourceId}`,
    method: 'post'
  })
}

/**
 * 获取文本文件内容
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 文本内容Promise
 */
export const getTextFileContent = fileId => {
  return request({
    url: `/v1/file/${fileId}/content`
  })
}

/**
 * 获取音频文件URL
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 音频URL Promise
 */
export const getAudioUrl = fileId => {
  return request({
    url: `/v1/file/${fileId}/audio-url`
  })
}

/**
 * 获取标签列表
 * @returns {Promise} 标签列表Promise
 */
export const getTagList = () => {
  return request({
    url: '/v1/tag/list'
  })
}

/**
 * 保存文件备注
 * @param {Number} resourceId - 资源ID
 * @param {String} remark - 备注内容
 * @returns {Promise} 保存结果Promise
 */
export const saveFileRemark = (resourceId, remark) => {
  return request({
    url: '/v1/remark',
    method: 'post',
    data: { resourceId, remarkContent: remark }
  })
}

/**
 * 获取搜索建议
 * @param {String} keyword - 搜索关键字
 * @returns {Promise} 搜索建议Promise
 */
export const getSearchSuggestions = keyword => {
  return request({
    url: '/v1/search/suggestions',
    params: { keyword }
  })
}

/**
 * 获取热门筛选
 * @returns {Promise} 热门筛选Promise
 */
export const getHotFilters = () => {
  return request({
    url: '/v1/search/hot-filters'
  })
}

/**
 * 获取预览状态
 * @param {Number} resourceId - 资源ID
 * @returns {Promise} 预览状态Promise
 */
export const getPreviewStatus = resourceId => {
  return request({
    url: `/v1/preview/${resourceId}/status`
  })
}

/**
 * 获取文本预览内容
 * @param {Number} resourceId - 资源ID
 * @returns {Promise} 文本内容Promise
 */
export const getTextPreview = resourceId => {
  return request({
    url: `/v1/preview/${resourceId}/text`
  })
}

/**
 * 获取图片缩略图URL
 * @param {Number} resourceId - 资源ID
 * @returns {String} 缩略图URL
 */
export const getImageThumbnailUrl = resourceId => {
  return `/api/v1/preview/image/${resourceId}/thumbnail`
}

/**
 * 获取图片原图URL
 * @param {Number} resourceId - 资源ID
 * @returns {String} 原图URL
 */
export const getImageOriginalUrl = resourceId => {
  return `/api/v1/preview/image/${resourceId}/original`
}

/**
 * 获取音频元数据
 * @param {Number} resourceId - 资源ID
 * @returns {Promise} 音频元数据Promise
 */
export const getAudioMetadata = resourceId => {
  return request({
    url: `/v1/preview/audio/${resourceId}/metadata`
  })
}

/**
 * 获取音频播放URL
 * @param {Number} resourceId - 资源ID
 * @returns {String} 音频播放URL
 */
export const getAudioPlayUrl = resourceId => {
  return `/api/v1/preview/audio/${resourceId}/play`
}

/**
 * 获取EXIF信息
 * @param {Number} resourceId - 资源ID
 * @returns {Promise} EXIF信息Promise
 */
export const getImageExif = resourceId => {
  return request({
    url: `/v1/preview/image/${resourceId}/exif`
  })
}
