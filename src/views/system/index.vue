<template>
  <div class="system-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统信息</h2>
        <p class="page-subtitle">查看容量概况、文件统计和阶段一工作台的基础摘要。</p>
      </div>
      <el-button plain :icon="RefreshRight" :loading="loading" @click="loadSystemInfo">刷新</el-button>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && !systemData"
      empty-description="暂时无法读取系统统计信息。"
      min-height="420px"
      @retry="loadSystemInfo"
    >
      <div v-if="systemData" class="system-content">
        <div class="storage-card">
          <div class="storage-header">
            <span class="card-title">容量概况</span>
            <span class="storage-rate">已使用 {{ usedRate }}%</span>
          </div>
          <div class="storage-stats">
            <div class="storage-item">
              <span class="storage-label">总容量</span>
              <strong>{{ formatToGB(systemData.totalCap) }} GB</strong>
            </div>
            <div class="storage-item">
              <span class="storage-label">已使用</span>
              <strong>{{ formatToGB(usedCap) }} GB</strong>
            </div>
            <div class="storage-item">
              <span class="storage-label">剩余</span>
              <strong>{{ formatToGB(systemData.usableCap) }} GB</strong>
            </div>
          </div>
          <el-progress :percentage="usedRate" :stroke-width="12" />
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">文件总数</span>
            <strong>{{ systemData.fileNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">文件夹总数</span>
            <strong>{{ systemData.folderNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">最近上传</span>
            <strong>{{ systemData.recentUploadNum }}</strong>
          </div>
        </div>

        <div class="stats-grid detail-grid">
          <div class="stat-card">
            <span class="stat-label">图片</span>
            <strong>{{ systemData.pictureNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">视频</span>
            <strong>{{ systemData.videoNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">音频</span>
            <strong>{{ systemData.audioNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">文档</span>
            <strong>{{ systemData.docNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">压缩包</span>
            <strong>{{ systemData.compressNum }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">其他文件</span>
            <strong>{{ systemData.otherNum }}</strong>
          </div>
        </div>
      </div>
    </PageState>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { systemInfo } from '@/apis/system'
import PageState from '@/components/PageState.vue'
import { resolveErrorMessage } from '@/utils/file'

const systemData = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const usedCap = computed(() => {
  if (!systemData.value) {
    return 0
  }
  return systemData.value.totalCap - systemData.value.usableCap
})

const usedRate = computed(() => {
  if (!systemData.value?.totalCap) {
    return 0
  }
  return Math.min(100, Math.round((usedCap.value / systemData.value.totalCap) * 100))
})

const formatToGB = (size, pointLength = 2) => {
  if (size === null || size === undefined) {
    return '-'
  }
  return (size / 1024 / 1024 / 1024).toFixed(pointLength)
}

const loadSystemInfo = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await systemInfo()
    systemData.value = response.data
  } catch (error) {
    systemData.value = null
    errorMessage.value = resolveErrorMessage(error, '系统信息加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSystemInfo()
})
</script>

<style lang="scss" scoped>
.system-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header,
.storage-card,
.stat-card {
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

.system-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.storage-card {
  padding: 24px;
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.storage-rate {
  color: #409eff;
}

.storage-stats,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.storage-item,
.stat-card {
  padding: 18px;
}

.storage-label,
.stat-label {
  display: block;
  margin-bottom: 8px;
  color: #909399;
  font-size: 14px;
}

.storage-item strong,
.stat-card strong {
  font-size: 28px;
  color: #303133;
}

.detail-grid {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

@media (max-width: 1200px) {
  .detail-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .storage-stats,
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .storage-stats,
  .stats-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
