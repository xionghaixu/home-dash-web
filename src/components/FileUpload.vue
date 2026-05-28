<template>
  <div>
    <transition name="slide-up">
      <div v-if="showUploadBar" class="upload-center" :class="{ minimized: isMinimized }">
        <div class="center-header" @click="toggleMinimize">
          <div class="header-left">
            <el-icon :size="16" class="collapse-icon">
              <component :is="isMinimized ? ArrowUp : ArrowDown" />
            </el-icon>
            <span class="header-title">上传中心</span>
            <span class="header-count">{{ totalCount }} 个文件</span>
            <span v-if="uploadingCount > 0" class="uploading-indicator">
              <span class="dot"></span>
              上传中 {{ uploadingCount }} 个
            </span>
          </div>
          <div class="header-right" @click.stop>
            <el-button v-if="uploadingCount > 0" size="small" text @click="pauseAll">
              暂停全部
            </el-button>
            <el-button size="small" text type="danger" @click="clearAll">清空</el-button>
          </div>
        </div>

        <transition name="expand">
          <div v-show="!isMinimized" class="center-body">
            <div class="center-tabs">
              <div
                class="tab-item"
                :class="{ active: activeTab === 'uploading' }"
                @click="activeTab = 'uploading'"
              >
                <span class="tab-name">传输中</span>
                <span v-if="uploadingCount > 0" class="tab-badge">{{ uploadingCount }}</span>
              </div>
              <div
                class="tab-item"
                :class="{ active: activeTab === 'all' }"
                @click="activeTab = 'all'"
              >
                <span class="tab-name">全部</span>
              </div>
              <div
                class="tab-item"
                :class="{ active: activeTab === 'done' }"
                @click="activeTab = 'done'"
              >
                <span class="tab-name">已完成</span>
                <span v-if="completedCount > 0" class="tab-badge success">
                  {{ completedCount }}
                </span>
              </div>
            </div>

            <div class="center-list">
              <div
                v-for="file in filteredFiles"
                :key="file.id"
                class="file-item"
                :class="getFileStatus(file)"
              >
                <div class="file-progress-ring">
                  <svg viewBox="0 0 36 36" class="progress-svg">
                    <path
                      class="progress-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke-width="3"
                    />
                    <path
                      class="progress-fill"
                      :class="getFileStatus(file)"
                      :stroke-dasharray="`${getFileProgress(file)}, 100`"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span class="progress-text">{{ getFileProgress(file) }}%</span>
                </div>

                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">
                    <span v-if="file.isUploading?.()">{{ getFileSpeed(file) }}</span>
                    <span v-else-if="file.isComplete && !file.error" class="text-success">
                      已完成
                    </span>
                    <span v-else-if="file.error" class="text-error">上传失败</span>
                    <span v-else class="text-waiting">等待中</span>
                  </div>
                </div>

                <div class="file-actions">
                  <el-button
                    v-if="file.isUploading?.()"
                    :icon="VideoPause"
                    circle
                    size="small"
                    text
                    title="暂停"
                    @click="pauseFile(file)"
                  />
                  <el-button
                    v-if="file.paused"
                    :icon="VideoPlay"
                    circle
                    size="small"
                    text
                    title="继续"
                    @click="resumeFile(file)"
                  />
                  <el-button
                    v-if="file.error"
                    :icon="Refresh"
                    circle
                    size="small"
                    text
                    title="重试"
                    @click="retryFile(file)"
                  />
                  <el-button
                    :icon="Close"
                    circle
                    size="small"
                    text
                    title="移除"
                    @click="removeFile(file)"
                  />
                </div>
              </div>

              <div v-if="filteredFiles.length === 0" class="empty-state">
                <el-icon :size="40"><Upload /></el-icon>
                <p>暂无文件</p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showMinimizedBar" class="minimized-bar" @click="toggleMinimize">
        <el-icon :size="16" class="bar-icon"><UploadFilled /></el-icon>
        <span class="bar-text">上传中 {{ uploadingCount }} 个文件</span>
        <el-icon :size="14" class="bar-arrow"><ArrowUp /></el-icon>
      </div>
    </transition>

    <Uploader
      ref="uploaderRef"
      :options="uploaderOptions"
      :auto-start="true"
      :file-status-text="statusText"
      class="uploader-trigger"
      @file-added="handleFileAdded"
      @file-success="handleFileSuccess"
      @file-error="handleFileError"
    >
      <UploaderBtn id="global-uploader-btn" ref="uploadBtnRef">选择文件</UploaderBtn>
    </Uploader>
  </div>
</template>

