<template>
  <div class="workspace-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">传输列表</h1>
        <p class="page-header__subtitle">
          查看上传中的任务、已完成记录和失败原因，统一管理当前传输状态。
        </p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" @click="triggerUpload">继续上传</el-button>
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadTransfers">
          刷新
        </el-button>
        <el-button plain :disabled="completedCount === 0" @click="clearCompletedRecords">
          清空已完成
        </el-button>
      </div>
    </div>

    <div class="summary-grid">
      <DataCard label="全部任务" :value="tasks.length" :icon="Document" type="info" />
      <DataCard
        label="上传中"
        :value="summaryCards.find(s => s.key === 'uploading')?.value || 0"
        :icon="Upload"
        type="primary"
      />
      <DataCard
        label="已完成"
        :value="summaryCards.find(s => s.key === 'completed')?.value || 0"
        :icon="Check"
        type="success"
      />
      <DataCard
        label="失败"
        :value="summaryCards.find(s => s.key === 'failed')?.value || 0"
        :icon="WarningFilled"
        type="danger"
      />
      <DataCard
        label="已取消"
        :value="summaryCards.find(s => s.key === 'cancelled')?.value || 0"
        :icon="CircleClose"
        type="info"
      />
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="statusFilter" size="default">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="uploading">
          上传中
          <el-badge
            v-if="summaryCards.find(s => s.key === 'uploading')?.value > 0"
            :value="summaryCards.find(s => s.key === 'uploading')?.value"
            class="filter-badge"
          />
        </el-radio-button>
        <el-radio-button value="completed">已完成</el-radio-button>
        <el-radio-button value="failed">失败</el-radio-button>
        <el-radio-button value="cancelled">已取消</el-radio-button>
      </el-radio-group>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && filteredTasks.length === 0"
      empty-description="当前没有符合条件的传输任务。"
      min-height="420px"
      @retry="loadTransfers"
    >
      <div class="table-card">
        <el-table :data="filteredTasks" row-key="identifier" style="flex: 1">
          <el-table-column prop="fileName" label="文件名" min-width="260" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small" effect="light">
                <span class="status-dot" :class="`status-dot--${row.status}`"></span>
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="总进度" min-width="220">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress
                  :percentage="row.progress || 0"
                  :status="progressStatus(row.status)"
                  :stroke-width="6"
                />
                <span v-if="row.status === 'uploading'" class="progress-text">
                  {{ row.progress || 0 }}%
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="文件大小" width="140">
            <template #default="{ row }">
              {{ row.totalSize ? formatSize(row.totalSize, 2) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" min-width="180">
            <template #default="{ row }">{{ formatFileDate(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="说明" min-width="220">
            <template #default="{ row }">
              <span
                class="message-text"
                :class="{ 'message-text--error': row.status === 'failed' }"
              >
                {{ row.errorMessage || statusHint(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="180" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button v-if="row.parentId" link @click="goToFolder(row.parentId)">
                  目录
                </el-button>
                <el-button v-if="row.fileId" link @click="openCompletedTask(row)">打开</el-button>
                <el-button v-if="row.status === 'uploading'" link @click="cancelTask(row)">
                  取消
                </el-button>
                <el-button v-if="row.status === 'failed'" link @click="retryTask(row)">
                  重试
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </PageState>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  RefreshRight,
  Document,
  Upload,
  Check,
  WarningFilled,
  CircleClose
} from '@element-plus/icons-vue'
import { cancelUploadTask, clearTransferTasks, getTransferTasks } from '@/apis/resource'
import PageState from '@/components/PageState.vue'
import DataCard from '@/components/DataCard.vue'
import { formatFileDate, resolveErrorMessage } from '@/utils/file'
import { formatSize } from '@/utils'

const router = useRouter()

const tasks = ref([])
const summary = ref({})
const loading = ref(false)
const errorMessage = ref('')
const statusFilter = ref('all')
let timer = null

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => task.status === statusFilter.value)
})

const completedCount = computed(() => Number(summary.value.completed || 0))

const summaryCards = computed(() => [
  { key: 'total', label: '全部任务', value: Number(summary.value.total || tasks.value.length) },
  { key: 'uploading', label: '上传中', value: Number(summary.value.uploading || 0) },
  { key: 'completed', label: '已完成', value: Number(summary.value.completed || 0) },
  { key: 'failed', label: '失败', value: Number(summary.value.failed || 0) },
  { key: 'cancelled', label: '已取消', value: Number(summary.value.cancelled || 0) }
])

const loadTransfers = async (silent = false) => {
  if (!silent) {
    loading.value = true
  }
  if (!silent) {
    errorMessage.value = ''
  }
  try {
    const response = await getTransferTasks()
    tasks.value = response.data || []
    summary.value = response.extra || {}
  } catch (error) {
    if (!silent) {
      tasks.value = []
      summary.value = {}
      errorMessage.value = resolveErrorMessage(error, '传输列表加载失败')
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}

const triggerUpload = () => {
  window.eventBus.emit('openUploader')
}

const clearCompletedRecords = async () => {
  try {
    await clearTransferTasks('completed')
    ElMessage.success('已完成记录已清空')
    loadTransfers()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '清理已完成记录失败'))
  }
}

const cancelTask = async task => {
  try {
    await cancelUploadTask(task.identifier)
    window.eventBus.emit('cancelUploadByIdentifier', task.identifier)
    ElMessage.success('上传任务已取消')
    loadTransfers()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '取消上传任务失败'))
  }
}

