<template>
  <div class="uploader-file" :class="[`status-${status}`]">
    <div class="file-progress-bar">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
    </div>

    <div class="file-content">
      <div class="file-icon">
        <el-icon :size="24"><component :is="fileCategoryIcon" /></el-icon>
      </div>

      <div class="file-info">
        <div class="file-name" :title="file.name">{{ file.name }}</div>
        <div class="file-meta">
          <span class="file-size">{{ formatedSize }}</span>
          <span v-if="status === 'uploading'" class="upload-speed">{{ formatedAverageSpeed }}</span>
          <span v-if="status === 'uploading'" class="time-remaining">
            {{ formatedTimeRemaining }}
          </span>
        </div>
      </div>

      <div class="file-status">
        <el-tag v-if="status === 'success'" type="success" size="small" effect="light">
          <el-icon><Check /></el-icon>
          上传完成
        </el-tag>
        <el-tag v-else-if="status === 'error'" type="danger" size="small" effect="light">
          <el-icon><WarningFilled /></el-icon>
          上传失败
        </el-tag>
        <el-tag v-else-if="status === 'paused'" type="warning" size="small" effect="light">
          <el-icon><VideoPause /></el-icon>
          已暂停
        </el-tag>
        <span v-else-if="status === 'uploading'" class="progress-text">{{ progressPercent }}%</span>
        <span v-else class="waiting-text">等待上传</span>
      </div>

      <div class="file-actions">
        <el-button
          v-if="status === 'uploading' || status === 'waiting'"
          :icon="VideoPause"
          circle
          size="small"
          text
          title="暂停"
          @click="pause"
        />
        <el-button
          v-if="status === 'paused'"
          :icon="VideoPlay"
          circle
          size="small"
          text
          title="继续"
          @click="resume"
        />
        <el-button
          v-if="status === 'error'"
          :icon="Refresh"
          circle
          size="small"
          text
          title="重试"
          @click="retry"
        />
        <el-button :icon="Close" circle size="small" text title="移除" @click="remove" />
      </div>
    </div>
  </div>
</template>

<script>
import Uploader from 'simple-uploader.js'
import FILE_EVENTS from './common/file-events'
import { secondsToStr } from './common/utils'
import {
  Close,
  Check,
  WarningFilled,
  Refresh,
  VideoPlay,
  VideoPause,
  Document,
  PictureFilled,
  VideoCamera,
  Microphone,
  Folder,
  Files
} from '@element-plus/icons-vue'

const COMPONENT_NAME = 'UploaderFile'

