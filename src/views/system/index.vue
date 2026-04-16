<template>
  <div class="system-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">系统信息</h1>
        <p class="page-header__subtitle">查看容量概况、文件统计和存储分布。</p>
      </div>
      <div class="page-header__actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadSystemInfo">
          刷新
        </el-button>
      </div>
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
            <h3 class="storage-title">容量概况</h3>
            <span class="storage-rate" :class="rateClass">{{ usedRate }}% 已使用</span>
          </div>
          <div class="storage-body">
            <div class="storage-ring">
              <CapacityRing :percentage="usedRate" />
            </div>
            <div class="storage-stats">
              <div class="storage-stat">
                <span class="stat-label">总容量</span>
                <strong class="stat-value">{{ formatToGB(systemData.totalCap) }}</strong>
                <span class="stat-unit">GB</span>
              </div>
              <div class="storage-stat">
                <span class="stat-label">已使用</span>
                <strong class="stat-value used">{{ formatToGB(usedCap) }}</strong>
                <span class="stat-unit">GB</span>
              </div>
              <div class="storage-stat">
                <span class="stat-label">剩余空间</span>
                <strong class="stat-value free">{{ formatToGB(systemData.usableCap) }}</strong>
                <span class="stat-unit">GB</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section-title">文件统计</div>
        <div class="stats-grid">
          <DataCard label="文件总数" :value="systemData.fileNum" :icon="Document" type="primary" />
          <DataCard label="文件夹" :value="systemData.folderNum" :icon="Folder" type="info" />
          <DataCard
            label="最近上传"
            :value="systemData.recentUploadNum"
            :icon="Upload"
            type="success"
          />
        </div>

        <div class="section-title">文件类型分布</div>
        <div class="category-grid">
          <DataCard label="图片" :value="systemData.pictureNum" :icon="Picture" type="primary" />
          <DataCard label="视频" :value="systemData.videoNum" :icon="VideoCamera" type="warning" />
          <DataCard label="音频" :value="systemData.audioNum" :icon="Microphone" type="info" />
          <DataCard label="文档" :value="systemData.docNum" :icon="Document" type="primary" />
          <DataCard
            label="压缩包"
            :value="systemData.compressNum"
            :icon="FolderOpened"
            type="warning"
          />
          <DataCard label="其他文件" :value="systemData.otherNum" :icon="More" type="info" />
        </div>
      </div>
    </PageState>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  RefreshRight,
  Document,
  Folder,
  Upload,
  Picture,
  VideoCamera,
  Microphone,
  FolderOpened,
  More
} from '@element-plus/icons-vue'
import { systemInfo } from '@/apis/system'
import PageState from '@/components/PageState.vue'
import CapacityRing from '@/components/CapacityRing.vue'
import DataCard from '@/components/DataCard.vue'
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

const rateClass = computed(() => {
  if (usedRate.value >= 90) return 'rate--danger'
  if (usedRate.value >= 75) return 'rate--warning'
  return 'rate--normal'
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

.system-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.storage-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
  padding: var(--spacing-2xl);
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.storage-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.storage-rate {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);

  &.rate--normal {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  &.rate--warning {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  &.rate--danger {
    background: var(--color-danger-light);
    color: var(--color-danger);
  }
}

.storage-body {
  display: flex;
  align-items: center;
  gap: var(--spacing-3xl);
}

.storage-ring {
  flex-shrink: 0;
}

.storage-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.storage-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-xl);
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;

  &.used {
    color: var(--color-primary);
  }

  &.free {
    color: var(--color-success);
  }
}

.stat-unit {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: var(--spacing-sm) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-lg);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 1280px) {
  .category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
  }

  .storage-body {
    flex-direction: column;
  }

  .storage-stats {
    width: 100%;
  }

  .stats-grid,
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .storage-stats {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
