<template>
  <div class="task-center-container">
    <div class="header">
      <h2>任务中心</h2>
      <el-button @click="fetchTasks" :loading="loading">刷新</el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filters.status" placeholder="状态筛选" clearable @change="handleFilterChange">
        <el-option label="全部状态" value="" />
        <el-option label="等待中" value="PENDING" />
        <el-option label="执行中" value="RUNNING" />
        <el-option label="已完成" value="SUCCESS" />
        <el-option label="失败" value="FAILED" />
      </el-select>
      <el-select v-model="filters.source" placeholder="来源筛选" clearable @change="handleFilterChange">
        <el-option label="全部来源" value="" />
        <el-option label="系统任务" value="sys" />
        <el-option label="媒体任务" value="media" />
      </el-select>
    </div>

    <!-- 批量操作栏 -->
    <div class="batch-bar" v-if="selectedTasks.length > 0">
      <span>已选择 {{ selectedTasks.length }} 项</span>
      <el-button type="warning" size="small" @click="handleBatchRetry" :loading="batchRetryLoading">批量重试</el-button>
    </div>

    <!-- 任务表格 -->
    <el-table
      :data="tasks"
      v-loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" :selectable="canSelect" />
      <el-table-column prop="taskName" label="任务名称" min-width="150" />
      <el-table-column label="来源" width="100">
        <template #default="{ row }">
          <el-tag :type="row.source === 'sys' ? 'info' : 'warning'" size="small">
            {{ row.source === 'sys' ? '系统' : '媒体' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="进度" width="180">
        <template #default="{ row }">
          <el-progress :percentage="row.progressPercent || 0" :status="getProgressStatus(row.status)" />
        </template>
      </el-table-column>
      <el-table-column label="重试" width="100">
        <template #default="{ row }">
          <span v-if="row.maxRetries > 0">{{ row.retryCount }}/{{ row.maxRetries }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="showDetail(row)">详情</el-button>
          <el-button
            v-if="row.status === 'FAILED'"
            link
            type="warning"
            @click="handleRetry(row)"
            :loading="retryLoading[row.id]"
          >重试</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 任务详情弹窗 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="500px">
      <div v-if="currentTask" class="task-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ currentTask.taskType }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentTask.source === 'sys' ? '系统任务' : '媒体任务' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTask.status)">{{ getStatusText(currentTask.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="进度">{{ currentTask.progressPercent || 0 }}%</el-descriptions-item>
          <el-descriptions-item label="重试次数" v-if="currentTask.maxRetries > 0">
            {{ currentTask.retryCount }} / {{ currentTask.maxRetries }}
          </el-descriptions-item>
          <el-descriptions-item label="媒体类型" v-if="currentTask.mediaType">
            {{ currentTask.mediaType }}
          </el-descriptions-item>
          <el-descriptions-item label="关联文件ID" v-if="currentTask.fileId">
            {{ currentTask.fileId }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentTask.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="开始时间" v-if="currentTask.startTime">
            {{ formatDate(currentTask.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间" v-if="currentTask.finishTime">
            {{ formatDate(currentTask.finishTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="错误信息" v-if="currentTask.errorMsg">
            <div class="error-msg">{{ currentTask.errorMsg }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="currentTask?.status === 'FAILED'"
          type="warning"
          @click="handleRetry(currentTask)"
          :loading="retryLoading[currentTask.id]"
        >重试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTasks, getTaskDetail, retryTask, batchRetryTasks } from '@/apis/task'

const tasks = ref([])
const loading = ref(false)
const retryLoading = reactive({})
const batchRetryLoading = ref(false)
const selectedTasks = ref([])
const detailVisible = ref(false)
const currentTask = ref(null)
let timer = null

const filters = reactive({
  status: '',
  source: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await getTasks({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status,
      source: filters.source
    })
    const data = res.data
    tasks.value = data?.list || []
    pagination.total = data?.total || 0
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchTasks()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchTasks()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchTasks()
}

const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

const canSelect = (row) => {
  return row.status === 'FAILED'
}

const showDetail = async (row) => {
  try {
    const res = await getTaskDetail(row.id, row.source)
    currentTask.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  }
}

const handleRetry = async (row) => {
  try {
    await ElMessageBox.confirm('确定要重试该任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    retryLoading[row.id] = true
    await retryTask(row.id, row.source)
    ElMessage.success('任务已重新提交')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重试失败')
    }
  } finally {
    retryLoading[row.id] = false
  }
}

const handleBatchRetry = async () => {
  try {
    await ElMessageBox.confirm(`确定要重试选中的 ${selectedTasks.value.length} 个任务吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    batchRetryLoading.value = true
    const taskIds = selectedTasks.value.map(t => t.id)
    const source = selectedTasks.value[0]?.source || 'sys'
    await batchRetryTasks(taskIds, source)
    ElMessage.success('批量重试成功')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量重试失败')
    }
  } finally {
    batchRetryLoading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    'PENDING': 'info',
    'RUNNING': 'primary',
    'SUCCESS': 'success',
    'FAILED': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'PENDING': '等待中',
    'RUNNING': '执行中',
    'SUCCESS': '已完成',
    'FAILED': '失败'
  }
  return map[status] || status
}

const getProgressStatus = (status) => {
  if (status === 'SUCCESS') return 'success'
  if (status === 'FAILED') return 'exception'
  return ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString()
}

const startAutoRefresh = () => {
  timer = setInterval(() => {
    const hasRunning = tasks.value.some(t => t.status === 'RUNNING' || t.status === 'PENDING')
    if (hasRunning) {
      fetchTasks()
    }
  }, 5000)
}

onMounted(() => {
  fetchTasks()
  startAutoRefresh()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.task-center-container {
  padding: 24px;
  background-color: var(--color-bg-base);
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--color-fill-light);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-regular);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.task-detail .error-msg {
  color: var(--color-danger);
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
