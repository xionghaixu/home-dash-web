<template>
  <div class="recent-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">最近上传</h1>
        <p class="page-subtitle">查看近期新增文件与上传统计。</p>
      </div>
      <el-button type="primary" :icon="RefreshRight" :loading="loading" @click="loadRecentSummary">
        刷新
      </el-button>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && recentFiles.length === 0"
      empty-description="暂无最近上传记录。"
      min-height="420px"
      @retry="loadRecentSummary"
    >
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">今日上传</div>
          <div class="summary-value">{{ summary.todayCount || 0 }}</div>
          <div class="summary-meta">{{ formatSize(summary.todaySize || 0) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">本周上传</div>
          <div class="summary-value">{{ summary.weekCount || 0 }}</div>
          <div class="summary-meta">{{ formatSize(summary.weekSize || 0) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">本月上传</div>
          <div class="summary-value">{{ summary.monthCount || 0 }}</div>
          <div class="summary-meta">{{ formatSize(summary.monthSize || 0) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">最近记录</div>
          <div class="summary-value">{{ summary.totalCount || 0 }}</div>
          <div class="summary-meta">按最新创建时间排序</div>
        </div>
      </div>

      <div class="recent-list-panel">
        <div class="panel-title">最近上传文件</div>
        <div class="recent-list">
          <div
            v-for="file in recentFiles"
            :key="file.id"
            class="recent-item"
            @click="openFile(file)"
          >
            <div class="item-icon">
              <FileTypeIcon :type="file.type" :size="26" />
            </div>
            <div class="item-info">
              <div class="item-name" :title="file.fileName">{{ file.fileName }}</div>
              <div class="item-meta">
                <span>{{ getFileTypeLabel(file.type) }}</span>
                <span>{{ formatFileSize(file) }}</span>
                <span>{{ formatFileDate(file.createTime) }}</span>
              </div>
            </div>
            <el-button text type="primary" @click.stop="openFolder(file)">打开目录</el-button>
          </div>
        </div>
      </div>
    </PageState>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight } from '@element-plus/icons-vue'
import { getRecentUploadSummary } from '@/apis/file'
import { getFileRoute } from '@/router'
import PageState from '@/components/PageState.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import { formatSize } from '@/utils'
import { formatFileDate, formatFileSize, getFileTypeLabel, resolveErrorMessage } from '@/utils/file'

const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const summary = ref({})

const recentFiles = computed(() => summary.value.recentFiles || [])

const loadRecentSummary = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getRecentUploadSummary(30)
    summary.value = response.data || {}
  } catch (error) {
    summary.value = {}
    errorMessage.value = resolveErrorMessage(error, '最近上传数据加载失败')
  } finally {
    loading.value = false
  }
}

const openFile = file => {
  router.push(getFileRoute(file.parentId ?? 0))
}

const openFolder = file => {
  router.push(getFileRoute(file.parentId ?? 0))
}

onMounted(() => {
  loadRecentSummary()
})
</script>

<style lang="scss" scoped>
.recent-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-lighter);
  box-shadow: var(--shadow-sm);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
}

.page-subtitle {
  margin: var(--spacing-sm) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.summary-card,
.recent-list-panel {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-lighter);
  box-shadow: var(--shadow-sm);
}

.summary-card {
  padding: var(--spacing-xl);
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.summary-value {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.summary-meta {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.recent-list-panel {
  padding: var(--spacing-lg);
}

.panel-title {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  cursor: pointer;

  &:hover {
    background: var(--color-fill-base);
  }
}

.item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-fill-base);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 960px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .recent-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
