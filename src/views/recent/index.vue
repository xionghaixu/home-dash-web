<template>
  <div class="workspace-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">最近上传</h1>
        <p class="page-header__subtitle">集中查看最近进入系统的文件，快速跳转、下载或播放。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadRecentFiles">
          刷新
        </el-button>
      </div>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && fileList.length === 0"
      empty-description="最近还没有上传记录。"
      min-height="420px"
      @retry="loadRecentFiles"
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
          <el-table-column label="大小" width="140" sortable="custom">
            <template #default="{ row }">{{ formatFileSize(row) }}</template>
          </el-table-column>
          <el-table-column label="上传时间" min-width="180" sortable="custom">
            <template #default="{ row }">{{ formatFileDate(row.createTime) }}</template>
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadFileUrl, getRecentFiles } from '@/apis/file'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import PageState from '@/components/PageState.vue'
import { formatFileDate, formatFileSize, resolveErrorMessage } from '@/utils/file'

const router = useRouter()

const fileList = ref([])
const loading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const detailFileId = ref(null)
const sortState = ref({
  sortBy: 'createTime',
  sortOrder: 'desc'
})

const loadRecentFiles = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getRecentFiles(20, sortState.value)
    fileList.value = response.data || []
  } catch (error) {
    fileList.value = []
    errorMessage.value = resolveErrorMessage(error, '最近上传列表加载失败')
  } finally {
    loading.value = false
  }
}

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    sortBy: prop || 'createTime',
    sortOrder: order === 'ascending' ? 'asc' : 'desc'
  }
  loadRecentFiles()
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

const showDetail = row => {
  detailFileId.value = row.id
  detailVisible.value = true
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

onMounted(() => {
  loadRecentFiles()
})
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
}
</style>
