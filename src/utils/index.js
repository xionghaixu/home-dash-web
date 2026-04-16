/**
 * 格式化文件大小, 输出成带单位的字符串
 * @method formatSize
 * @grammar formatSize( size ) => String
 * @grammar formatSize( size, pointLength ) => String
 * @grammar formatSize( size, pointLength, units ) => String
 * @param {Number} size 文件大小
 * @param {Number} [pointLength=2] 精确到的小数点数。
 * @param {Array} [units=[ 'B', 'K', 'M', 'G', 'TB' ]] 单位数组。从字节，到千字节，一直往上指定。如果单位数组里面只指定了到了K(千字节)，同时文件大小大于M, 此方法的输出将还是显示成多少K.
 * @example
 * console.log( formatSize( 100 ) );    // => 100B
 * console.log( formatSize( 1024 ) );    // => 1.00K
 * console.log( formatSize( 1024, 0 ) );    // => 1K
 * console.log( formatSize( 1024 * 1024 ) );    // => 1.00M
 * console.log( formatSize( 1024 * 1024 * 1024 ) );    // => 1.00G
 * console.log( formatSize( 1024 * 1024 * 1024, 0, ['B', 'KB', 'MB'] ) );    // => 1024MB
 */
export const formatSize = (size, pointLength, units) => {
  if (size === null || size === undefined) {
    return undefined
  }
  let unit
  const unitsCopy = [...(units || ['B', 'K', 'M', 'G', 'TB'])]
  while ((unit = unitsCopy.shift()) && size > 1024) {
    size = size / 1024
  }
  return (unit === 'B' ? size : size.toFixed(pointLength || 2)) + unit
}

/**
 * 格式化时间，输出指定格式的时间
 * @description 将时间戳转换为指定格式的日期时间字符串
 * 支持的格式占位符：
 * - yyyy: 四位年份
 * - MM: 两位月份
 * - dd: 两位日期
 * - hh: 两位小时
 * - mm: 两位分钟
 * - ss: 两位秒数
 * - q: 季度
 * - S: 毫秒
 * @param {Number} timestamp 时间戳
 * @param {String} format 格式
 * @example
 * console.log( formatDateTime(1578754162044) );    // => 2020-01-11 22:49:22
 */
export const formatDateTime = (timestamp, format = 'yyyy/MM/dd hh:mm:ss') => {
  const date = new Date(timestamp),
    o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      'S+': date.getMilliseconds()
    }

  const yearMatch = format.match(/(y+)/)
  if (yearMatch) {
    format = format.replace(yearMatch[1], (date.getFullYear() + '').substr(4 - yearMatch[1].length))
  }

  for (const k in o) {
    const reg = new RegExp('(' + k + ')')
    const match = format.match(reg)
    if (match) {
      format = format.replace(
        match[1],
        match[1].length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return format
}

/**
 * 事件名称常量
 * @description 统一管理所有事件总线事件名称，避免硬编码和拼写错误
 */
export const EventNames = {
  // 上传相关
  OPEN_UPLOADER: 'openUploader',
  FLUSH_FILE_LIST: 'flushFileList',
  CANCEL_UPLOAD_BY_IDENTIFIER: 'cancelUploadByIdentifier',
  REFRESH_TRANSFERS: 'refreshTransfers'
}
