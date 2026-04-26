<template>
  <div class="media-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">音频</h1>
        <p class="page-header__subtitle">浏览和管理您的音频收藏。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadAudio">
          刷新
        </el-button>
      </div>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && audioList.length === 0"
      empty-description="暂无音频文件。"
      min-height="420px"
      @retry="loadAudio"
    >
      <div v-if="audioList.length > 0" class="audio-list">
        <div
          v-for="(item, index) in audioList"
          :key="item.id"
          class="audio-item"
          @click="playAudio(item)"
        >
          <div class="audio-number">{{ index + 1 }}</div>
          <div class="audio-cover">
            <img v-if="item.albumCoverUrl" :src="item.albumCoverUrl" :alt="item.name" />
            <div v-else class="audio-placeholder">
              <el-icon><Headset /></el-icon>
            </div>
          </div>
          <div class="audio-info">
            <div class="audio-name" :title="item.name">{{ item.name }}</div>
            <div class="audio-meta">
              <span v-if="item.artist">{{ item.artist }}</span>
              <span v-if="item.album">{{ item.album }}</span>
            </div>
          </div>
          <div class="audio-duration">{{ formatDuration(item.duration) }}</div>
          <div class="audio-actions">
            <el-button circle size="small" @click.stop="playAudio(item)">
              <el-icon><VideoPlay /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <el-button :loading="loadingMore" @click="loadMore">加载更多</el-button>
      </div>
    </PageState>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RefreshRight, Headset, VideoPlay } from '@element-plus/icons-vue'
import { getAudioList } from '@/apis/media'
import PageState from '@/components/PageState.vue'
import { resolveErrorMessage } from '@/utils/file'

const audioList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const hasMore = ref(false)

const loadAudio = async () => {
  loading.value = true
  errorMessage.value = ''
  currentPage.value = 1
  try {
    const response = await getAudioList({ page: 1, pageSize: 30 })
    const data = response.data
    if (data && data.list) {
      audioList.value = data.list
      hasMore.value = data.hasMore || false
    } else {
      audioList.value = []
      hasMore.value = false
    }
  } catch (error) {
    audioList.value = []
    errorMessage.value = resolveErrorMessage(error, '音频加载失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const response = await getAudioList({ page: nextPage, pageSize: 30 })
    const data = response.data
    if (data && data.list) {
      audioList.value.push(...data.list)
      currentPage.value = nextPage
      hasMore.value = data.hasMore || false
    }
  } catch (error) {
    console.error('加载更多音频失败', error)
  } finally {
    loadingMore.value = false
  }
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const playAudio = (item) => {
  console.log('播放音频', item)
}

onMounted(() => {
  loadAudio()
})
</script>

<style lang="scss" scoped>
.media-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  &__subtitle {
    margin: var(--spacing-sm) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    gap: var(--spacing-md);
  }
}

.audio-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.audio-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--color-fill-base);
  }
}

.audio-number {
  width: 32px;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.audio-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-fill-base);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.audio-placeholder {
  font-size: 24px;
  color: var(--color-text-placeholder);
}

.audio-info {
  flex: 1;
  min-width: 0;
}

.audio-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--spacing-xs);
}

.audio-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.audio-duration {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.audio-actions {
  flex-shrink: 0;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}
</style>
