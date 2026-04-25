<template>
  <div class="search-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">搜索结果</h1>
        <p v-if="keyword" class="page-header__subtitle">搜索关键字: "{{ keyword }}"</p>
      </div>
    </div>

    <div class="search-content">
      <div class="search-bar">
        <el-input
          v-model="inputKeyword"
          placeholder="请输入搜索关键字..."
          clearable
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <div v-if="loading" class="search-loading">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <span>搜索中...</span>
      </div>

      <el-empty v-else-if="results.length === 0 && !loading" description="未找到匹配的文件" />

      <div v-else class="search-results">
        <div class="search-results__header">
          <span>找到 {{ total }} 个匹配的文件</span>
          <div class="sort-options">
            <el-radio-group v-model="sortBy" size="small" @change="handleSearch">
              <el-radio-button value="name">名称</el-radio-button>
              <el-radio-button value="size">大小</el-radio-button>
              <el-radio-button value="updateTime">时间</el-radio-button>
            </el-radio-group>
            <el-button size="small" @click="toggleSortOrder">
              {{ sortOrder === 'asc' ? '升序' : '降序' }}
            </el-button>
          </div>
        </div>

        <div class="search-results__list">
          <div v-for="file in results" :key="file.id" class="search-result-item">
            <div class="result-icon">
              <FileTypeIcon :type="file.type" />
            </div>
            <div class="result-info">
              <div class="result-name" v-html="highlightKeyword(file.fileName)"></div>
              <div class="result-meta">
                <span>{{ formatSize(file.size) }}</span>
                <span>{{ formatFileDate(file.updateTime) }}</span>
                <span class="result-path" @click.stop="goToFolder(file.parentId)">所在目录</span>
              </div>
            </div>
            <div class="result-actions">
              <el-button
                v-if="file.type === 'video'"
                type="primary"
                link
                @click.stop="playVideo(file)"
              >
                播放
              </el-button>
              <el-button
                v-else-if="file.type !== 'folder'"
                type="primary"
                link
                @click.stop="handleDownload(file)"
              >
                下载
              </el-button>
              <el-button link @click.stop="showDetail(file)">详情</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FileDetailDrawer v-model="detailVisible" :file-id="detailFileId" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import { searchFiles, downloadFileUrl } from '@/apis/file'
import { getFileRoute, getVideoRoute } from '@/router'
import { formatSize } from '@/utils/index'
import { formatFileDate } from '@/utils/file'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const inputKeyword = ref('')
const loading = ref(false)
const results = ref([])
const total = ref(0)
const sortBy = ref('name')
const sortOrder = ref('asc')
const detailVisible = ref(false)
const detailFileId = ref(null)

onMounted(() => {
  keyword.value = route.query.q || ''
  inputKeyword.value = keyword.value
  if (keyword.value) {
    handleSearch()
  }
})

watch(
  () => route.query.q,
  newQ => {
    keyword.value = newQ || ''
    inputKeyword.value = keyword.value
    if (keyword.value) {
      handleSearch()
    }
  }
)

const goToFolder = folderId => {
  if (!folderId && folderId !== 0) {
    ElMessage.warning('无法确定文件所在目录')
    return
  }
  router.push(getFileRoute(folderId))
}

const playVideo = file => {
  const routeLocation = router.resolve(getVideoRoute(file.id))
  window.open(routeLocation.href, '_blank')
}

const showDetail = file => {
  detailFileId.value = file.id
  detailVisible.value = true
}

const handleDownload = file => {
  try {
    const link = document.createElement('a')
    link.href = downloadFileUrl(file.id)
    link.click()
    ElMessage.success('下载任务已开始')
  } catch {
    ElMessage.error('下载失败，请稍后重试')
  }
}

const handleSearch = async () => {
  const trimmedKeyword = inputKeyword.value.trim()
  if (!trimmedKeyword) {
    ElMessage.warning('请输入搜索关键字')
    return
  }

  keyword.value = trimmedKeyword
  loading.value = true
  results.value = []
  total.value = 0

  try {
    const response = await searchFiles(trimmedKeyword, {
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    results.value = response.data || []
    total.value = response.extra?.total || results.value.length
  } catch {
    ElMessage.error('搜索失败，请稍后重试')
    results.value = []
  } finally {
    loading.value = false
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  handleSearch()
}

const escapeHtml = str => {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const highlightKeyword = fileName => {
  if (!keyword.value || !fileName) return escapeHtml(fileName)
  const escaped = escapeHtml(fileName)
  const escapedKeyword = escapeHtml(keyword.value)
  const regex = new RegExp(`(${escapedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(regex, '<span class="keyword-highlight">$1</span>')
}
</script>

<style lang="scss" scoped>
.search-page {
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);

  &__left {
    flex: 1;
  }

  &__title {
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs);
  }

  &__subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.search-content {
  max-width: 1000px;
  margin: 0 auto;
}

.search-bar {
  margin-bottom: var(--spacing-xl);
}

.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.search-results {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border-lighter);
    margin-bottom: var(--spacing-md);

    span {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }
}

.result-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.result-actions {
  flex-shrink: 0;
}

.keyword-highlight {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-bg);
  padding: 0 2px;
  border-radius: 2px;
}
</style>
