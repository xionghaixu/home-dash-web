import request from './request'

/**
 * 获取回收站列表
 * @returns {Promise} 回收站文件列表
 */
export const getRecycleBinList = () => {
  return request({
    url: '/v1/recycle-bin/list',
    method: 'post'
  })
}

/**
 * 恢复文件
 * @param {Array} fileIds - 文件ID数组
 * @returns {Promise} 恢复结果
 */
export const restoreFiles = (fileIds) => {
  return request({
    url: '/v1/recycle-bin/restore',
    method: 'post',
    data: { fileIds }
  })
}

/**
 * 清空回收站
 * @returns {Promise} 清空结果
 */
export const emptyRecycleBin = () => {
  return request({
    url: '/v1/recycle-bin/empty',
    method: 'delete'
  })
}
