<template>
  <div class="workspace-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">基础分类浏览</h2>
        <p class="page-subtitle">按图片、视频、音频、文档和其他文件进行轻量浏览。</p>
      </div>
      <div class="page-actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="refreshAll">
          刷新
        </el-button>
      </div>
    </div>

    <div class="summary-grid">
      <button
        v-for="item in categorySummaries"
        :key="item.category"
        type="button"
        class="summary-card"
        :class="{ active: item.category === activeCategory }"
        @click="switchCategory(item.category)"
      >
        <span class="summary-label">{{ item.label }}</span>
        <strong class="summary-count">{{ item.count }}</strong>
        <span class="summary-desc">{{ item.description }}</span>
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
        <el-table :data="fileList" row-key="id" height="100%" @sort-change="handleSortChange">
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
import { RefreshRight } from '@element-plus/icons-vue'
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
  gap: 16px;
  height: 100%;
}

.page-header,
.table-card {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #606266;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background-color: #fff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover,
.summary-card.active {
  border-color: #409eff;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-count {
  font-size: 26px;
  color: #303133;
}

.summary-desc {
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.table-card {
  height: calc(100vh - 320px);
  min-height: 420px;
  padding: 8px 0;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.name-button {
  min-width: 0;
  justify-content: flex-start;
  white-space: normal;
  word-break: break-all;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-card {
    height: auto;
    min-height: 360px;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