const retryTask = task => {
  if (!task?.identifier) {
    ElMessage.warning('无法重试该任务')
    return
  }
  ElMessage.info('请重新选择文件上传以完成该任务')
  triggerUpload()
}

const goToFolder = folderId => {
  if (!folderId && folderId !== 0) {
    ElMessage.warning('无法确定文件所在目录')
    return
  }
  router.push(`/folder/${folderId}`)
}

const openCompletedTask = task => {
  if (!task?.fileId) {
    return
  }
  if (!task?.parentId) {
    ElMessage.warning('无法确定文件所在目录')
    return
  }
  if (task.fileName && task.fileName.toLowerCase().endsWith('.mp4')) {
    const routeLocation = router.resolve(`/video/${task.fileId}`)
    window.open(routeLocation.href, '_blank')
    return
  }
  router.push(`/folder/${task.parentId}`)
}

const statusLabel = status => {
  return (
    {
      uploading: '上传中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消'
    }[status] || '未知'
  )
}

const statusTagType = status => {
  return (
    {
      uploading: 'primary',
      completed: 'success',
      failed: 'danger',
      cancelled: 'info'
    }[status] || 'info'
  )
}

const progressStatus = status => {
  return (
    {
      completed: 'success',
      failed: 'exception'
    }[status] || ''
  )
}

const statusHint = status => {
  return (
    {
      uploading: '任务正在上传中',
      completed: '文件已上传完成',
      failed: '上传失败，可重新选择文件上传',
      cancelled: '任务已被取消'
    }[status] || '暂无状态说明'
  )
}

const handleRefresh = () => {
  loadTransfers(true)
}

onMounted(() => {
  loadTransfers()
  timer = window.setInterval(() => loadTransfers(true), 3000)
  window.eventBus.on('refreshTransfers', handleRefresh)
})

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
  window.eventBus.off('refreshTransfers', handleRefresh)
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
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-lg);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
}

.filter-badge {
  margin-left: var(--spacing-xs);
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

.progress-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  :deep(.el-progress) {
    flex: 1;
  }
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 32px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: var(--spacing-xs);

  &--uploading {
    background: var(--color-primary);
    animation: pulse 1.5s infinite;
  }

  &--completed {
    background: var(--color-success);
  }

  &--failed {
    background: var(--color-danger);
  }

  &--cancelled {
    background: var(--color-info);
  }
}

.message-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);

  &--error {
    color: var(--color-danger);
  }
}

.row-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
  }

  .filter-bar {
    flex-wrap: wrap;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