<script>
import Uploader from './uploader/uploader.vue'
import UploaderBtn from './uploader/btn.vue'
import { resourceUploadUrl, mergeResource } from '@/apis/resource'
import { useAppStore } from '@/stores/app'
import {
  Upload,
  Close,
  Refresh,
  VideoPause,
  VideoPlay,
  ArrowDown,
  ArrowUp,
  UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import UploaderUtils from 'simple-uploader.js'

export default {
  name: 'FileUpload',
  components: {
    Uploader,
    UploaderBtn,
    Upload,
    Close,
    Refresh,
    VideoPause,
    VideoPlay,
    ArrowDown,
    ArrowUp,
    UploadFilled
  },
  data() {
    return {
      store: useAppStore(),
      fileMap: {},
      uploaderOptions: {
        target: resourceUploadUrl(),
        chunkSize: 2048000,
        fileParameterName: 'file',
        maxChunkRetries: 3,
        testChunks: true,
        simultaneousUploads: 3,
        allowDuplicateUploads: true,
        generateUniqueIdentifier: (file) => {
          const relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name
          const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9)
          return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '') + '-' + uniqueSuffix
        }
      },
      statusText: {
        success: '完成',
        error: '失败',
        uploading: '上传中',
        paused: '已暂停',
        waiting: '等待'
      },
      activeTab: 'uploading',
      isMinimized: false,
      progressTimer: null,
      lastProgressEmitTime: 0
    }
  },
  computed: {
    uploaderInstance() {
      return this.$refs.uploaderRef?.uploader
    },
    files() {
      return this.uploaderInstance?.files || []
    },
    showUploadBar() {
      return this.files.length > 0
    },
    showMinimizedBar() {
      return this.files.length > 0 && this.isMinimized
    },
    totalCount() {
      return this.files.length
    },
    uploadingCount() {
      return this.files.filter(f => f.isUploading?.()).length
    },
    completedCount() {
      return this.files.filter(f => f.isComplete && !f.error).length
    },
    errorCount() {
      return this.files.filter(f => f.error).length
    },
    filteredFiles() {
      if (this.activeTab === 'uploading') {
        return this.files.filter(
          f => f.isUploading?.() || f.paused || (!f.isComplete && !f.error && !f.isUploading?.())
        )
      } else if (this.activeTab === 'done') {
        return this.files.filter(f => f.isComplete && !f.error)
      }
      return this.files
    }
  },
  mounted() {
    window.eventBus.on('openUploader', this.triggerUpload)
    window.eventBus.on('pauseUploadByIdentifier', this.pauseByIdentifier)
    window.eventBus.on('resumeUploadByIdentifier', this.resumeByIdentifier)
    window.eventBus.on('cancelUploadByIdentifier', this.cancelByIdentifier)
    window.eventBus.on('triggerFileAdd', this.handleDroppedFiles)
    this.startProgressPolling()
  },
  unmounted() {
    window.eventBus.off('openUploader', this.triggerUpload)
    window.eventBus.off('pauseUploadByIdentifier', this.pauseByIdentifier)
    window.eventBus.off('resumeUploadByIdentifier', this.resumeByIdentifier)
    window.eventBus.off('cancelUploadByIdentifier', this.cancelByIdentifier)
    window.eventBus.off('triggerFileAdd', this.handleDroppedFiles)
    this.stopProgressPolling()
  },
  methods: {
    toggleMinimize() {
      this.isMinimized = !this.isMinimized
    },
    getFileStatus(file) {
      if (file.error) return 'error'
      if (file.isComplete && !file.error) return 'success'
      if (file.isUploading?.()) return 'uploading'
      if (file.paused) return 'paused'
      return 'waiting'
    },
    getFileProgress(file) {
      return Math.floor((file.progress?.() || 0) * 100)
    },
    getFileSpeed(file) {
      const speed = file.averageSpeed || 0
      return UploaderUtils.formatSize(speed) + '/s'
    },
    triggerUpload() {
      const btn = document.getElementById('global-uploader-btn')
      if (btn) {
        btn.click()
      }
    },
    handleFileAdded(file) {
      this.fileMap[file.uniqueIdentifier] = this.store.folderId
      window.eventBus.emit('uploadStarted', file.uniqueIdentifier)
      this.store.incrementTransferCount()
      this.isMinimized = false
    },
    handleFileSuccess(rootFile) {
      const file = rootFile.file
      const identifier = rootFile.uniqueIdentifier
      const parentId = this.fileMap[identifier]

      const resource = {
        fileName: file.name,
        size: file.size,
        identifier: identifier,
        parentId: parentId,
        totalChunks: rootFile.chunks.length
      }

      mergeResource(resource)
        .then((res) => {
          // 检查是否为秒传
          const isInstantUpload = res?.data?.isInstantUpload
          const message = isInstantUpload
            ? `${file.name} 秒传成功（文件已存在）`
            : `${file.name} 上传成功`
          ElMessage.success({ message, duration: 3000 })
          window.eventBus.emit('flushFileList', parentId)
          window.eventBus.emit('uploadCompleted', identifier)
          this.store.decrementTransferCount()
        })
        .catch(error => {
          ElMessage.error({
            message: `${file.name} ${error?.data?.msg || '合并失败'}`,
            duration: 4000
          })
          window.eventBus.emit('uploadError', identifier)
        })
    },
    handleFileError(rootFile, file, response) {
      const msg = typeof response === 'string' && response ? response : '上传失败'
      ElMessage.error({
        message: `${file?.name || '文件'}：${msg}`,
        duration: 4000
      })
      const identifier = rootFile.uniqueIdentifier
      window.eventBus.emit('uploadError', identifier)
      this.store.decrementTransferCount()
    },
    pauseFile(file) {
      file.pause?.()
      this.$forceUpdate()
      window.eventBus.emit('uploadPaused', file.uniqueIdentifier)
    },
    resumeFile(file) {
      file.resume?.()
      this.$forceUpdate()
      window.eventBus.emit('uploadResumed', file.uniqueIdentifier)
    },
    retryFile(file) {
      file.retry?.()
      window.eventBus.emit('uploadStarted', file.uniqueIdentifier)
    },
    removeFile(file) {
      file.cancel?.()
      this.uploaderInstance?.removeFile?.(file)
      delete this.fileMap[file.uniqueIdentifier]
      window.eventBus.emit('uploadCancelled', file.uniqueIdentifier)
    },
    pauseAll() {
      this.files.forEach(f => {
        if (f.isUploading?.()) {
          f.pause?.()
          window.eventBus.emit('uploadPaused', f.uniqueIdentifier)
        }
      })
      this.$forceUpdate()
    },
    clearAll() {
      this.files.forEach(f => {
        f.cancel?.()
        this.uploaderInstance?.removeFile?.(f)
        window.eventBus.emit('uploadCancelled', f.uniqueIdentifier)
      })
      this.fileMap = {}
    },
    pauseByIdentifier(identifier) {
      const file = this.files.find(f => f.uniqueIdentifier === identifier)
      if (file && file.isUploading?.()) {
        file.pause?.()
        this.$forceUpdate()
      }
    },
    resumeByIdentifier(identifier) {
      const file = this.files.find(f => f.uniqueIdentifier === identifier)
      if (file && file.paused) {
        file.resume?.()
        this.$forceUpdate()
      }
    },
    cancelByIdentifier(identifier) {
      const file = this.files.find(f => f.uniqueIdentifier === identifier)
      if (file) {
        file.cancel?.()
        this.uploaderInstance?.removeFile?.(file)
        delete this.fileMap[identifier]
      }
    },
    handleDroppedFiles(files) {
      if (files && files.length > 0) {
        const uploader = this.uploaderInstance
        if (uploader && uploader.addFiles) {
          uploader.addFiles(files)
        }
      }
    },
    startProgressPolling() {
      this.stopProgressPolling()
      this.progressTimer = setInterval(() => {
        const hasUploading = this.files.some(f => f.isUploading?.())
        if (hasUploading) {
          const now = Date.now()
          if (now - this.lastProgressEmitTime > 500) {
            window.eventBus.emit('uploadProgress')
            this.lastProgressEmitTime = now
          }
        }
      }, 500)
    },
    stopProgressPolling() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-center {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  max-width: 480px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &.minimized {
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
  }
}

.center-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  cursor: pointer;
  user-select: none;
  border-radius: 12px 12px 0 0;

  &:hover {
    background: linear-gradient(135deg, #3a95f0 0%, #2d74c0 100%);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
}

.header-count {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.uploading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #67c23a;
    animation: pulse 1.5s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.header-right {
  display: flex;
  gap: 6px;

  :deep(.el-button) {
    color: rgba(255, 255, 255, 0.85);

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.center-body {
  background: #1a1a2e;
}

.center-tabs {
  display: flex;
  background: #16162a;
  border-bottom: 1px solid #2d2d4a;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 13px;
  color: #8b8bab;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;

  &:hover {
    color: #e0e0e0;
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    color: #409eff;
    border-bottom-color: #409eff;
    background: rgba(64, 158, 255, 0.08);
  }
}

.tab-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #409eff;
  color: #fff;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;

  &.success {
    background: #67c23a;
  }
}

.center-list {
  max-height: 320px;
  overflow-y: auto;
  background: #1a1a2e;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #3d3d5c;
    border-radius: 3px;
  }
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid #252545;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #252545;
  }
}

.file-progress-ring {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: #3d3d5c;
}

.progress-fill {
  stroke: #409eff;
  transition: stroke-dasharray 0.3s ease;

  &.success {
    stroke: #67c23a;
  }

  &.error {
    stroke: #f56c6c;
  }

  &.paused {
    stroke: #e6a23c;
  }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  font-weight: 600;
  color: #e0e0e0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  font-size: 12px;
  color: #8b8bab;

  .text-success {
    color: #67c23a;
  }

  .text-error {
    color: #f56c6c;
  }

  .text-waiting {
    color: #8b8bab;
  }
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;

  .file-item:hover & {
    opacity: 1;
  }

  :deep(.el-button) {
    color: #8b8bab;

    &:hover {
      color: #e0e0e0;
      background: rgba(255, 255, 255, 0.08);
    }
  }
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #5d5d7a;

  p {
    margin: 12px 0 0;
    font-size: 13px;
  }
}

.minimized-bar {
  position: fixed;
  bottom: 16px;
  right: 24px;
  z-index: 2001;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
  }

  .bar-icon {
    animation: rotate 2s linear infinite;
  }

  .bar-arrow {
    margin-left: 4px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>

<style>
.uploader-trigger {
  display: none;
}
</style>
