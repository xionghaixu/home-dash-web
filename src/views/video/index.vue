<template>
  <el-container class="video-page">
    <el-header height="56px">
      <div class="header-container">
        <div class="header-left">
          <el-button :icon="ArrowLeft" text @click="goBack" class="back-btn">返回</el-button>
          <div class="video-title">
            <el-icon><VideoCamera /></el-icon>
            <span>{{ title }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Download" @click="download">下载视频</el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <PageState
        :loading="loading"
        :error="Boolean(errorMessage)"
        :error-description="errorMessage"
        :empty="false"
        min-height="70vh"
        @retry="loadVideoInfo"
      >
        <div class="video-container">
          <div class="player-wrapper">
            <video
              ref="videoPlayer"
              controls
              class="video-player"
              :src="videoSrc"
              preload="metadata"
              @error="handleVideoError"
              @loadeddata="handleVideoLoaded"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
          <div class="video-info">
            <div class="info-item">
              <span class="info-label">文件名称</span>
              <span class="info-value">{{ title }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">播放状态</span>
              <span class="info-value status" :class="playerStatus">
                <span class="status-dot"></span>
                {{ statusText }}
              </span>
            </div>
          </div>
        </div>
      </PageState>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, VideoCamera, Download } from '@element-plus/icons-vue'
import { getFile, downloadFileUrl } from '@/apis/file'
import PageState from '@/components/PageState.vue'
import { resolveErrorMessage } from '@/utils/file'

const props = defineProps({
  fileId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const title = ref('加载中...')
const videoSrc = ref('')
const videoPlayer = ref(null)
const playerStatus = ref('idle')
const loading = ref(false)
const errorMessage = ref('')
const videoEvents = []

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

const addVideoEvent = (event, handler) => {
  if (videoPlayer.value) {
    videoPlayer.value.addEventListener(event, handler)
    videoEvents.push({ event, handler })
  }
}

const removeVideoEvents = () => {
  if (videoPlayer.value) {
    videoEvents.forEach(({ event, handler }) => {
      videoPlayer.value.removeEventListener(event, handler)
    })
    videoEvents.length = 0
  }
}

const loadVideoInfo = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getFile(props.fileId)
    title.value = response.data.fileName || '未知文件'
    videoSrc.value = downloadFileUrl(props.fileId)
  } catch (error) {
    title.value = '加载失败'
    errorMessage.value = resolveErrorMessage(error, '视频信息加载失败')
  } finally {
    loading.value = false
  }
}

const handleVideoError = () => {
  playerStatus.value = 'error'
}

const handleVideoLoaded = () => {
  if (playerStatus.value !== 'playing' && playerStatus.value !== 'paused') {
    playerStatus.value = 'idle'
  }
}

const goBack = () => {
  router.back()
}

const download = () => {
  if (!props.fileId) {
    return
  }
  try {
    const link = document.createElement('a')
    link.href = downloadFileUrl(props.fileId)
    link.click()
  } catch (error) {
    console.error('下载失败:', error)
  }
}

onMounted(() => {
  loadVideoInfo()

  addVideoEvent('play', () => {
    playerStatus.value = 'playing'
  })
  addVideoEvent('pause', () => {
    playerStatus.value = 'paused'
  })
  addVideoEvent('ended', () => {
    playerStatus.value = 'ended'
  })
})

onUnmounted(() => {
  removeVideoEvents()
})
</script>

<style lang="scss" scoped>
.video-page {
  height: 100vh;
  background: #0d0d0d;
}

.header-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.back-btn {
  color: #fff;
  font-size: var(--font-size-sm);

  &:hover {
    color: var(--color-primary-light);
    background: rgba(255, 255, 255, 0.1);
  }
}

.video-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);

  .el-icon {
    font-size: 20px;
    color: var(--color-primary-light);
  }
}

.header-right {
  :deep(.el-button) {
    background: var(--color-primary);
    border-color: var(--color-primary);

    &:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary-light);
    }
  }
}

.el-main {
  padding: 0;
  display: flex;
  justify-content: center;
  overflow-y: auto;
}

.video-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.player-wrapper {
  position: relative;
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  box-shadow: var(--shadow-xl);
}

.video-player {
  width: 100%;
  display: block;
  max-height: 70vh;
  background: #000;

  &::-webkit-media-controls {
    background: rgba(0, 0, 0, 0.6);
  }
}

.video-info {
  display: flex;
  gap: var(--spacing-3xl);
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.9);

  &.status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);

  .status--playing & {
    background: var(--color-primary);
    animation: pulse 1.5s infinite;
  }

  .status--paused & {
    background: var(--color-warning);
  }

  .status--ended & {
    background: var(--color-info);
  }

  .status--error & {
    background: var(--color-danger);
  }
}

@media (max-width: 1280px) {
  .video-container {
    max-width: 100%;
  }

  .player-wrapper {
    border-radius: var(--radius-md);
  }
}

@media (max-width: 960px) {
  .video-container {
    padding: var(--spacing-lg);
  }

  .video-info {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .header-left {
    gap: var(--spacing-md);
  }

  .video-title span {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-container {
    padding: 0 var(--spacing-lg);
  }
}

@media (max-width: 640px) {
  .video-container {
    padding: var(--spacing-md);
  }

  .header-container {
    padding: 0 var(--spacing-md);
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .video-title {
    font-size: var(--font-size-sm);
  }

  .video-info {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .info-item {
    width: 100%;
  }
}
</style>
