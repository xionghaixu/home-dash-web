<template>
  <div class="workspace-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">基础分类浏览</h1>
        <p class="page-header__subtitle">按图片、视频、音频、文档和其他文件进行轻量浏览。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="refreshAll">
          刷新
        </el-button>
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
        <span class="tab-count" :class="{ 'tab-count--active': item.category === activeCategory }">
          {{ item.count }}
        </span>
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
        <el-table :data="fileList" row-key="id" style="flex: 1" @sort-change="handleSortChange">
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
                <el-button v-if="row.type === 'video'" link @click="openVideo(row.id)">
                  播放
                </el-button>
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

const isValidCategory = category => {
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

const getCategoryIcon = category => {
  return categoryIconMap[category] || Files
}

const loadSummary = async () => {
  try {
    const response = await getCategorySummary()
    summaries.value = response.data || []
  } catch (error) {
    console.warn('分类摘要加载失败:', error)
    summaries.value = []
  }
}

const loadCategoryFiles = async () => {
  try {
    const response = await getCategoryFiles(activeCategory.value, sortState.value)
    fileList.value = response.data || []
  } catch (error) {
    fileList.value = []
    throw error
  }
}

const refreshAll = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([loadSummary(), loadCategoryFiles()])
  } catch (error) {
    errorMessage.value = resolveErrorMessage(error, '分类文件加载失败')
  } finally {
    loading.value = false
  }
}

const switchCategory = category => {
  router.push(`/category/${category}`)
}

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    sortBy: prop || 'updateTime',
    sortOrder: order === 'ascending' ? 'asc' : 'desc'
  }
  refreshAll()
}

const showDetail = row => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const goToFolder = folderId => {
  if (!folderId && folderId !== 0) {
    ElMessage.warning('无法确定文件所在目录')
    return
  }
  router.push(`/folder/${folderId}`)
}

const openVideo = fileId => {
  const routeLocation = router.resolve(`/video/${fileId}`)
  window.open(routeLocation.href, '_blank')
}

const openRow = row => {
  if (row.type === 'video') {
    openVideo(row.id)
    return
  }
  showDetail(row)
}

const downloadFile = fileId => {
  try {
    const link = document.createElement('a')
    link.href = downloadFileUrl(fileId)
    link.click()
    ElMessage.success('下载任务已开始')
  } catch {
    ElMessage.error('下载失败，请稍后重试')
  }
}

watch(
  () => route.params.category,
  category => {
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

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border-lighter);
    border-radius: 2px;
  }
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
  color: var(--color-text-secondary);

  &:hover {
    border-color: var(--color-primary-light);
    background: var(--color-primary-bg);
    color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: #fff;
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);

    .tab-icon {
      color: #fff;
    }

    .tab-count {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
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
  transition: all var(--transition-fast);

  &--active {
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

@media (max-width: 1280px) {
  .table-card {
    min-height: 350px;
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .category-tabs {
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
  }

  .category-tab {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .table-card {
    min-height: 300px;
  }

  .row-actions {
    flex-direction: column;
    gap: 2px;
  }

  .row-actions .el-button {
    padding: 2px 4px;
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: var(--spacing-lg);
  }

  .table-card {
    min-height: 250px;
  }

  .page-header__actions {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }

  .page-header__actions .el-button {
    width: 100%;
  }

  :deep(.el-table) {
    font-size: var(--font-size-xs);
  }

  :deep(.el-table__header th) {
    padding: 8px 4px;
  }

  :deep(.el-table__body td) {
    padding: 8px 4px;
  }

  .name-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .category-tab {
    flex-direction: column;
    gap: var(--spacing-xs);
    text-align: center;
  }

  .tab-label {
    font-size: var(--font-size-xs);
  }
}
</style>
