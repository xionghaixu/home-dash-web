import SparkMD5 from 'spark-md5'

/**
 * 文件MD5计算工具
 * @description 提供文件MD5计算功能，用于秒传和断点续传
 * @module utils/md5
 */

/**
 * 计算文件的MD5值
 * @description 使用分片方式计算大文件的MD5，避免内存溢出
 * @param {File} file - 文件对象
 * @param {Object} options - 配置选项
 * @param {Number} options.chunkSize - 分片大小，默认2MB
 * @param {Function} options.onProgress - 进度回调函数
 * @returns {Promise<String>} MD5哈希值
 */
export const calculateFileMD5 = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const { chunkSize = 2 * 1024 * 1024, onProgress } = options
    const chunks = Math.ceil(file.size / chunkSize)
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    let currentChunk = 0

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++

      if (onProgress) {
        onProgress({
          current: currentChunk,
          total: chunks,
          percent: Math.round((currentChunk / chunks) * 100)
        })
      }

      if (currentChunk < chunks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    fileReader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    const loadNext = () => {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}

/**
 * 计算文件的快速MD5（仅计算部分内容）
 * @description 通过计算文件头部、中部、尾部的部分内容来快速生成MD5
 * 适用于大文件的快速校验，但不保证唯一性
 * @param {File} file - 文件对象
 * @param {Number} sampleSize - 采样大小，默认512KB
 * @returns {Promise<String>} MD5哈希值
 */
export const calculateQuickMD5 = async (file, sampleSize = 512 * 1024) => {
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()

  const readChunk = (start, end) => {
    return new Promise((resolve, reject) => {
      fileReader.onload = () => resolve(fileReader.result)
      fileReader.onerror = reject
      fileReader.readAsArrayBuffer(file.slice(start, end))
    })
  }

  const chunkSize = Math.min(sampleSize, file.size / 3)

  const head = await readChunk(0, chunkSize)
  spark.append(head)

  if (file.size > chunkSize * 2) {
    const middle = await readChunk(
      Math.floor(file.size / 2) - chunkSize / 2,
      Math.floor(file.size / 2) + chunkSize / 2
    )
    spark.append(middle)
  }

  if (file.size > chunkSize) {
    const tail = await readChunk(file.size - chunkSize, file.size)
    spark.append(tail)
  }

  return spark.end()
}

/**
 * 计算分片的MD5
 * @description 计算文件分片的MD5，用于断点续传校验
 * @param {Blob} chunk - 分片数据
 * @returns {Promise<String>} MD5哈希值
 */
export const calculateChunkMD5 = (chunk) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      resolve(spark.end())
    }

    fileReader.onerror = () => {
      reject(new Error('分片读取失败'))
    }

    fileReader.readAsArrayBuffer(chunk)
  })
}

export default {
  calculateFileMD5,
  calculateQuickMD5,
  calculateChunkMD5
}
