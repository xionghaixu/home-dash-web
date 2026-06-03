<template>
  <div class="storage-analysis-container">
    <div class="header">
      <h2>存储分析</h2>
      <el-button :loading="loading" @click="fetchAnalysis">刷新</el-button>
    </div>

    <!-- 清理建议 -->
    <div v-if="analysis?.suggestions?.length > 0" class="suggestions-section">
      <h3>清理建议</h3>
      <div class="suggestions-grid">
        <el-card
          v-for="suggestion in analysis.suggestions"
          :key="suggestion.type"
          class="suggestion-card"
        >
          <div class="suggestion-content">
            <div class="suggestion-info">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-desc">{{ suggestion.description }}</div>
            </div>
            <el-button type="primary" size="small" @click="router.push(suggestion.actionPath)">
              去清理
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-section">
      <div class="overview-cards">
        <el-card class="overview-card">
          <div class="card-value">{{ formatSize(analysis?.totalSize) }}</div>
          <div class="card-label">已用空间</div>
        </el-card>
        <el-card class="overview-card">
          <div class="card-value">{{ analysis?.totalFileCount || 0 }}</div>
          <div class="card-label">文件总数</div>
        </el-card>
        <el-card class="overview-card">
          <div class="card-value">{{ formatSize(cleanableSize) }}</div>
          <div class="card-label">可清理空间</div>
        </el-card>
        <el-card class="overview-card">
          <div class="card-value">{{ analysis?.cleanable?.emptyDirCount || 0 }}</div>
          <div class="card-label">空目录数</div>
        </el-card>
      </div>
    </div>

    <!-- 类型分布 -->
    <div class="section">
      <h3>文件类型分布</h3>
      <div v-if="analysis?.typeBreakdown?.length > 0" class="type-breakdown">
        <div v-for="item in analysis.typeBreakdown" :key="item.type" class="type-item">
          <div class="type-header">
            <span class="type-name">{{ item.label }}</span>
            <span class="type-count">{{ item.count }} 个文件</span>
            <span class="type-size">{{ formatSize(item.size) }}</span>
            <span class="type-percent">{{ item.percent }}%</span>
          </div>
          <el-progress :percentage="item.percent" :show-text="false" :stroke-width="8" />
        </div>
      </div>
      <el-empty v-else description="暂无数据" />
    </div>

    <!-- 目录占用排行 -->
    <div class="section">
      <h3>目录占用排行 Top10</h3>
      <el-table v-loading="loading" :data="analysis?.topDirs || []" style="width: 100%">
        <el-table-column type="index" label="排名" width="60" />
        <el-table-column prop="dirName" label="目录名" min-width="200" />
        <el-table-column prop="fileCount" label="文件数" width="100" />
        <el-table-column label="占用空间" width="150">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 大文件排行 -->
    <div class="section">
      <h3>大文件排行 Top20</h3>
      <el-table v-loading="loading" :data="analysis?.topFiles || []" style="width: 100%">
        <el-table-column type="index" label="排名" width="60" />
        <el-table-column prop="fileName" label="文件名" min-width="250" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="大小" width="150">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ formatSize(row.size) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStorageAnalysis } from '@/apis/governance'
import { formatSize } from '@/utils'

const router = useRouter()
const loading = ref(false)
const analysis = ref(null)

const cleanableSize = computed(() => {
  const cleanable = analysis.value?.cleanable
  if (!cleanable) return 0
  return (cleanable.recycleBinSize || 0) + (cleanable.duplicateSize || 0)
})

const fetchAnalysis = async () => {
  loading.value = true
  try {
    const res = await getStorageAnalysis()
    analysis.value = res.data
  } catch (error) {
    ElMessage.error('获取存储分析数据失败：' + (error?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const formatDate = dateStr => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString()
}

onMounted(() => {
  fetchAnalysis()
})
</script>

<style scoped>
.storage-analysis-container {
  padding: 24px;
  background-color: var(--color-bg-base);
  height: 100%;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.suggestions-section {
  margin-bottom: 24px;
}

.suggestions-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.suggestion-card {
  background: var(--color-warning-light-9);
  border: 1px solid var(--color-warning-light-5);
}

.suggestion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-title {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.overview-section {
  margin-bottom: 24px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.overview-card {
  text-align: center;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.card-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.type-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  background: var(--color-fill-light);
  padding: 12px 16px;
  border-radius: var(--radius-md);
}

.type-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.type-name {
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 60px;
}

.type-count {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.type-size {
  font-size: 13px;
  color: var(--color-text-regular);
  margin-left: auto;
}

.type-percent {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  min-width: 50px;
  text-align: right;
}
</style>
