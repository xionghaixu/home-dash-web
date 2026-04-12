/**
 * 将秒数转换为可读的时间字符串
 * @description 将秒数转换为年、天、小时、分钟、秒的可读格式
 * @param {Number} temp - 秒数
 * @returns {String} 格式化后的时间字符串，如 "2 hours"、"3 minutes"
 * @example
 * secondsToStr(7200) // => "2 hours"
 * secondsToStr(90) // => "1 minute 30 seconds"
 */
export function secondsToStr(temp) {
  const years = Math.floor(temp / 31536000)
  if (years) {
    return years + ' year' + numberEnding(years)
  }
  const days = Math.floor((temp %= 31536000) / 86400)
  if (days) {
    return days + ' day' + numberEnding(days)
  }
  const hours = Math.floor((temp %= 86400) / 3600)
  if (hours) {
    return hours + ' hour' + numberEnding(hours)
  }
  const minutes = Math.floor((temp %= 3600) / 60)
  if (minutes) {
    return minutes + ' minute' + numberEnding(minutes)
  }
  const seconds = temp % 60
  return seconds + ' second' + numberEnding(seconds)
  function numberEnding(number) {
    return number > 1 ? 's' : ''
  }
}

/**
 * 将驼峰命名转换为短横线命名
 * @description 将驼峰命名法的字符串转换为短横线命名法
 * @param {String} s - 驼峰命名的字符串
 * @returns {String} 短横线命名的字符串
 * @example
 * kebabCase('fileName') // => "file-name"
 * kebabCase('uploadStart') // => "upload-start"
 */
export function kebabCase(s) {
  return s.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
}
