<template>
  <div class="media-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">视频</h1>
        <p class="page-header__subtitle">浏览和管理您的视频收藏。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadVideos">
          刷新
        </el-button>
      </div>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && videoList.length === 0"
      empty-description="暂无视频文件。"
      min-height="420px"
      @retry="loadVideos"
    >
      <div v-if="videoList.length > 0" class="media-grid">
        <div
          v-for="item in videoList"
          :key="item.id"
          class="media-card video-card"
          @click="playVideo(item)"
        >
          <div class="media-cover video-cover">
            <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.name" />
            <div v-else class="media-placeholder">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <div class="video-duration">{{ formatDuration(item.duration) }}</div>
            <div class="play-overlay">
              <el-icon><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="media-info">
            <div class="media-name" :title="item.name">{{ item.name }}</div>
            <div class="media-meta">
              <span>{{ item.resolution }}</span>
              <span v-if="item.seriesName">{{ item.seriesName }}</span>
            </div>
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
import { RefreshRight, VideoCamera, VideoPlay } from '@element-plus/icons-vue'
import { getVideoList } from '@/apis/media'
import PageState from '@/components/PageState.vue'
import { resolveErrorMessage } from '@/utils/file'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const hasMore = ref(false)

const loadVideos = async () => {
  loading.value = true
  errorMessage.value = ''
  currentPage.value = 1
  try {
    const response = await getVideoList({ page: 1, pageSize: 20 })
    const data = response.data
    if (data && data.list) {
      videoList.value = data.list
      hasMore.value = data.hasMore || false
    } else {
      videoList.value = []
      hasMore.value = false
    }
  } catch (error) {
    videoList.value = []
    errorMessage.value = resolveErrorMessage(error, '视频加载失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const response = await getVideoList({ page: nextPage, pageSize: 20 })
    const data = response.data
    if (data && data.list) {
      videoList.value.push(...data.list)
      currentPage.value = nextPage
      hasMore.value = data.hasMore || false
    }
  } catch (error) {
    console.error('加载更多视频失败', error)
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

const playVideo = (item) => {
  router.push(`/video/${item.id}`)
}

onMounted(() => {
  loadVideos()
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-lg);
}

.media-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);

    .play-overlay {
      opacity: 1;
    }
  }
}

.video-cover {
  position: relative;
  aspect-ratio: 16/9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.media-placeholder {
  font-size: 48px;
  color: var(--color-text-placeholder);
}

.video-duration {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;

  .el-icon {
    font-size: 48px;
    color: white;
  }
}

.media-info {
  padding: var(--spacing-md);
}

.media-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--spacing-xs);
}

.media-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}
</style>
