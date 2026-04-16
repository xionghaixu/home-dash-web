<template>
  <div>
    <!-- 上传中心 - 固定在顶部 -->
    <transition name="slide-down">
      <div v-if="showUploadBar" class="upload-center">
        <!-- 标题栏 -->
        <div class="center-header">
          <div class="header-left">
            <span class="header-title">上传中心</span>
            <span class="header-count">{{ totalCount }} 个文件</span>
          </div>
          <div class="header-right">
            <el-button v-if="uploadingCount > 0" size="small" text @click="pauseAll">
              暂停全部
            </el-button>
            <el-button size="small" text type="danger" @click="clearAll">清空</el-button>
          </div>
        </div>

        <!-- 标签页 -->
        <div class="center-tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'uploading' }"
            @click="activeTab = 'uploading'"
          >
            <span class="tab-name">传输中</span>
            <span v-if="uploadingCount > 0" class="tab-badge">{{ uploadingCount }}</span>
          </div>
          <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
            <span class="tab-name">全部</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'done' }"
            @click="activeTab = 'done'"
          >
            <span class="tab-name">已完成</span>
            <span v-if="completedCount > 0" class="tab-badge success">{{ completedCount }}</span>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="center-list">
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="file-item"
            :class="getFileStatus(file)"
          >
            <!-- 圆形进度 -->
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

            <!-- 文件信息 -->
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span v-if="file.isUploading?.()">{{ getFileSpeed(file) }}</span>
                <span v-else-if="file.isComplete && !file.error" class="text-success">已完成</span>
                <span v-else-if="file.error" class="text-error">上传失败</span>
                <span v-else class="text-waiting">等待中</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="file-actions">
              <el-button
                v-if="file.isUploading?.()"
                :icon="VideoPause"
                circle
                size="small"
                text
                @click="pauseFile(file)"
                title="暂停"
              />
              <el-button
                v-if="file.paused"
                :icon="VideoPlay"
                circle
                size="small"
                text
                @click="resumeFile(file)"
                title="继续"
              />
              <el-button
                v-if="file.error"
                :icon="Refresh"
                circle
                size="small"
                text
                @click="retryFile(file)"
                title="重试"
              />
              <el-button
                :icon="Close"
                circle
                size="small"
                text
                @click="removeFile(file)"
                title="移除"
              />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredFiles.length === 0" class="empty-state">
            <el-icon :size="40"><Upload /></el-icon>
            <p>暂无文件</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- 上传触发器 -->
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
import { Upload, Close, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'
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
    VideoPlay
  },
  data() {
    return {
      store: useAppStore(),
      fileMap: {},
      uploaderOptions: {
        target: resourceUploadUrl(),
        chunkSize: '2048000',
        fileParameterName: 'file',
        maxChunkRetries: 3,
        testChunks: true,
        simultaneousUploads: 3
      },
      statusText: {
        success: '完成',
        error: '失败',
        uploading: '上传中',
        paused: '已暂停',
        waiting: '等待'
      },
      activeTab: 'uploading'
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
  },
  unmounted() {
    window.eventBus.off('openUploader', this.triggerUpload)
  },
  methods: {
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
      window.eventBus.emit('refreshTransfers')
    },
    handleFileSuccess(rootFile) {
      const file = rootFile.file
      const identifier = rootFile.uniqueIdentifier
      const parentId = this.fileMap[identifier]

      const resource = {
        fileName: file.name,
        size: file.size,
        identifier: identifier,
        parentId: parentId
      }

      mergeResource(resource)
        .then(() => {
          ElMessage.success({ message: `${file.name} 上传成功`, duration: 3000 })
          window.eventBus.emit('flushFileList', parentId)
          window.eventBus.emit('refreshTransfers')
        })
        .catch(error => {
          ElMessage.error({
            message: `${file.name} ${error?.data?.msg || '合并失败'}`,
            duration: 4000
          })
          window.eventBus.emit('refreshTransfers')
        })
    },
    handleFileError(rootFile, file, response) {
      const msg = typeof response === 'string' && response ? response : '上传失败'
      ElMessage.error({
        message: `${file?.name || '文件'}：${msg}`,
        duration: 4000
      })
      window.eventBus.emit('refreshTransfers')
    },
    pauseFile(file) {
      file.pause?.()
    },
    resumeFile(file) {
      file.resume?.()
    },
    retryFile(file) {
      file.retry?.()
    },
    removeFile(file) {
      file.cancel?.()
      this.uploaderInstance?.removeFile?.(file)
      delete this.fileMap[file.uniqueIdentifier]
      window.eventBus.emit('refreshTransfers')
    },
    pauseAll() {
      this.files.forEach(f => {
        if (f.isUploading?.()) {
          f.pause?.()
        }
      })
    },
    clearAll() {
      this.files.forEach(f => {
        f.cancel?.()
        this.uploaderInstance?.removeFile?.(f)
      })
      this.fileMap = {}
      window.eventBus.emit('refreshTransfers')
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-center {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  background: #1a1a2e;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-width: 520px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.center-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
}

.header-count {
  font-size: 12px;
  padding: 2px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.header-right {
  display: flex;
  gap: 8px;

  :deep(.el-button) {
    color: rgba(255, 255, 255, 0.85);

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.15);
    }
  }
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
  padding: 12px 16px;
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
  padding: 14px 20px;
  gap: 16px;
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
  width: 44px;
  height: 44px;
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
  font-size: 10px;
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
  gap: 6px;
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
  padding: 48px 20px;
  text-align: center;
  color: #5d5d7a;

  p {
    margin: 12px 0 0;
    font-size: 13px;
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>

<style>
.uploader-trigger {
  display: none;
}
</style>
