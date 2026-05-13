<template>
  <div class="media-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">图片</h1>
        <p class="page-header__subtitle">浏览和管理您的图片收藏。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadPictures">
          刷新
        </el-button>
      </div>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && pictureList.length === 0"
      empty-description="暂无图片文件。"
      min-height="420px"
      @retry="loadPictures"
    >
      <div v-if="pictureList.length > 0" class="media-grid">
        <div
          v-for="item in pictureList"
          :key="item.fileId"
          class="media-card"
          @click="openDetail(item)"
        >
          <div class="media-cover">
            <img v-if="getPictureCover(item)" :src="getPictureCover(item)" :alt="item.fileName" />
            <div v-else class="media-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </div>
          <div class="media-info">
            <div class="media-name" :title="item.fileName">{{ item.fileName }}</div>
            <div class="media-meta">
              <span>{{ formatFileSize(item.size) }}</span>
              <span>{{ item.width }}x{{ item.height }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <el-button :loading="loadingMore" @click="loadMore">加载更多</el-button>
      </div>

      <ImagePreview
        v-model="previewVisible"
        :file-list="previewFiles"
        :initial-index="previewIndex"
      />
    </PageState>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RefreshRight, Picture } from '@element-plus/icons-vue'
import { getPictureList } from '@/apis/media'
import { downloadFileUrl, getImageThumbnailUrl } from '@/apis/file'
import PageState from '@/components/PageState.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { formatFileSize } from '@/utils/file'
import { resolveErrorMessage } from '@/utils/file'

const pictureList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const hasMore = ref(false)
const previewVisible = ref(false)
const previewIndex = ref(0)
const previewFiles = ref([])

const loadPictures = async () => {
  loading.value = true
  errorMessage.value = ''
  currentPage.value = 1
  try {
    const response = await getPictureList({ page: 1, pageSize: 40 })
    const data = response.data
    if (data && data.list) {
      pictureList.value = data.list
      hasMore.value = data.hasMore || false
    } else {
      pictureList.value = []
      hasMore.value = false
    }
  } catch (error) {
    pictureList.value = []
    errorMessage.value = resolveErrorMessage(error, '图片加载失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const response = await getPictureList({ page: nextPage, pageSize: 40 })
    const data = response.data
    if (data && data.list) {
      pictureList.value.push(...data.list)
      currentPage.value = nextPage
      hasMore.value = data.hasMore || false
    }
  } catch (error) {
    console.error('加载更多图片失败', error)
  } finally {
    loadingMore.value = false
  }
}

const openDetail = (item) => {
  previewFiles.value = pictureList.value.map(file => ({
    fileId: file.fileId,
    fileName: file.fileName
  }))
  previewIndex.value = pictureList.value.findIndex(file => file.fileId === item.fileId)
  previewVisible.value = true
}

const getPictureCover = (item) => {
  return (
    item.thumbnailUrls?.medium ||
    item.thumbnailUrls?.small ||
    item.thumbnailUrls?.large ||
    (item.resourceId ? getImageThumbnailUrl(item.resourceId) : '') ||
    (item.fileId ? downloadFileUrl(item.fileId) : '')
  )
}

onMounted(() => {
  loadPictures()
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  }
}

.media-cover {
  aspect-ratio: 1;
  overflow: hidden;
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

.media-placeholder {
  font-size: 48px;
  color: var(--color-text-placeholder);
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
