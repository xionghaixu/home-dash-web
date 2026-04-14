<template>
  <div class="workspace-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">基础分类浏览</h1>
        <p class="page-header__subtitle">按图片、视频、音频、文档和其他文件进行轻量浏览。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="refreshAll">刷新</el-button>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="item in categorySummaries"
        :key="item.category"
        class="category-tab"
        :class="{ active: item.category === activeCategory }"
        @click="switchCategory(item.category)"
      >
        <span class="tab-icon"><component :is="getCategoryIcon(item.category)" /></span>
        <span class="tab-label">{{ item.label }}</span>
        <span class="tab-count">{{ item.count }}</span>
      </button>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && fileList.length === 0"
      :empty-description="`${activeCategoryLabel}分类下暂无文件。`"
      min-height="420px"
      @retry="refreshAll"
    >
      <div class="table-card">
        <el-table :data="fileList" row-key="id" style="flex:1" @sort-change="handleSortChange">
          <el-table-column prop="fileName" label="文件名" min-width="320" sortable="custom">
            <template #default="{ row }">
              <div class="name-cell">
                <FileTypeIcon :type="row.type" />
                <el-button link class="name-button" @click="openRow(row)">
                  {{ row.fileName }}
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="文件类型" width="150">
            <template #default="{ row }">{{ getFileTypeLabel(row.type) }}</template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="140" sortable="custom">
            <template #default="{ row }">{{ formatFileSize(row) }}</template>
          </el-table-column>
          <el-table-column prop="updateTime" label="修改时间" min-width="180" sortable="custom">
            <template #default="{ row }">{{ formatFileDate(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="所在目录" min-width="150">
            <template #default="{ row }">
              <el-button link @click="goToFolder(row.parentId)">打开目录</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="220" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button link @click="showDetail(row)">详情</el-button>
                <el-button link @click="goToFolder(row.parentId)">所在目录</el-button>
                <el-button v-if="row.type === 'video'" link @click="openVideo(row.id)">播放</el-button>
                <el-button v-else link @click="downloadFile(row.id)">下载</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </PageState>

    <FileDetailDrawer v-model="detailVisible" :file-id="detailFileId" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  RefreshRight,
  Picture,
  VideoCamera,
  Microphone,
  Document,
  FolderOpened,
  Files
} from '@element-plus/icons-vue'
import { downloadFileUrl, getCategoryFiles, getCategorySummary } from '@/apis/file'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import PageState from '@/components/PageState.vue'
import {
  CATEGORY_OPTIONS,
  formatFileDate,
  formatFileSize,
  getFileTypeLabel,
  resolveErrorMessage
} from '@/utils/file'

const route = useRoute()
const router = useRouter()

const fileList = ref([])
const summaries = ref([])
const loading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const detailFileId = ref(null)
const sortState = ref({
  sortBy: 'updateTime',
  sortOrder: 'desc'
})

const categoryIconMap = {
  picture: Picture,
  video: VideoCamera,
  audio: Microphone,
  doc: Document,
  compress: FolderOpened,
  other: Files
}

const isValidCategory = (category) => {
  return CATEGORY_OPTIONS.some(item => item.key === category)
}

const activeCategory = computed(() => {
  const category = route.params.category
  return isValidCategory(category) ? category : 'picture'
})

const activeCategoryLabel = computed(() => {
  return CATEGORY_OPTIONS.find(item => item.key === activeCategory.value)?.label || '当前'
})

const categorySummaries = computed(() => {
  return CATEGORY_OPTIONS.map(option => {
    const matched = summaries.value.find(item => item.category === option.key)
    return {
      category: option.key,
      label: matched?.label || option.label,
      count: matched?.count || 0,
      description: option.description
    }
  })
})

const getCategoryIcon = (category) => {
  return categoryIconMap[category] || Files
}

const loadSummary = async () => {
  const response = await getCategorySummary()
  summaries.value = response.data || []
}

const loadCategoryFiles = async () => {
  const response = await getCategoryFiles(activeCategory.value, sortState.value)
  fileList.value = response.data || []
}

const refreshAll = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([loadSummary(), loadCategoryFiles()])
  } catch (error) {
    fileList.value = []
    errorMessage.value = resolveErrorMessage(error, '分类文件加载失败')
  } finally {
    loading.value = false
  }
}

const switchCategory = (category) => {
  router.push(`/category/${category}`)
}

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    sortBy: prop || 'updateTime',
    sortOrder: order === 'ascending' ? 'asc' : 'desc'
  }
  refreshAll()
}

const showDetail = (row) => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const goToFolder = (folderId) => {
  router.push(`/folder/${folderId}`)
}

const openVideo = (fileId) => {
  const routeLocation = router.resolve(`/video/${fileId}`)
  window.open(routeLocation.href, '_blank')
}

const openRow = (row) => {
  if (row.type === 'video') {
    openVideo(row.id)
    return
  }
  showDetail(row)
}

const downloadFile = (fileId) => {
  const link = document.createElement('a')
  link.href = downloadFileUrl(fileId)
  link.click()
  ElMessage.success('下载任务已开始')
}

watch(
  () => route.params.category,
  (category) => {
    if (!category) {
      router.replace('/category/picture')
      return
    }
    if (category && !isValidCategory(category)) {
      router.replace('/category/picture')
      return
    }
    refreshAll()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.workspace-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
  animation: fadeInUp 0.3s ease;
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

.category-tabs {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
  overflow-x: auto;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-fill-base);
  border: 1px solid var(--color-border-lighter);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  font-size: var(--font-size-sm);

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.tab-label {
  font-weight: var(--font-weight-medium);
}

.tab-count {
  padding: 2px 8px;
  background: var(--color-border-lighter);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);

  .active & {
    background: var(--color-primary);
    color: #fff;
  }
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
  overflow: hidden;
  min-height: 400px;

  :deep(.el-table) {
    flex: 1;
  }
}

.name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.name-button {
  min-width: 0;
  justify-content: flex-start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
  }

  .category-tabs {
    gap: var(--spacing-sm);
  }
}
</style>
