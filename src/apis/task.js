import request from './request'

/**
 * 获取统一任务列表（分页+筛选）
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.status - 状态筛选: PENDING, RUNNING, SUCCESS, FAILED
 * @param {String} params.taskType - 任务类型筛选
 * @param {String} params.source - 来源筛选: sys, media
 * @returns {Promise} 分页任务列表
 */
export const getTasks = (params = {}) => {
  return request({
    url: '/v1/tasks',
    params
  })
}

/**
 * 获取任务详情
 * @param {Number} taskId - 任务ID
 * @param {String} source - 来源: sys 或 media
 * @returns {Promise} 任务详情
 */
export const getTaskDetail = (taskId, source) => {
  return request({
    url: `/v1/tasks/${taskId}`,
    params: { source }
  })
}

/**
 * 重试任务
 * @param {Number} taskId - 任务ID
 * @param {String} source - 来源: sys 或 media
 * @returns {Promise} 操作结果
 */
export const retryTask = (taskId, source) => {
  return request({
    url: `/v1/tasks/${taskId}/retry`,
    method: 'post',
    params: { source }
  })
}

/**
 * 批量重试任务
 * @param {Array} taskIds - 任务ID数组
 * @param {String} source - 来源: sys 或 media
 * @returns {Promise} 操作结果
 */
export const batchRetryTasks = (taskIds, source) => {
  return request({
    url: '/v1/tasks/batch-retry',
    method: 'post',
    data: { taskIds, source }
  })
}