export default {
  name: COMPONENT_NAME,
  components: {
    Close,
    Check,
    WarningFilled,
    Refresh,
    VideoPlay,
    VideoPause,
    Document,
    PictureFilled,
    VideoCamera,
    Microphone,
    Folder,
    Files
  },
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
    fileCategoryIcon() {
      const category = this.fileCategory
      const iconMap = {
        image: PictureFilled,
        video: VideoCamera,
        audio: Microphone,
        document: Document,
        folder: Folder
      }
      return iconMap[category] || Files
    },
    fileCategory() {
      const extension = this.extension?.toLowerCase()
      const isFolder = this.file.isFolder
      if (isFolder) return 'folder'

      const categoryMap = this.file.uploader.opts.categoryMap
      const typeMap = categoryMap || {
        image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp', 'svg', 'ico', 'tiff'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'mov', 'wmv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'm4a', 'ape']
      }

      for (const [category, extensions] of Object.entries(typeMap)) {
        if (extensions.includes(extension)) {
          return category
        }
      }
      return 'document'
    },
    progressPercent() {
      return Math.floor(this.progress * 100)
    },
    formatedAverageSpeed() {
      return `${Uploader.utils.formatSize(this.averageSpeed)}/s`
    },
    status() {
      if (this.isComplete) return 'success'
      if (this.error) return 'error'
      if (this.isUploading) return 'uploading'
      if (this.paused) return 'paused'
      return 'waiting'
    },
    formatedTimeRemaining() {
      if (this.timeRemaining === Number.POSITIVE_INFINITY || this.timeRemaining === 0) {
        return ''
      }
      return secondsToStr(this.timeRemaining)
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
  mounted() {
    const STATIC_PROPS = ['paused', 'error', 'averageSpeed', 'currentSpeed']
    const FN_PROPS = [
      'isComplete',
      'isUploading',
      { key: 'size', fn: 'getSize' },
      { key: 'formatedSize', fn: 'getFormatSize' },
      { key: 'uploadedSize', fn: 'sizeUploaded' },
      'progress',
      'timeRemaining',
      { key: 'type', fn: 'getType' },
      { key: 'extension', fn: 'getExtension' }
    ]

    STATIC_PROPS.forEach(prop => {
      this[prop] = this.file[prop]
    })

    FN_PROPS.forEach(fnProp => {
      if (typeof fnProp === 'string') {
        this[fnProp] = this.file[fnProp]()
      } else {
        this[fnProp.key] = this.file[fnProp.fn]()
      }
    })

    const handlers = (this._handlers = {})
    const eventHandler = event => {
      handlers[event] = (...args) => {
        this.fileEventsHandler(event, args)
      }
      return handlers[event]
    }

    FILE_EVENTS.forEach(event => {
      this.file.uploader.on(event, eventHandler(event))
    })
  },
  unmounted() {
    FILE_EVENTS.forEach(event => {
      this.file.uploader.off(event, this._handlers[event])
    })
    this._handlers = null
  },
  methods: {
    _actionCheck() {
      this.paused = this.file.paused
      this.error = this.file.error
      this.isUploading = this.file.isUploading()
    },
    pause() {
      this.file.pause()
      this._actionCheck()
      this._fileProgress()
    },
    resume() {
      this.file.resume()
      this._actionCheck()
    },
    remove() {
      this.file.cancel()
    },
    retry() {
      this.file.retry()
      this._actionCheck()
    },
    processResponse(message) {
      let res = message
      try {
        res = JSON.parse(message)
      } catch {
        // 忽略 JSON 解析错误，使用原始消息
      }
      this.response = res
    },
    fileEventsHandler(event, args) {
      const rootFile = args[0]
      const file = args[1]
      const target = this.list ? rootFile : file
      const isTarget = this.file.id === target?.id || this.file === target

      if (isTarget) {
        if (this.list && event === 'fileSuccess') {
          this.processResponse(args[2])
          this._fileSuccess(args[0], args[1], args[2])
          return
        }
        this[`_${event}`].apply(this, args)
      }
    },
    _fileProgress() {
      this.progress = this.file.progress()
      this.averageSpeed = this.file.averageSpeed
      this.currentSpeed = this.file.currentSpeed
      this.timeRemaining = this.file.timeRemaining()
      this.uploadedSize = this.file.sizeUploaded()
      this._actionCheck()
    },
    _fileSuccess(rootFile, file, message) {
      if (rootFile) {
        this.processResponse(message)
      }
      this._fileProgress()
      this.error = false
      this.isComplete = true
      this.isUploading = false
    },
    _fileComplete() {
      this._fileSuccess()
    },
    _fileError(rootFile, file, message) {
      this._fileProgress()
      this.processResponse(message)
      this.error = true
      this.isComplete = false
      this.isUploading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.uploader-file {
  position: relative;
  background: #fff;
  border-radius: 8px;
  margin: 8px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &.status-success {
    border-left: 3px solid #67c23a;
  }

  &.status-error {
    border-left: 3px solid #f56c6c;
  }

  &.status-paused {
    border-left: 3px solid #e6a23c;
  }

  &.status-uploading,
  &.status-waiting {
    border-left: 3px solid #409eff;
  }
}

.file-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #f0f0f0;
  border-radius: 0 0 8px 8px;
  overflow: hidden;

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #409eff, #67c23a);
    transition: width 0.3s ease;
  }
}

.file-content {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #606266;
}

.status-success .file-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.status-error .file-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.status-paused .file-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.file-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;

  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  .file-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #909399;

    .upload-speed {
      color: #409eff;
    }

    .time-remaining {
      color: #909399;
    }
  }
}

.file-status {
  flex-shrink: 0;

  .progress-text {
    font-size: 14px;
    font-weight: 600;
    color: #409eff;
  }

  .waiting-text {
    font-size: 12px;
    color: #909399;
  }
}

.file-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;

  .uploader-file:hover & {
    opacity: 1;
  }
}
</style>
