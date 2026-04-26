import request from './request'

/**
 * 获取首页媒体聚合摘要
 * @returns {Promise} 首页媒体摘要Promise
 */
export const getHomeMediaSummary = () => {
  return request({
    url: '/v1/media/home/summary'
  })
}

/**
 * 获取图片列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 图片列表Promise
 */
export const getPictureList = (params = {}) => {
  return request({
    url: '/v1/media/images',
    params
  })
}

/**
 * 获取图片详情
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 图片详情Promise
 */
export const getPictureDetail = fileId => {
  return request({
    url: `/v1/media/images/${fileId}`
  })
}

/**
 * 获取图片时间线
 * @param {String} groupBy - 分组方式
 * @returns {Promise} 时间线Promise
 */
export const getPictureTimeline = groupBy => {
  return request({
    url: '/v1/media/images/timeline',
    params: { groupBy }
  })
}

/**
 * 获取相册列表
 * @param {String} albumType - 相册类型
 * @returns {Promise} 相册列表Promise
 */
export const getAlbumList = (albumType) => {
  return request({
    url: '/v1/media/albums',
    params: { albumType }
  })
}

/**
 * 获取视频列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 视频列表Promise
 */
export const getVideoList = (params = {}) => {
  return request({
    url: '/v1/media/videos',
    params
  })
}

/**
 * 获取视频详情
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 视频详情Promise
 */
export const getVideoDetail = fileId => {
  return request({
    url: `/v1/media/videos/${fileId}`
  })
}

/**
 * 获取视频播放进度
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 播放进度Promise
 */
export const getWatchProgress = fileId => {
  return request({
    url: `/v1/media/videos/${fileId}/progress`
  })
}

/**
 * 更新视频播放进度
 * @param {Number} fileId - 文件ID
 * @param {Object} data - 进度数据
 * @returns {Promise} 更新结果Promise
 */
export const updateWatchProgress = (fileId, data) => {
  return request({
    url: `/v1/media/videos/${fileId}/progress`,
    method: 'post',
    data
  })
}

/**
 * 获取系列列表
 * @returns {Promise} 系列列表Promise
 */
export const getSeriesList = () => {
  return request({
    url: '/v1/media/series'
  })
}

/**
 * 获取继续观看列表
 * @param {Number} limit - 数量限制
 * @returns {Promise} 视频列表Promise
 */
export const getContinueWatchList = (limit = 10) => {
  return request({
    url: '/v1/media/videos/continue-watch',
    params: { limit }
  })
}

/**
 * 获取音频列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 音频列表Promise
 */
export const getAudioList = (params = {}) => {
  return request({
    url: '/v1/media/audio',
    params
  })
}

/**
 * 获取音频详情
 * @param {Number} fileId - 文件ID
 * @returns {Promise} 音频详情Promise
 */
export const getAudioDetail = fileId => {
  return request({
    url: `/v1/media/audio/${fileId}`
  })
}

/**
 * 获取音频专辑列表
 * @returns {Promise} 专辑列表Promise
 */
export const getAudioAlbumList = () => {
  return request({
    url: '/v1/media/albums/audio'
  })
}

/**
 * 获取歌手列表
 * @returns {Promise} 歌手列表Promise
 */
export const getArtistList = () => {
  return request({
    url: '/v1/media/artists'
  })
}

/**
 * 获取播放列表
 * @returns {Promise} 播放列表Promise
 */
export const getPlaylistList = () => {
  return request({
    url: '/v1/media/playlists'
  })
}
