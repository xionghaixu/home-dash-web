<template>
  <div class="audio-player-bar">
    <div class="player-container">
      <!-- 歌曲信息 -->
      <div class="player-info">
        <div class="player-cover">
          <el-icon><Headset /></el-icon>
        </div>
        <div class="player-meta">
          <div class="player-title">{{ fileName || '未知音频' }}</div>
          <div class="player-subtitle">{{ fileId ? `ID: ${fileId}` : '' }}</div>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="player-controls">
        <el-button circle size="small" @click="skipBackward">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <el-button circle size="large" type="primary" @click="togglePlay">
          <el-icon v-if="isPlaying"><VideoPause /></el-icon>
          <el-icon v-else><VideoPlay /></el-icon>
        </el-button>

        <el-button circle size="small" @click="skipForward">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 进度条 -->
      <div class="player-progress">
        <span class="time-current">{{ formatTime(currentTime) }}</span>
        <el-slider
          v-model="progress"
          :max="100"
          :show-tooltip="false"
          size="small"
          @change="handleProgressChange"
        />
        <span class="time-total">{{ formatTime(duration) }}</span>
      </div>

      <!-- 音量控制 -->
      <div class="player-volume">
        <el-icon @click="toggleMute">
          <Mute v-if="isMuted || volume === 0" />
          <Headset v-else />
        </el-icon>
        <el-slider
          v-model="volume"
          :max="100"
          :show-tooltip="false"
          size="small"
          class="volume-slider"
        />
      </div>

      <!-- 关闭按钮 -->
      <el-button circle size="small" @click="$emit('close')">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <!-- 隐藏的实际音频元素 -->
    <audio
      ref="audioRef"
      :src="audioUrl"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Headset,
  ArrowLeft,
  ArrowRight,
  VideoPlay,
  VideoPause,
  Mute,
  Close
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAudioPlayUrl, recordAudioPlay } from '@/apis/file'

const props = defineProps({
  fileId: { type: Number, required: true },
  resourceId: { type: Number, default: null },
  fileName: { type: String, default: '' },
  audioUrl: { type: String, default: '' }
})

defineEmits(['close'])

const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const isMuted = ref(false)
const progress = ref(0)

const audioUrl = computed(() => {
  if (props.audioUrl) {
    return props.audioUrl
  }
  return props.resourceId ? getAudioPlayUrl(props.resourceId) : ''
})

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100
    // Auto-play when mounted
    play()
  }
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})

watch(
  () => props.fileId,
  () => {
    // Reset state when file changes
    currentTime.value = 0
    duration.value = 0
    progress.value = 0
    isPlaying.value = false
    if (audioRef.value) {
      audioRef.value.load()
    }
    setTimeout(() => play(), 100)
  }
)

watch(volume, val => {
  if (audioRef.value) {
    audioRef.value.volume = val / 100
    isMuted.value = val === 0
  }
})

const play = () => {
  if (audioRef.value) {
    audioRef.value
      .play()
      .then(() => {
        isPlaying.value = true
        if (props.resourceId) {
          recordAudioPlay(props.resourceId).catch(() => {})
        }
      })
      .catch(() => {
        ElMessage.error('音频播放失败')
        isPlaying.value = false
      })
  }
}

const pause = () => {
  if (audioRef.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }
}

const togglePlay = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const skipBackward = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
  }
}

const skipForward = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.min(duration.value, audioRef.value.currentTime + 10)
  }
}

const toggleMute = () => {
  if (audioRef.value) {
    if (isMuted.value) {
      audioRef.value.muted = false
      isMuted.value = false
      volume.value = volume.value || 80
    } else {
      audioRef.value.muted = true
      isMuted.value = true
    }
  }
}

const handleTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    progress.value = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  }
}

const handleLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0
  }
}

const handleProgressChange = val => {
  if (audioRef.value && duration.value > 0) {
    const newTime = (val / 100) * duration.value
    audioRef.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
}

const handleError = () => {
  ElMessage.error('音频加载失败')
  isPlaying.value = false
}

const formatTime = seconds => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.audio-player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-border-light);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding: var(--spacing-sm) var(--spacing-xl);
}

.player-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

// 歌曲信息
.player-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 200px;
  flex-shrink: 0;
}

.player-cover {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-md);
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.player-meta {
  min-width: 0;
}

.player-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

// 播放控制
.player-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

// 进度条
.player-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;

  .el-slider {
    flex: 1;
  }
}

.time-current,
.time-total {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

// 音量控制
.player-volume {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 120px;
  flex-shrink: 0;

  .el-icon {
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 18px;

    &:hover {
      color: var(--color-primary);
    }
  }

  .volume-slider {
    flex: 1;
  }
}

// 响应式
@media (max-width: 768px) {
  .player-container {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .player-info {
    width: auto;
    flex: 1;
  }

  .player-volume {
    display: none;
  }

  .player-progress {
    width: 100%;
    order: 3;
  }
}
</style>
