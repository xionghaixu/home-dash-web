import request from './request'

/**
 * 获取系统信息
 * @description 获取系统信息，包括系统容量、文件数等统计数据
 * @returns {Promise} 返回系统信息请求的Promise对象
 */
export const systemInfo = () => {
  return request({
    url: `/v1/system`
  })
}
