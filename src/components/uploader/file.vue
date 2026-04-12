<template>
  <div class="uploader-file" :status="status">
    <slot
      :file="file"
      :list="list"
      :status="status"
      :paused="paused"
      :error="error"
      :response="response"
      :average-speed="averageSpeed"
      :formated-average-speed="formatedAverageSpeed"
      :current-speed="currentSpeed"
      :is-complete="isComplete"
      :is-uploading="isUploading"
      :size="size"
      :formated-size="formatedSize"
      :uploaded-size="uploadedSize"
      :progress="progress"
      :progress-style="progressStyle"
      :progressing-class="progressingClass"
      :time-remaining="timeRemaining"
      :formated-time-remaining="formatedTimeRemaining"
      :type="type"
      :extension="extension"
      :file-category="fileCategory"
    >
      <div class="uploader-file-progress" :class="progressingClass" :style="progressStyle"></div>
      <div class="uploader-file-info">
        <div class="uploader-file-name">
          <i class="uploader-file-icon" :icon="fileCategory"></i>
          {{ file.name }}
        </div>
        <div class="uploader-file-size">{{ formatedSize }}</div>
        <div class="uploader-file-meta"></div>
        <div class="uploader-file-status">
          <span v-show="status === 'success'" class="success-text">✓ 上传完成</span>
          <span v-show="status === 'error'" class="error-text">✗ 上传失败</span>
          <span v-show="status !== 'uploading' && status !== 'success' && status !== 'error'">
            {{ statusText }}
          </span>
          <span v-show="status === 'uploading'">
            <span>{{ progressStyle.progress }}</span>
            <em>{{ formatedAverageSpeed }}</em>
            <i>{{ formatedTimeRemaining }}</i>
          </span>
        </div>
        <div class="uploader-file-actions">
          <span
            class="uploader-file-pause"
            v-show="status === 'uploading' || status === 'waiting'"
            @click="pause"
          ></span>
          <span class="uploader-file-resume" v-show="status === 'paused'" @click="resume">️</span>
          <span class="uploader-file-retry" v-show="status === 'error'" @click="retry"></span>
          <span class="uploader-file-remove" @click="remove"></span>
        </div>
      </div>
    </slot>
  </div>
</template>

<script>
/**
 * UploaderFile 组件 - 单个上传文件项组件
 * @description 用于展示单个文件的上传进度、状态和操作按钮
 * @component
 * @example
 * <uploader-file :file="file" :list="true"></uploader-file>
 */
import Uploader from 'simple-uploader.js'
import FILE_EVENTS from './common/file-events'
import { secondsToStr } from './common/utils'

const COMPONENT_NAME = 'UploaderFile'

