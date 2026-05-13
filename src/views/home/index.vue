<template>
  <div class="dashboard-page">
    <!-- 顶部欢迎区 -->
    <div class="welcome-section">
      <div class="welcome-left">
        <h1 class="welcome-title">数字媒体中心</h1>
        <p class="welcome-subtitle">一站式媒体管理与数据分析工作台</p>
      </div>
      <div class="welcome-right">
        <div class="time-display">{{ currentTime }}</div>
        <div class="date-display">{{ currentDate }}</div>
      </div>
    </div>

    <!-- 核心统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card image-card" @click="goTo('/media/images')">
        <div class="stat-icon-wrap">
          <el-icon :size="28"><Picture /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(summary.mediaStats?.imageCount) }}</div>
          <div class="stat-label">图片资源</div>
          <div class="stat-capacity">{{ summary.mediaStats?.imageCapacity || '0 B' }}</div>
        </div>
        <div class="stat-trend">
          <el-icon><ArrowUp /></el-icon>
          <span>媒体库</span>
        </div>
      </div>

      <div class="stat-card video-card" @click="goTo('/media/videos')">
        <div class="stat-icon-wrap">
          <el-icon :size="28"><VideoCamera /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(summary.mediaStats?.videoCount) }}</div>
          <div class="stat-label">视频资源</div>
          <div class="stat-capacity">{{ summary.mediaStats?.videoCapacity || '0 B' }}</div>
        </div>
        <div class="stat-trend">
          <el-icon><ArrowUp /></el-icon>
          <span>媒体库</span>
        </div>
      </div>

      <div class="stat-card audio-card" @click="goTo('/media/audio')">
        <div class="stat-icon-wrap">
          <el-icon :size="28"><Headset /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(summary.mediaStats?.audioCount) }}</div>
          <div class="stat-label">音频资源</div>
          <div class="stat-capacity">{{ summary.mediaStats?.audioCapacity || '0 B' }}</div>
        </div>
        <div class="stat-trend">
          <el-icon><ArrowUp /></el-icon>
          <span>媒体库</span>
        </div>
      </div>

      <div class="stat-card total-card" @click="goTo('/files')">
        <div class="stat-icon-wrap">
          <el-icon :size="28"><FolderOpened /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(totalFiles) }}</div>
          <div class="stat-label">全部文件</div>
          <div class="stat-capacity">文件管理</div>
        </div>
        <div class="stat-trend">
          <el-icon><ArrowRight /></el-icon>
          <span>进入</span>
        </div>
      </div>
    </div>

    <!-- 中间内容区：两列布局 -->
    <div class="content-grid">
      <!-- 左侧：最近播放 + 图片预览 -->
      <div class="content-left">
        <!-- 最近播放视频 -->
        <div class="panel recent-video-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><VideoPlay /></el-icon>
              <span>最近观看</span>
            </div>
            <el-button link type="primary" @click="goTo('/media/videos')">
              查看更多 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="panel-body">
            <div v-if="recentVideos.length === 0" class="empty-state">
              <el-icon :size="40"><VideoCamera /></el-icon>
              <p>暂无观看记录</p>
            </div>
            <div v-else class="video-list">
              <div
                v-for="video in recentVideos"
                :key="video.fileId"
                class="video-item"
                @click="playVideo(video.fileId)"
              >
                <div class="video-cover">
                  <img v-if="video.coverUrl" :src="video.coverUrl" :alt="video.fileName" />
                  <div v-else class="video-cover-placeholder">
                    <el-icon><VideoCamera /></el-icon>
                  </div>
                  <div class="video-play-overlay">
                    <el-icon :size="24"><VideoPlay /></el-icon>
                  </div>
                </div>
                <div class="video-meta">
                  <div class="video-name" :title="video.fileName">{{ video.fileName }}</div>
                  <div class="video-progress">
                    <el-progress
                      :percentage="video.progress || 0"
                      :stroke-width="4"
                      :show-text="false"
                      :color="progressColors"
                    />
                    <span class="progress-text">{{ video.progress || 0 }}%</span>
                  </div>
                  <div class="video-time">{{ formatTime(video.lastPlayedAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近播放音频 -->
        <div class="panel recent-audio-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><Headset /></el-icon>
              <span>最近收听</span>
            </div>
            <el-button link type="primary" @click="goTo('/media/audio')">
              查看更多 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="panel-body">
            <div v-if="recentAudio.length === 0" class="empty-state">
              <el-icon :size="40"><Headset /></el-icon>
              <p>暂无收听记录</p>
            </div>
            <div v-else class="audio-list">
              <div
                v-for="(audio, index) in recentAudio"
                :key="audio.fileId"
                class="audio-item"
                @click="goToAudio(audio.fileId)"
              >
                <div class="audio-number">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="audio-cover">
                  <img v-if="audio.coverUrl" :src="audio.coverUrl" :alt="audio.title" />
                  <div v-else class="audio-cover-placeholder">
                    <el-icon><Headset /></el-icon>
                  </div>
                </div>
                <div class="audio-meta">
                  <div class="audio-title" :title="audio.title || audio.fileName">
                    {{ audio.title || audio.fileName }}
                  </div>
                  <div class="audio-artist">{{ audio.artist || '未知艺术家' }}</div>
                </div>
                <div class="audio-time">{{ formatTime(audio.lastPlayedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：最近上传 + 任务 -->
      <div class="content-right">
        <!-- 图片速览 -->
        <div class="panel image-review-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><Picture /></el-icon>
              <span>图片速览</span>
            </div>
            <el-button link type="primary" @click="goTo('/media/images')">
              全部图片 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="panel-body">
            <div v-if="imageReview.length === 0" class="empty-state">
              <el-icon :size="40"><Picture /></el-icon>
              <p>暂无图片</p>
            </div>
            <div v-else class="image-grid">
              <div
                v-for="img in imageReview"
                :key="img.fileId"
                class="image-item"
                @click="previewImage(img)"
              >
                <img v-if="resolveImageUrl(img)" :src="resolveImageUrl(img)" :alt="img.fileName" />
                <div v-else class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
                <div class="image-overlay">
                  <span>{{ img.fileName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近上传 -->
        <div class="panel recent-upload-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><UploadFilled /></el-icon>
              <span>最近上传</span>
            </div>
            <el-button link type="primary" @click="goTo('/transfers')">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="panel-body">
            <div class="upload-tabs">
              <div
                v-for="tab in uploadTabs"
                :key="tab.key"
                :class="['upload-tab', { active: activeUploadTab === tab.key }]"
                @click="activeUploadTab = tab.key"
              >
                {{ tab.label }}
              </div>
            </div>
            <div class="upload-list">
              <div
                v-for="item in currentUploadItems"
                :key="item.fileId"
                class="upload-item"
                @click="goToFile(item.fileId)"
              >
                <div class="upload-icon">
                  <el-icon v-if="item.type === 'PICTURE'"><Picture /></el-icon>
                  <el-icon v-else-if="item.type === 'VIDEO'"><VideoCamera /></el-icon>
                  <el-icon v-else-if="item.type === 'AUDIO'"><Headset /></el-icon>
                  <el-icon v-else><Document /></el-icon>
                </div>
                <div class="upload-info">
                  <div class="upload-name" :title="item.fileName">{{ item.fileName }}</div>
                  <div class="upload-meta">{{ formatFileSize(item.size) }} · {{ formatTime(item.createTime) }}</div>
                </div>
                <el-icon class="upload-arrow"><ArrowRight /></el-icon>
              </div>
              <div v-if="currentUploadItems.length === 0" class="empty-state small">
                <p>暂无记录</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 待处理任务 -->
        <div class="panel task-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><List /></el-icon>
              <span>系统任务</span>
            </div>
            <el-tag v-if="pendingTasks.length > 0" type="warning" size="small">{{ pendingTasks.length }} 个待处理</el-tag>
          </div>
          <div class="panel-body">
            <div v-if="pendingTasks.length === 0" class="empty-state">
              <el-icon :size="32"><CircleCheck /></el-icon>
              <p>所有任务已完成</p>
            </div>
            <div v-else class="task-list">
              <div
                v-for="task in pendingTasks"
                :key="task.taskId"
                class="task-item"
              >
                <div class="task-status-dot" :class="task.status?.toLowerCase()"></div>
                <div class="task-info">
                  <div class="task-name">{{ task.taskType }} · {{ task.mediaType }}</div>
                  <div class="task-status">
                    <el-tag :type="getTaskStatusType(task.status)" size="small">{{ task.status }}</el-tag>
                    <span v-if="task.errorMessage" class="task-error">{{ task.errorMessage }}</span>
                  </div>
                </div>
                <div class="task-time">{{ formatTime(task.createTime) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作栏 -->
    <div class="quick-actions">
      <div class="quick-title">快捷入口</div>
      <div class="quick-grid">
        <div class="quick-item" @click="goTo('/files')">
          <div class="quick-icon folder"><el-icon><FolderOpened /></el-icon></div>
          <span>文件管理</span>
        </div>
        <div class="quick-item" @click="goTo('/media/images')">
          <div class="quick-icon image"><el-icon><Picture /></el-icon></div>
          <span>图片库</span>
        </div>
        <div class="quick-item" @click="goTo('/media/videos')">
          <div class="quick-icon video"><el-icon><VideoCamera /></el-icon></div>
          <span>视频库</span>
        </div>
        <div class="quick-item" @click="goTo('/media/audio')">
          <div class="quick-icon audio"><el-icon><Headset /></el-icon></div>
          <span>音频库</span>
        </div>
        <div class="quick-item" @click="goTo('/transfers')">
          <div class="quick-icon transfer"><el-icon><UploadFilled /></el-icon></div>
          <span>上传任务</span>
        </div>
        <div class="quick-item" @click="goTo('/category')">
          <div class="quick-icon category"><el-icon><Grid /></el-icon></div>
          <span>分类浏览</span>
        </div>
        <div class="quick-item" @click="goTo('/system')">
          <div class="quick-icon system"><el-icon><Monitor /></el-icon></div>
          <span>系统监控</span>
        </div>
        <div class="quick-item" @click="goTo('/files')">
          <div class="quick-icon recent"><el-icon><UploadFilled /></el-icon></div>
          <span>全部文件</span>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewImages"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeMediaSummary } from '@/apis/media'
import { downloadFileUrl, getImageThumbnailUrl } from '@/apis/file'
import {
  Picture, VideoCamera, Headset, FolderOpened, ArrowRight, ArrowUp,
  VideoPlay, UploadFilled, List, CircleCheck, Document, Grid, Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 数据状态
const summary = ref({})
const loading = ref(false)
const currentTime = ref('')
const currentDate = ref('')
const activeUploadTab = ref('images')
const previewVisible = ref(false)
const previewIndex = ref(0)

// 计算属性
const recentVideos = computed(() => summary.value.recentPlays?.videos || [])
const recentAudio = computed(() => summary.value.recentPlays?.audio || [])
const imageReview = computed(() => summary.value.imageReview || [])
const pendingTasks = computed(() => summary.value.pendingTasks || [])
const totalFiles = computed(() => {
  const stats = summary.value.mediaStats
  return (stats?.imageCount || 0) + (stats?.videoCount || 0) + (stats?.audioCount || 0)
})

const uploadTabs = [
  { key: 'images', label: '图片' },
  { key: 'videos', label: '视频' },
  { key: 'audio', label: '音频' }
]

const currentUploadItems = computed(() => {
  const uploads = summary.value.recentUploads
  if (!uploads) return []
  switch (activeUploadTab.value) {
    case 'images': return uploads.images || []
    case 'videos': return uploads.videos || []
    case 'audio': return uploads.audio || []
    default: return []
  }
})

const previewImages = computed(() => {
  return imageReview.value
    .map(resolveImageUrl)
    .filter(Boolean)
})

const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// 时间更新
let timeTimer = null
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

// 获取数据
const fetchSummary = async () => {
  loading.value = true
  try {
    const res = await getHomeMediaSummary()
    if (res.code === 200) {
      summary.value = res.data || {}
    }
  } catch (error) {
    ElMessage.error('获取首页数据失败')
  } finally {
    loading.value = false
  }
}

// 工具函数
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let value = size
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index++
  }
  return value.toFixed(1) + ' ' + units[index]
}

const getTaskStatusType = (status) => {
  switch (status) {
    case 'PENDING': return 'info'
    case 'RUNNING': return 'primary'
    case 'FAILED': return 'danger'
    case 'COMPLETED': return 'success'
    default: return 'info'
  }
}

// 导航
const goTo = (path) => {
  router.push(path)
}

const playVideo = (fileId) => {
  router.push(`/video/${fileId}`)
}

const goToAudio = (fileId) => {
  router.push(`/media/audio`)
}

const goToFile = (fileId) => {
  router.push(`/files`)
}

const previewImage = (img) => {
  const currentUrl = resolveImageUrl(img)
  const idx = previewImages.value.findIndex(url => url === currentUrl)
  previewIndex.value = idx >= 0 ? idx : 0
  previewVisible.value = true
}

const resolveImageUrl = img => {
  if (!img) return ''
  return img.thumbnailUrl || img.coverUrl || (img.resourceId ? getImageThumbnailUrl(img.resourceId) : '') || (img.fileId ? downloadFileUrl(img.fileId) : '')
}

// 生命周期
onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  fetchSummary()
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--spacing-lg);
  max-width: 1600px;
  margin: 0 auto;
}

// 欢迎区
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: var(--radius-xl);
  color: #fff;
  box-shadow: var(--shadow-lg);
}

.welcome-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs) 0;
}

.welcome-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.85;
  margin: 0;
}

.time-display {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
}

.date-display {
  font-size: var(--font-size-sm);
  opacity: 0.8;
  text-align: right;
  margin-top: var(--spacing-xs);
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  position: relative;
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }
}

.image-card::before { background: linear-gradient(90deg, #67c23a, #95d475); }
.video-card::before { background: linear-gradient(90deg, #409eff, #79bbff); }
.audio-card::before { background: linear-gradient(90deg, #e6a23c, #f3d19e); }
.total-card::before { background: linear-gradient(90deg, #909399, #c8c9cc); }

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.image-card .stat-icon-wrap { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
.video-card .stat-icon-wrap { background: rgba(64, 158, 255, 0.1); color: #409eff; }
.audio-card .stat-icon-wrap { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
.total-card .stat-icon-wrap { background: rgba(144, 147, 153, 0.1); color: #909399; }

.stat-value {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.stat-capacity {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: 2px;
}

.stat-trend {
  position: absolute;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

// 内容网格
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.content-left,
.content-right {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

// 面板通用样式
.panel {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);

  .el-icon {
    color: var(--color-primary);
  }
}

.panel-body {
  padding: var(--spacing-lg);
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-placeholder);

  p {
    margin-top: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  &.small {
    padding: var(--spacing-lg);
  }
}

// 视频列表
.video-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.video-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);

    .video-play-overlay {
      opacity: 1;
    }
  }
}

.video-cover {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-page);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
}

.video-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.video-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-xs);
}

.video-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .el-progress {
    flex: 1;
  }
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 32px;
}

.video-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

// 音频列表
.audio-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.audio-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);
  }
}

.audio-number {
  width: 28px;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  font-variant-numeric: tabular-nums;
}

.audio-cover {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-page);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.audio-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
}

.audio-meta {
  flex: 1;
  min-width: 0;
}

.audio-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-artist {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.audio-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

// 图片网格
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-page);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-fast);
  }

  &:hover {
    img {
      transform: scale(1.05);
    }

    .image-overlay {
      opacity: 1;
    }
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: var(--spacing-sm);
  background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transition: opacity var(--transition-fast);

  span {
    color: #fff;
    font-size: var(--font-size-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 上传面板
.upload-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.upload-tab {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);
  }

  &.active {
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
  }
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.upload-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);

    .upload-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.upload-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page);
  color: var(--color-primary);
  flex-shrink: 0;
}

.upload-info {
  flex: 1;
  min-width: 0;
}

.upload-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: 2px;
}

.upload-arrow {
  color: var(--color-text-placeholder);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-fast);
}

// 任务面板
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--color-bg-page);
}

.task-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;

  &.pending { background: #909399; }
  &.running { background: #409eff; animation: pulse 1.5s infinite; }
  &.failed { background: #f56c6c; }
  &.completed { background: #67c23a; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.task-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.task-error {
  font-size: var(--font-size-xs);
  color: #f56c6c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

// 快捷操作
.quick-actions {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  padding: var(--spacing-xl);
}

.quick-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-lg);
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);

    .quick-icon {
      transform: scale(1.1);
    }
  }

  span {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);

  &.folder { background: rgba(144, 147, 153, 0.1); color: #909399; }
  &.image { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
  &.video { background: rgba(64, 158, 255, 0.1); color: #409eff; }
  &.audio { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
  &.transfer { background: rgba(131, 85, 218, 0.1); color: #8355da; }
  &.category { background: rgba(245, 108, 108, 0.1); color: #f56c6c; }
  &.system { background: rgba(32, 160, 255, 0.1); color: #20a0ff; }
  &.recent { background: rgba(131, 85, 218, 0.1); color: #8355da; }
}

// 响应式
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .welcome-right {
    text-align: left;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
