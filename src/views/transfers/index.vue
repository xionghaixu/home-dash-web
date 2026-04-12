<template>
  <div class="workspace-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">传输列表</h2>
        <p class="page-subtitle">查看上传中的任务、已完成记录和失败原因，统一管理当前传输状态。</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="triggerUpload">继续上传</el-button>
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadTransfers">刷新</el-button>
        <el-button plain :disabled="completedCount === 0" @click="clearCompletedRecords">
          清空已完成
        </el-button>
      </div>
    </div>

    <div class="summary-grid">
      <div v-for="item in summaryCards" :key="item.key" class="summary-card">
        <span class="summary-label">{{ item.label }}</span>
        <strong class="summary-count">{{ item.value }}</strong>
      </div>
    </div>

    <div class="filter-bar">
      <span class="filter-label">状态筛选</span>
      <el-radio-group v-model="statusFilter" size="small">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="uploading">上传中</el-radio-button>
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
        <el-table :data="filteredTasks" row-key="identifier" height="100%">
          <el-table-column prop="fileName" label="文件名" min-width="260" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="总进度" min-width="220">
            <template #default="{ row }">
              <el-progress :percentage="row.progress || 0" :status="progressStatus(row.status)" />
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
              <span class="message-text">{{ row.errorMessage || statusHint(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="220" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button v-if="row.parentId" link @click="goToFolder(row.parentId)">所在目录</el-button>
                <el-button v-if="row.fileId" link @click="openCompletedTask(row)">打开文件</el-button>
                <el-button v-if="row.status === 'uploading'" link @click="cancelTask(row)">取消</el-button>
                <el-button v-if="row.status !== 'uploading'" link @click="triggerUpload">重新上传</el-button>
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
import { RefreshRight } from '@element-plus/icons-vue'
import { cancelUploadTask, clearTransferTasks, getTransferTasks } from '@/apis/resource'
import PageState from '@/components/PageState.vue'
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

const cancelTask = async (task) => {
  try {
    await cancelUploadTask(task.identifier)
    window.eventBus.emit('cancelUploadByIdentifier', task.identifier)
    ElMessage.success('上传任务已取消')
    loadTransfers()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '取消上传任务失败'))
  }
}

const goToFolder = (folderId) => {
  router.push(`/folder/${folderId}`)
}

const openCompletedTask = (task) => {
  if (!task.fileId) {
    return
  }
  if (task.fileName && task.fileName.toLowerCase().endsWith('.mp4')) {
    const routeLocation = router.resolve(`/video/${task.fileId}`)
    window.open(routeLocation.href, '_blank')
    return
  }
  router.push(`/folder/${task.parentId}`)
}

const statusLabel = (status) => {
  return {
    uploading: '上传中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }[status] || '未知'
}

const statusTagType = (status) => {
  return {
    uploading: 'primary',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }[status] || 'info'
}

const progressStatus = (status) => {
  return {
    completed: 'success',
    failed: 'exception'
  }[status] || ''
}

const statusHint = (status) => {
  return {
    uploading: '任务正在上传中',
    completed: '文件已上传完成',
    failed: '上传失败，可重新选择文件上传',
    cancelled: '任务已被取消'
  }[status] || '暂无状态说明'
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
  gap: 16px;
  height: 100%;
}

.page-header,
.filter-bar,
.table-card,
.summary-card {
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

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-count {
  font-size: 28px;
  color: #303133;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
}

.filter-label {
  color: #606266;
  font-size: 14px;
}

.table-card {
  height: calc(100vh - 360px);
  min-height: 420px;
  padding: 8px 0;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.message-text {
  color: #606266;
  word-break: break-all;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header,
  .filter-bar {
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