export default {
  name: COMPONENT_NAME,
  props: {
    file: {
      type: Object,
      default() {
        return {}
      }
    },
    list: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      response: null,
      paused: false,
      error: false,
      averageSpeed: 0,
      currentSpeed: 0,
      isComplete: false,
      isUploading: false,
      size: 0,
      formatedSize: '',
      uploadedSize: 0,
      progress: 0,
      timeRemaining: 0,
      type: '',
      extension: '',
      progressingClass: ''
    }
  },
  computed: {
    /**
     * 文件分类
     * @description 根据文件扩展名判断文件类型
     * 实现逻辑：
     * 1. 如果是文件夹，直接返回'folder'
     * 2. 根据扩展名映射表判断文件类型
     * 3. 支持的文件类型：image、video、audio、document
     * @returns {String} 文件类型（folder、image、video、audio、document、unknown）
     */
    fileCategory() {
      const extension = this.extension
      const isFolder = this.file.isFolder
      let type = isFolder ? 'folder' : 'unknown'

      // 文件类型映射表，定义各类型对应的文件扩展名
      const categoryMap = this.file.uploader.opts.categoryMap
      const typeMap = categoryMap || {
        image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
        document: [
          'doc',
          'txt',
          'docx',
          'pages',
          'epub',
          'pdf',
          'numbers',
          'csv',
          'xls',
          'xlsx',
          'keynote',
          'ppt',
          'pptx'
        ]
      }

      // 遍历类型映射表，匹配文件扩展名
      Object.keys(typeMap).forEach(_type => {
        const extensions = typeMap[_type]
        if (extensions.indexOf(extension) > -1) {
          type = _type
        }
      })
      return type
    },
    /**
     * 进度样式
     * @description 计算上传进度条的CSS样式
     * 实现逻辑：
     * 1. 将进度值转换为百分比
     * 2. 计算CSS transform值（从-100%到0%）
     * 3. 支持多种浏览器前缀（webkit、moz、ms）
     * @returns {Object} 包含进度百分比和transform样式的对象
     */
    progressStyle() {
      const progress = Math.floor(this.progress * 100)
      const style = `translateX(${Math.floor(progress - 100)}%)`
      return {
        progress: `${progress}%`,
        webkitTransform: style,
        mozTransform: style,
        msTransform: style,
        transform: style
      }
    },
    /**
     * 格式化平均速度
     * @description 将平均上传速度格式化为可读字符串
     * @returns {String} 格式化后的速度字符串，如 "2.5 MB / s"
     */
    formatedAverageSpeed() {
      return `${Uploader.utils.formatSize(this.averageSpeed)} / s`
    },
    /**
     * 文件状态
     * @description 根据文件上传情况判断当前状态
     * 状态优先级：完成 > 错误 > 上传中 > 暂停 > 等待
     * @returns {String} 文件状态（success、error、uploading、paused、waiting）
     */
    status() {
      const isUploading = this.isUploading
      const isComplete = this.isComplete
      const isError = this.error
      const paused = this.paused

      // 按优先级判断文件状态
      if (isComplete) {
        return 'success'
      } else if (isError) {
        return 'error'
      } else if (isUploading) {
        return 'uploading'
      } else if (paused) {
        return 'paused'
      } else {
        return 'waiting'
      }
    },
    /**
     * 状态文本
     * @description 获取状态对应的显示文本
     * 支持自定义状态文本映射
     * @returns {String} 状态显示文本
     */
    statusText() {
      const status = this.status
      const fileStatusText = this.file.uploader.fileStatusText
      let txt = status

      // 支持函数形式的状态文本映射
      if (typeof fileStatusText === 'function') {
        txt = fileStatusText(status, this.response)
      } else {
        txt = fileStatusText[status]
      }
      return txt || status
    },
    /**
     * 格式化剩余时间
     * @description 将剩余时间转换为可读字符串
     * 实现逻辑：
     * 1. 检查剩余时间是否有效（非无穷大且非0）
     * 2. 使用secondsToStr函数转换为可读格式
     * 3. 支持自定义时间格式化函数
     * @returns {String} 格式化后的剩余时间字符串
     */
    formatedTimeRemaining() {
      const timeRemaining = this.timeRemaining
      const file = this.file

      // 检查剩余时间是否有效
      if (timeRemaining === Number.POSITIVE_INFINITY || timeRemaining === 0) {
        return ''
      }

      // 转换为可读格式
      let parsedTimeRemaining = secondsToStr(timeRemaining)
      const parseTimeRemaining = file.uploader.opts.parseTimeRemaining

      // 支持自定义时间格式化
      if (parseTimeRemaining) {
        parsedTimeRemaining = parseTimeRemaining(timeRemaining, parsedTimeRemaining)
      }
      return parsedTimeRemaining
    }
  },
  watch: {
    status(newStatus, oldStatus) {
      if (oldStatus && newStatus === 'uploading' && oldStatus !== 'uploading') {
        this.tid = setTimeout(() => {
          this.progressingClass = 'uploader-file-progressing'
        }, 200)
      } else {
        clearTimeout(this.tid)
        this.progressingClass = ''
      }
    }
  },
  methods: {
    /**
     * 检查文件操作状态
     * @description 更新文件的暂停、错误和上传状态
     */
    _actionCheck() {
      this.paused = this.file.paused
      this.error = this.file.error
      this.isUploading = this.file.isUploading()
    },
    /**
     * 暂停上传
     * @description 暂停当前文件的上传
     */
    pause() {
      this.file.pause()
      this._actionCheck()
      this._fileProgress()
    },
    /**
     * 恢复上传
     * @description 恢复当前文件的上传
     */
    resume() {
      this.file.resume()
      this._actionCheck()
    },
    /**
     * 移除文件
     * @description 取消当前文件的上传
     */
    remove() {
      this.file.cancel()
    },
    /**
     * 重试上传
     * @description 重新尝试上传失败的文件
     */
    retry() {
      this.file.retry()
      this._actionCheck()
    },
    /**
     * 处理响应消息
     * @description 解析服务器响应消息
     * @param {String} message - 响应消息
     */
    processResponse(message) {
      let res = message
      try {
        res = JSON.parse(message)
        // eslint-disable-next-line no-empty
      } catch (e) {}
      this.response = res
    },
    /**
     * 文件事件处理器
     * @description 处理文件相关事件（进度、成功、完成、错误）
     * 实现逻辑：
     * 1. 根据list属性判断目标文件（根文件或当前文件）
     * 2. 如果是列表模式且事件为fileSuccess，处理响应消息
     * 3. 否则调用对应的事件处理方法
     * @param {String} event - 事件名称
     * @param {Array} args - 事件参数，通常包含[rootFile, file, message]
     */
    fileEventsHandler(event, args) {
      const rootFile = args[0]
      const file = args[1]

      // 根据list属性确定目标文件
      const target = this.list ? rootFile : file

      // 检查当前文件是否是目标文件 - 使用ID比较确保准确性
      const isTarget = this.file.id === target?.id || this.file === target

      if (isTarget) {
        // 列表模式下的成功事件需要处理响应消息和更新状态
        if (this.list && event === 'fileSuccess') {
          this.processResponse(args[2])
          this._fileSuccess(args[0], args[1], args[2])
          return
        }
        // 调用对应的事件处理方法（如_fileProgress、_fileSuccess等）
        this[`_${event}`].apply(this, args)
      }
    },
    /**
     * 文件进度更新
     * @description 更新文件上传进度信息
     */
    _fileProgress() {
      this.progress = this.file.progress()
      this.averageSpeed = this.file.averageSpeed
      this.currentSpeed = this.file.currentSpeed
      this.timeRemaining = this.file.timeRemaining()
      this.uploadedSize = this.file.sizeUploaded()
      this._actionCheck()
    },
    /**
     * 文件上传成功处理
     * @description 处理文件上传成功事件
     * @param {Object} rootFile - 根文件对象
     * @param {Object} file - 文件对象
     * @param {String} message - 响应消息
     */
    _fileSuccess(rootFile, file, message) {
      if (rootFile) {
        this.processResponse(message)
      }
      this._fileProgress()
      this.error = false
      this.isComplete = true
      this.isUploading = false
    },
    /**
     * 文件上传完成处理
     * @description 处理文件上传完成事件
     */
    _fileComplete() {
      this._fileSuccess()
    },
    /**
     * 文件上传错误处理
     * @description 处理文件上传错误事件
     * @param {Object} rootFile - 根文件对象
     * @param {Object} file - 文件对象
     * @param {String} message - 错误消息
     */
    _fileError(rootFile, file, message) {
      this._fileProgress()
      this.processResponse(message)
      this.error = true
      this.isComplete = false
      this.isUploading = false
    }
  },
  mounted() {
    // 静态属性列表：直接从file对象复制
    const STATIC_PROPS = ['paused', 'error', 'averageSpeed', 'currentSpeed']

    // 函数属性列表：需要调用file对象的方法获取值
    const FN_PROPS = [
      'isComplete',
      'isUploading',
      {
        key: 'size',
        fn: 'getSize'
      },
      {
        key: 'formatedSize',
        fn: 'getFormatSize'
      },
      {
        key: 'uploadedSize',
        fn: 'sizeUploaded'
      },
      'progress',
      'timeRemaining',
      {
        key: 'type',
        fn: 'getType'
      },
      {
        key: 'extension',
        fn: 'getExtension'
      }
    ]

    // 初始化静态属性
    STATIC_PROPS.forEach(prop => {
      this[prop] = this.file[prop]
    })

    // 初始化函数属性
    FN_PROPS.forEach(fnProp => {
      if (typeof fnProp === 'string') {
        // 简单字符串形式：直接调用同名方法
        this[fnProp] = this.file[fnProp]()
      } else {
        // 对象形式：使用指定的key存储，调用指定的fn方法
        this[fnProp.key] = this.file[fnProp.fn]()
      }
    })

    // 注册事件处理器
    const handlers = (this._handlers = {})
    const eventHandler = event => {
      handlers[event] = (...args) => {
        this.fileEventsHandler(event, args)
      }
      return handlers[event]
    }

    // 为所有文件事件注册监听器
    FILE_EVENTS.forEach(event => {
      this.file.uploader.on(event, eventHandler(event))
    })
  },
  unmounted() {
    FILE_EVENTS.forEach(event => {
      this.file.uploader.off(event, this._handlers[event])
    })
    this._handlers = null
  }
}
</script>

