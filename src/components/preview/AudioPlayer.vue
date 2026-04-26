<template>
  <div class="audio-player">
    <div class="audio-visual">
      <div class="audio-icon">
        <el-icon :size="64"><Headset /></el-icon>
      </div>
      <div v-if="metadata.title" class="audio-title">{{ metadata.title }}</div>
      <div v-if="metadata.artist" class="audio-artist">{{ metadata.artist }}</div>
      <div v-else-if="fileName" class="audio-artist">{{ fileName }}</div>
    </div>

    <div class="audio-controls">
      <div class="progress-bar">
        <el-slider
          v-model="currentTime"
          :max="duration"
          :format-tooltip="formatTime"
          size="small"
          @change="handleSeek"
        />
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="control-buttons">
        <el-button circle size="small" @click="toggleMute">
          <el-icon v-if="muted"><Mute /></el-icon>
          <el-icon v-else><Microphone /></el-icon>
        </el-button>

        <el-button circle size="default" @click="skipBackward">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <el-button circle size="large" type="primary" @click="togglePlay">
          <el-icon v-if="playing" :size="24"><VideoPause /></el-icon>
          <el-icon v-else :size="24"><VideoPlay /></el-icon>
        </el-button>

        <el-button circle size="default" @click="skipForward">
          <el-icon><ArrowRight /></el-icon>
        </el-button>

        <el-button circle size="small" @click="toggleLoop">
          <el-icon :color="loop ? 'var(--color-primary)' : ''"><RefreshRight /></el-icon>
        </el-button>
      </div>

      <div class="volume-control">
        <el-slider v-model="volume" :max="100" size="small" />
      </div>
    </div>

    <div v-if="playlist.length > 1" class="playlist">
      <div class="playlist-header">
        <span>播放列表 ({{ playlist.length }})</span>
        <el-button link size="small" @click="clearPlaylist">清空</el-button>
      </div>
      <div class="playlist-items">
        <div
          v-for="(item, index) in playlist"
          :key="item.id"
          class="playlist-item"
          :class="{ active: currentIndex === index }"
          @click="playAtIndex(index)"
        >
          <span class="item-index">{{ index + 1 }}</span>
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.duration" class="item-duration">{{ formatTime(item.duration) }}</span>
        </div>
      </div>
    </div>

    <audio
      ref="audioRef"
      :src="audioSrc"
      :loop="loop"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Headset,
  VideoPlay,
  VideoPause,
  ArrowLeft,
  ArrowRight,
  Microphone,
  Mute,
  RefreshRight
} from '@element-plus/icons-vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  metadata: {
    type: Object,
    default: () => ({})
  },
  playlist: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['play', 'pause', 'ended', 'error', 'next', 'prev'])

const audioRef = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const muted = ref(false)
const loop = ref(false)
const currentIndex = ref(0)

const audioSrc = computed(() => {
  if (props.playlist.length > 0 && props.playlist[currentIndex.value]) {
    return props.playlist[currentIndex.value].src || props.src
  }
  return props.src
})

watch(volume, val => {
  if (audioRef.value) {
    audioRef.value.volume = val / 100
  }
})

watch(muted, val => {
  if (audioRef.value) {
    audioRef.value.muted = val
  }
})

const togglePlay = () => {
  if (!audioRef.value) return

  if (playing.value) {
    audioRef.value.pause()
    playing.value = false
    emit('pause')
  } else {
    audioRef.value.play().then(() => {
      playing.value = true
      emit('play')
    }).catch(err => {
      ElMessage.error('播放失败: ' + err.message)
    })
  }
}

const toggleMute = () => {
  muted.value = !muted.value
}

const toggleLoop = () => {
  loop.value = !loop.value
}

const handleSeek = val => {
  if (audioRef.value) {
    audioRef.value.currentTime = val
  }
}

const skipForward = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.min(audioRef.value.currentTime + 10, duration.value)
  }
}

const skipBackward = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.max(audioRef.value.currentTime - 10, 0)
  }
}

const handleTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

const handleLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0
  }
}

const handleEnded = () => {
  playing.value = false
  emit('ended')

  // 自动播放下一首
  if (props.playlist.length > 1 && currentIndex.value < props.playlist.length - 1) {
    currentIndex.value++
    nextTick(() => {
      togglePlay()
    })
  }
}

const handleError = () => {
  playing.value = false
  ElMessage.error('音频加载失败')
  emit('error')
}

const playAtIndex = index => {
  currentIndex.value = index
  nextTick(() => {
    togglePlay()
  })
}

const clearPlaylist = () => {
  props.playlist.splice(0, props.playlist.length)
}

const formatTime = seconds => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<style lang="scss" scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.audio-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: var(--spacing-md);
}

.audio-icon {
  color: var(--color-primary-light);
}

.audio-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
}

.audio-artist {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.audio-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.progress-bar {
  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
    color: var(--color-text-placeholder);
    margin-top: var(--spacing-xs);
  }
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
}

.volume-control {
  width: 120px;
  margin: 0 auto;
}

.playlist {
  border-top: 1px solid var(--color-border-lighter);
  padding-top: var(--spacing-md);
  max-height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.playlist-items {
  overflow-y: auto;
  flex: 1;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-fill-light);
  }

  &.active {
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }
}

.item-index {
  width: 24px;
  text-align: center;
  color: var(--color-text-placeholder);
  font-size: var(--font-size-xs);
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-duration {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}
</style>
