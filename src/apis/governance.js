import request from './request'

/**
 * 获取存储分析数据
 * @returns {Promise} 存储分析数据
 */
export const getStorageAnalysis = () => {
  return request({
    url: '/v1/governance/storage-analysis'
  })
}

/**
 * 获取重复文件列表
 * @returns {Promise} 重复文件分组列表
 */
export const getDuplicates = () => {
  return request({
    url: '/v1/governance/duplicates'
  })
}

/**
 * 获取大文件列表
 * @returns {Promise} 大文件列表
 */
export const getLargeFiles = () => {
  return request({
    url: '/v1/governance/large-files'
  })
}

/**
 * 获取空目录列表
 * @returns {Promise} 空目录列表
 */
export const getEmptyDirs = () => {
  return request({
    url: '/v1/governance/empty-dirs'
  })
}

/**
 * 智能清理重复文件（每组保留最早一份）
 * @returns {Promise} 操作结果
 */
export const smartCleanup = () => {
  return request({
    url: '/v1/governance/duplicates/smart-cleanup',
    method: 'post'
  })
}

/**
 * 清理指定重复文件组
 * @param {Number} groupId - 重复文件组ID
 * @returns {Promise} 操作结果
 */
export const cleanupGroup = (groupId) => {
  return request({
    url: '/v1/governance/duplicates/cleanup',
    method: 'post',
    data: { groupId }
  })
}