<style>
.uploader-file {
  position: relative;
  height: 49px;
  line-height: 49px;
  overflow: hidden;
  border-bottom: 1px solid #cdcdcd;
}
.uploader-file[status='waiting'] .uploader-file-pause,
.uploader-file[status='uploading'] .uploader-file-pause {
  display: block !important;
}
.uploader-file[status='paused'] .uploader-file-resume {
  display: block !important;
}
.uploader-file[status='error'] .uploader-file-retry {
  display: block !important;
}
.uploader-file[status='success'] .uploader-file-pause,
.uploader-file[status='success'] .uploader-file-resume,
.uploader-file[status='success'] .uploader-file-retry {
  display: none !important;
  pointer-events: none;
  cursor: default;
}
.uploader-file[status='error'] .uploader-file-progress {
  background: #ffe0e0;
}
.uploader-file[status='success'] .uploader-file-progress {
  background: #d4edda;
}
.uploader-file-status .success-text {
  color: #28a745;
  font-weight: bold;
}
.uploader-file-status .error-text {
  color: #dc3545;
  font-weight: bold;
}
.uploader-file-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #e2eeff;
  transform: translateX(-100%);
}
.uploader-file-progressing {
  transition: all 0.4s linear;
}
.uploader-file-info {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
}
.uploader-file-info:hover {
  background-color: rgba(240, 240, 240, 0.2);
}
.uploader-file-info i,
.uploader-file-info em {
  font-style: normal;
}
.uploader-file-name,
.uploader-file-size,
.uploader-file-meta,
.uploader-file-status,
.uploader-file-actions {
  float: left;
  position: relative;
  height: 100%;
}
.uploader-file-name {
  width: 45%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-indent: 14px;
}
.uploader-file-icon {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: top;
  margin-top: 13px;
  margin-right: 8px;
}
.uploader-file-icon::before {
  content: '📃';
  display: block;
  height: 100%;
  font-size: 24px;
  line-height: 1;
  text-indent: 0;
}
.uploader-file-icon[icon='folder']::before {
  content: '📂';
}
.uploader-file-icon[icon='image']::before {
  content: '📊';
}
.uploader-file-icon[icon='video']::before {
  content: '📹';
}
.uploader-file-icon[icon='audio']::before {
  content: '🎵';
}
.uploader-file-icon[icon='document']::before {
  content: '📋';
}
.uploader-file-size {
  width: 13%;
  text-indent: 10px;
}
.uploader-file-meta {
  width: 8%;
}
.uploader-file-status {
  width: 24%;
  text-indent: 20px;
}
.uploader-file-actions {
  width: 10%;
}
.uploader-file-actions > span {
  display: none;
  float: left;
  width: 16px;
  height: 16px;
  margin-top: 16px;
  margin-right: 10px;
  cursor: pointer;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABkCAYAAAD0ZHJ6AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxMAAAsTAQCanBgAAARkSURBVGje7ZnfS1NRHMAH4ptPkvQSuAdBkCxD8FUQJMEULUgzy1KyyPVQ4JMiiP4Bvg6EwUQQfMmwhwRDshwaKUjDVCgoSdDNHkzTJZ6+Z37Purve8+PeTb2TM/ggu+ew89l33x8H9BBCPG7GowXTJej3+wnDvEm0JuLC04+EYWftVAUv+fiCvDUdQR1BHUEdQR3BTIygvixoQS14XgTtthLVdpNWwXRLqvQ724LplFRtyrYF0yVpFLQrKRVMh6RZ0I6kkmCqklaCqpKZH0FX56Crq9jVfdDVk0RfFrSgFsxkQVmLcdKCVrKySCrryhPEyYShhzOcrFtG0EoilfHHk1CRU5rF6ZjNZhlVOW6RnMSVyyilKies4pO41diVy8wIujoHXV3FGdMHXTtJKLFYTLhZtq4vC1rwXApCZTIqgR6g1PBMCO9DL3bMMSqBHqDU8EyISDAHiGKvWwcCQG2KgjlAFCDAOhAAap0K5gKLphk8mqJgLrCIgoxRJ4J5wKpJ7gAoMkn5EBXBPGDVJHcAFJmkfIhQcAql1oBpTvTol9gG9pm4RHAKpdaAaU706JfYBvaZuJVgPQrt4sFlnOh5MC/p3lmJYD0K7eLBZZzoeTAv6d5ZnuAYHjpgEOnk5F0ufhG6v1ggOIaHDhhEOjl5l4tfhO4vthLcwAMrFNvLJO5vEwhu4IEViu1lEve3WQmyoihQFBzG/V0CQVYUBYqCw7i/SxTBcpsRbFeIYLnNCLZbCY5b5KAnxRwct8hBj9McZFVMW0ihRNBuFdMWUigRlFaxuQ9WWYjRMTiIe5z0wSoLMToGB3GPsA9aTZIJoB+nRgBnM1tzOkkmgH6cGgGczWzNpzqLx3n/aULJJgezeNw07oxQySbVywKjBOgFRnDs+VEsx8FlgVEC9AIjOPb8KJYjvSzoG7UW1IJaUAtqQS14toLNM5fN5APdwBJA8G83Pk/aK/rgzVvXzeQD3cASQPBvNz5P2ssTzAaGUIrHEO6zI5gNDKEUjyHcxxWkh4Ylcowwk1QQpIeGJXKMMJO0EgwqyjGCioJBJvDrxRMSuVOTJEXfbz1/bHwWtBL0yoQehK6RucgE+bGzanzulQh6E3IgQV+xpc8kcrfuSO7eTfJ3ZYmQw0Oy9azVKOk1C/bJ5D5F38YPeLfx0rjWJxHsS0SqsSYuxySjj5qO5Oj7xQWy2VBtFOwzCy6ryH3YfE3uh64Y1xckgstJPydEjkkeHv07Iy4Xaao15+KCWTBx6M/db+T9xivSErqaJDdzXI6yLRE8Vgg0coex/SPJvT0SbWu0KpZtbgSpCH3NRt7I5OxHkObc6heU+/M/J5vrpBFM5GBLqCQux14COXs5CNXK5OjPGm1tSMrJSOMNYQ4mVTGV/L6zTL7+DovkbFUxbSW0Wo05l8hJWsU+cRWfSh+Mt5Lb1ck/J1TvVsdDaR/MiEni+llsdZuZp62EViu+96bpNjNPWwmtVnzvFd5m9IVVC54x/wA7gNvqFG9vXQAAAABJRU5ErkJggg==')
    no-repeat 0 0;
}
.uploader-file-actions > span:hover {
  background-position-x: -21px;
}
.uploader-file-actions .uploader-file-pause {
  background-position-y: 0;
}
.uploader-file-actions .uploader-file-resume {
  background-position-y: -17px;
}
.uploader-file-actions .uploader-file-retry {
  background-position-y: -53px;
}
.uploader-file-actions .uploader-file-remove {
  display: block;
  background-position-y: -34px;
}
</style>
