<template>
  <div class="cleanup-container">
    <div class="header-actions">
      <h2>空间瘦身与治理</h2>
      <p class="subtitle">清理系统中的大文件、空目录以及冗余重复文件，优化存储空间。</p>
    </div>

    <!-- 摘要统计 -->
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-count">{{ largeFiles.length }}</span>
        <span class="summary-label">个大文件</span>
      </div>
      <div class="summary-item">
        <span class="summary-count">{{ duplicateFiles.length }}</span>
        <span class="summary-label">组重复文件</span>
      </div>
      <div class="summary-item">
        <span class="summary-count">{{ emptyDirs.length }}</span>
        <span class="summary-label">个空目录</span>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="cleanup-tabs" @tab-change="handleTabChange">
      <!-- Tab 1: 大文件清理 -->
      <el-tab-pane label="大文件清理" name="largeFiles">
        <div class="tab-header">
          <span class="info-text">展示系统内文件大小排名前 100 的文件</span>
          <el-button :icon="Refresh" circle :loading="loading" @click="fetchLargeFiles"></el-button>
        </div>
        <el-table
          v-loading="loading"
          :data="largeFiles"
          style="width: 100%"
          class="governance-table"
        >
          <el-table-column prop="fileName" label="文件名" min-width="250">
            <template #default="{ row }">
              <div class="file-cell">
                <el-icon class="file-icon"><Document /></el-icon>
                <span class="file-name">{{ row.fileName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="150">
            <template #default="{ row }">
              <el-tag type="info" effect="plain">{{ formatSize(row.size) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="200">
            <template #default="{ row }">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row, false)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 2: 重复文件清理 -->
      <el-tab-pane label="重复文件清理" name="duplicates">
        <div class="tab-header flex-header">
          <span class="info-text">扫描具有相同 MD5 值的重复文件，可以一键进行治理</span>
          <div class="actions-group">
            <el-button
              type="primary"
              :icon="Warning"
              :loading="smartLoading"
              @click="handleSmartKeepOne"
            >
              智能保留一份
            </el-button>
            <el-button
              :icon="Refresh"
              circle
              :loading="loading"
              @click="fetchDuplicates"
            ></el-button>
          </div>
        </div>
        <el-table
          v-loading="loading"
          :data="duplicateFiles"
          style="width: 100%"
          row-key="md5"
          class="governance-table"
        >
          <el-table-column prop="md5" label="文件特征 (MD5)" width="280">
            <template #default="{ row }">
              <code class="md5-code">{{ row.md5 }}</code>
            </template>
          </el-table-column>
          <el-table-column label="重复大小" width="180">
            <template #default="{ row }">
              <div>
                单份大小:
                <strong>{{ formatSize(row.size) }}</strong>
              </div>
              <div class="text-muted">份数: {{ row.fileCount }} 份</div>
            </template>
          </el-table-column>
          <el-table-column label="重复文件列表" min-width="300">
            <template #default="{ row }">
              <div class="duplicate-file-list">
                <div v-for="file in row.files" :key="file.id" class="duplicate-file-item">
                  <el-icon class="sub-file-icon"><Document /></el-icon>
                  <span class="sub-file-name" :title="file.path">{{ file.fileName }}</span>
                  <span class="sub-file-path">({{ file.path }})</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="danger"
                :icon="Delete"
                :loading="cleanupLoading[row.id]"
                @click="handleCleanupGroup(row)"
              >
                清理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 3: 空目录清理 -->
      <el-tab-pane label="空目录清理" name="emptyDirs">
        <div class="tab-header">
          <span class="info-text">展示系统中没有任何子文件或子文件夹的空目录</span>
          <el-button :icon="Refresh" circle :loading="loading" @click="fetchEmptyDirs"></el-button>
        </div>
        <el-table
          v-loading="loading"
          :data="emptyDirs"
          style="width: 100%"
          class="governance-table"
        >
          <el-table-column prop="fileName" label="目录名" min-width="200">
            <template #default="{ row }">
              <div class="file-cell">
                <el-icon class="file-icon"><Folder /></el-icon>
                <span class="file-name">{{ row.fileName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="200">
            <template #default="{ row }">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row, true)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatSize } from '@/utils'
import { Document, Folder, Delete, Refresh, Warning } from '@element-plus/icons-vue'
import {
  getLargeFiles,
  getDuplicates,
  getEmptyDirs,
  smartCleanup,
  cleanupGroup
} from '@/apis/governance'
import { deleteFiles } from '@/apis/file'

const activeTab = ref('largeFiles')
const loading = ref(false)
const smartLoading = ref(false)
const cleanupLoading = reactive({})

const largeFiles = ref([])
const duplicateFiles = ref([])
const emptyDirs = ref([])

const formatDate = dateStr => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString()
}

const fetchLargeFiles = async () => {
  loading.value = true
  try {
    const res = await getLargeFiles()
    largeFiles.value = res.data || []
  } catch {
    ElMessage.error('获取大文件列表失败')
  } finally {
    loading.value = false
  }
}

const fetchDuplicates = async () => {
  loading.value = true
  try {
    const res = await getDuplicates()
    duplicateFiles.value = res.data || []
  } catch {
    ElMessage.error('获取重复文件失败')
  } finally {
    loading.value = false
  }
}

const fetchEmptyDirs = async () => {
  loading.value = true
  try {
    const res = await getEmptyDirs()
    emptyDirs.value = res.data || []
  } catch {
    ElMessage.error('获取空目录列表失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = name => {
  if (name === 'largeFiles') {
    fetchLargeFiles()
  } else if (name === 'duplicates') {
    fetchDuplicates()
  } else if (name === 'emptyDirs') {
    fetchEmptyDirs()
  }
}

const handleDelete = async (row, isDir = false) => {
  try {
    await ElMessageBox.confirm(
      isDir
        ? `确定要删除空目录 "${row.fileName}" 吗？该操作将移入回收站。`
        : `确定要删除大文件 "${row.fileName}" 吗？该操作将移入回收站。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteFiles([row.id])
    ElMessage.success('已移入回收站')
    if (isDir) {
      fetchEmptyDirs()
    } else {
      fetchLargeFiles()
    }
    window.eventBus?.emit('flushFileList')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSmartKeepOne = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要对所有重复文件组进行智能清理吗？每组将仅保留最早的一份文件，其余文件将被移入回收站。',
      '智能治理确认',
      {
        confirmButtonText: '立即清理',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    smartLoading.value = true
    await smartCleanup()
    ElMessage.success('智能清理完成，多余的冗余文件已移入回收站')
    fetchDuplicates()
    window.eventBus?.emit('flushFileList')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('智能清理失败')
    }
  } finally {
    smartLoading.value = false
  }
}

const handleCleanupGroup = async row => {
  try {
    await ElMessageBox.confirm(
      `确定要清理此重复文件组吗？该操作将仅保留最早的文件，其余 ${row.fileCount - 1} 份副本将被移入回收站。`,
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    cleanupLoading[row.id] = true
    await cleanupGroup(row.id)
    ElMessage.success('清理组成功')
    fetchDuplicates()
    window.eventBus?.emit('flushFileList')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理失败')
    }
  } finally {
    cleanupLoading[row.id] = false
  }
}

onMounted(() => {
  fetchLargeFiles()
})
</script>

<style scoped>
.cleanup-container {
  padding: 24px;
  background-color: var(--color-bg-base);
  height: 100%;
}

.header-actions {
  margin-bottom: 16px;
}

.header-actions h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.summary-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--color-fill-light);
  border-radius: var(--radius-md);
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.summary-count {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
}

.summary-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.cleanup-tabs {
  margin-top: 16px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--color-fill-light);
  border-radius: var(--radius-md);
}

.flex-header {
  align-items: center;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-text {
  font-size: 14px;
  color: var(--color-text-regular);
}

.governance-table {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 18px;
  color: var(--color-primary);
}

.file-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.md5-code {
  font-family: monospace;
  background-color: var(--color-fill-base);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--color-warning);
}

.text-muted {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.duplicate-file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.duplicate-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.sub-file-icon {
  font-size: 14px;
  color: var(--color-text-regular);
  opacity: 0.7;
}

.sub-file-name {
  font-weight: 500;
  color: var(--color-text-regular);
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-file-path {
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
