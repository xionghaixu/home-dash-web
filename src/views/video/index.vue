<template>
  <div class="video-page">
    <!-- 顶部导航栏 -->
    <div class="video-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text class="back-btn" @click="goBack">返回</el-button>
        <div class="video-title">
          <el-icon><VideoCamera /></el-icon>
          <span>{{ title }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button :icon="Download" text class="action-btn" @click="download">下载</el-button>
      </div>
    </div>

    <!-- 播放器容器 -->
    <div class="player-container">
      <div ref="playerRef" class="dplayer-wrapper"></div>
    </div>

    <!-- 视频信息 -->
    <div class="video-info">
      <div class="info-item">
        <span class="info-label">文件名</span>
        <span class="info-value">{{ title }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">播放状态</span>
        <span class="info-value status" :class="['status--' + playerStatus]">
          <span class="status-dot"></span>
          {{ statusText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, VideoCamera, Download } from '@element-plus/icons-vue'
import { getFile, downloadFileUrl } from '@/apis/file'
import { resolveErrorMessage } from '@/utils/file'
import DPlayer from 'dplayer'

const props = defineProps({
  fileId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const playerRef = ref(null)
const title = ref('加载中...')
const playerStatus = ref('idle')
const loading = ref(false)
const errorMessage = ref('')
const lastProgressSaveTime = ref(0)
let dp = null

const statusText = computed(() => {
  switch (playerStatus.value) {
    case 'playing':
      return '正在播放'
    case 'paused':
      return '已暂停'
    case 'ended':
      return '播放结束'
    case 'error':
      return '加载失败'
    default:
      return '准备就绪'
  }
})

const loadVideoInfo = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getFile(props.fileId)
    title.value = response.data.fileName || '未知文件'
    await nextTick()
    initPlayer()
  } catch (error) {
    title.value = '加载失败'
    errorMessage.value = resolveErrorMessage(error, '视频信息加载失败')
  } finally {
    loading.value = false
  }
}

const initPlayer = () => {
  if (!playerRef.value) return

  const videoUrl = downloadFileUrl(props.fileId)

  dp = new DPlayer({
    container: playerRef.value,
    autoplay: false,
    theme: '#409eff',
    loop: false,
    lang: 'zh-cn',
    screenshot: false,
    hotkey: true,
    preload: 'auto',
    volume: 0.7,
    mutex: true,
    video: {
      url: videoUrl,
      type: 'auto'
    }
  })

  // 监听播放事件
  dp.on('play', () => {
    playerStatus.value = 'playing'
  })

  dp.on('pause', () => {
    playerStatus.value = 'paused'
  })

  dp.on('ended', () => {
    playerStatus.value = 'ended'
  })

  dp.on('error', () => {
    playerStatus.value = 'error'
  })

  dp.on('loadeddata', () => {
    if (playerStatus.value !== 'playing' && playerStatus.value !== 'paused') {
      playerStatus.value = 'idle'
    }
  })

  // 恢复播放进度
  const savedProgress = localStorage.getItem(`video_progress_${props.fileId}`)
  if (savedProgress) {
    try {
      const data = JSON.parse(savedProgress)
      const time = typeof data === 'object' ? data.time : parseFloat(savedProgress)
      if (time > 0) dp.seek(time)
    } catch {
      const time = parseFloat(savedProgress)
      if (time > 0) dp.seek(time)
    }
  }

  // 定期保存播放进度（节流：每5秒最多写一次）
  dp.on('timeupdate', () => {
    if (dp.video.currentTime <= 0) return
    const now = Date.now()
    if (now - lastProgressSaveTime.value < 5000) return
    lastProgressSaveTime.value = now
    localStorage.setItem(
      `video_progress_${props.fileId}`,
      JSON.stringify({ time: dp.video.currentTime, timestamp: now })
    )
  })
}

const goBack = () => {
  saveProgress()
  router.back()
}

const download = () => {
  if (!props.fileId) return
  try {
    const link = document.createElement('a')
    link.href = downloadFileUrl(props.fileId)
    link.click()
  } catch (error) {
    console.error('下载失败:', error)
  }
}

const saveProgress = () => {
  if (dp && dp.video.currentTime > 0) {
    localStorage.setItem(
      `video_progress_${props.fileId}`,
      JSON.stringify({ time: dp.video.currentTime, timestamp: Date.now() })
    )
  }
}

const cleanupOldProgress = () => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('video_progress_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        if (data.timestamp && data.timestamp < thirtyDaysAgo) {
          localStorage.removeItem(key)
          i-- // adjust index after removal
        }
      } catch {
        // invalid entry, remove it
        localStorage.removeItem(key)
        i--
      }
    }
  }
}

