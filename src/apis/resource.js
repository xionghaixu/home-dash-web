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