onMounted(() => {
  cleanupOldProgress()
  loadVideoInfo()
})

onUnmounted(() => {
  saveProgress()
  if (dp) {
    dp.destroy()
    dp = null
  }
})
</script>

<style lang="scss" scoped>
.video-page {
  min-height: 100vh;
  background: #0d0d0d;
  display: flex;
  flex-direction: column;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: rgba(255, 255, 255, 0.85);

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
}

.video-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;

  .el-icon {
    font-size: 18px;
    color: #409eff;
  }

  span {
    max-width: 500px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.header-right {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: rgba(255, 255, 255, 0.85);

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
}

.player-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #000;
}

.dplayer-wrapper {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  max-height: calc(100vh - 180px);
}

.video-info {
  display: flex;
  gap: 32px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);

  &.status {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67c23a;

  .status--playing & {
    background: #409eff;
    animation: pulse 1.5s infinite;
  }

  .status--paused & {
    background: #e6a23c;
  }

  .status--ended & {
    background: #909399;
  }

  .status--error & {
    background: #f56c6c;
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

// DPlayer 样式定制
:deep(.dplayer) {
  // 控制栏渐变背景
  .dplayer-controller {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)) !important;
  }

  // 进度条高度
  .dplayer-bar-wrap {
    padding: 0 !important;
  }

  .dplayer-bar {
    height: 4px !important;
    transition: height 0.2s;

    &:hover {
      height: 6px !important;
    }
  }

  // 已播放进度条颜色
  .dplayer-played-bar {
    background: #409eff !important;
  }

  // 缓冲进度条颜色
  .dplayer-loaded-bar {
    background: rgba(255, 255, 255, 0.3) !important;
  }

  // 进度条滑块
  .dplayer-thumb {
    background: #409eff !important;
    width: 12px !important;
    height: 12px !important;
    border: 2px solid #fff !important;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3) !important;
  }

  // 控制栏按钮颜色
  .dplayer-icon {
    color: rgba(255, 255, 255, 0.9) !important;

    &:hover {
      color: #fff !important;
    }
  }

  // 音量条
  .dplayer-volume-bar {
    height: 4px !important;

    .dplayer-volume-bar-inner {
      background: #409eff !important;
    }
  }

  // 播放按钮
  .dplayer-play-icon {
    transform: scale(1.2);
  }

  // 视频加载中
  .dplayer-loading-icon {
    color: #409eff !important;
  }

  // 右键菜单
  .dplayer-menu {
    background: rgba(0, 0, 0, 0.85) !important;
    border-radius: 4px !important;
    padding: 4px 0 !important;

    .dplayer-menu-item {
      color: rgba(255, 255, 255, 0.85) !important;
      padding: 8px 16px !important;
      font-size: 13px !important;

      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
      }
    }
  }

  // 提示信息
  .dplayer-info-panel {
    background: rgba(0, 0, 0, 0.7) !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  // 倍速菜单
  .dplayer-setting-speed-panel {
    background: rgba(0, 0, 0, 0.85) !important;
    border-radius: 4px !important;

    .dplayer-setting-speed-item {
      color: rgba(255, 255, 255, 0.85) !important;

      &.dplayer-setting-speed-item-active {
        color: #409eff !important;
      }
    }
  }

  // 进度条预览
  .dplayer-bar-preview {
    background: rgba(0, 0, 0, 0.8) !important;
    border-radius: 4px !important;
    padding: 4px 8px !important;
    font-size: 12px !important;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .video-header {
    padding: 8px 12px;
  }

  .video-title span {
    max-width: 200px;
  }

  .video-info {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
}
</style>
