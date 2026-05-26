<template>
  <div class="search-page">
    <!-- 顶部搜索区域 -->
    <div class="search-hero">
      <div class="search-bar-container">
        <el-input
          v-model="inputKeyword"
          placeholder="搜索文件、图片、视频、音频..."
          clearable
          size="large"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon :size="20"><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>

        <!-- 快捷筛选标签 -->
        <div class="quick-filters">
          <el-tag
            v-for="type in quickFilterTypes"
            :key="type.value"
            :effect="filters.types.includes(type.value) ? 'dark' : 'plain'"
            :type="filters.types.includes(type.value) ? 'primary' : 'info'"
            class="quick-filter-tag"
            @click="toggleQuickFilter(type.value)"
          >
            <el-icon :size="14"><component :is="type.icon" /></el-icon>
            {{ type.label }}
          </el-tag>
          <el-tag
            :effect="filters.favorite ? 'dark' : 'plain'"
            :type="filters.favorite ? 'warning' : 'info'"
            class="quick-filter-tag"
            @click="toggleFavoriteFilter"
          >
            <el-icon :size="14"><Star /></el-icon>
            收藏
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="search-content">
      <!-- 左侧边栏：筛选与历史 -->
      <aside class="search-sidebar">
        <!-- 高级筛选面板 -->
        <div class="sidebar-section">
          <div class="section-title">
            <el-icon><Filter /></el-icon>
            高级筛选
          </div>
          <SearchFilterPanel
            v-model="filters"
            :available-tags="availableTags"
            :folder-tree="folderTree"
            @change="handleFilterChange"
          />
        </div>

        <el-divider />

        <!-- 搜索历史 -->
        <div class="sidebar-section">
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            搜索历史
            <el-button
              v-if="searchState.history.length > 0"
              type="primary"
              link
              size="small"
              @click="handleClearHistory"
            >
              清空
            </el-button>
          </div>
          <SearchHistory
            :history="searchState.history"
            @select="handleHistorySelect"
            @clear="handleClearHistory"
          />
        </div>

        <el-divider />

        <!-- 已保存视图 -->
        <div class="sidebar-section">
          <div class="section-title">
            <el-icon><View /></el-icon>
            保存的视图
            <el-button type="primary" link size="small" @click="showSaveFilterDialog = true">
              保存当前
            </el-button>
          </div>
          <div v-if="filterViews.length === 0" class="empty-views">
            暂无保存的视图
          </div>
          <div v-else class="filter-views-list">
            <div
              v-for="view in filterViews"
              :key="view.id"
              class="filter-view-item"
              :class="{ active: isCurrentView(view) }"
              @click="handleLoadFilterView(view)"
            >
              <el-icon><Collection /></el-icon>
              <span class="view-name">{{ view.name }}</span>
              <el-icon class="view-delete" @click.stop="handleDeleteFilterView(view.id)">
                <Close />
              </el-icon>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧结果区域 -->
      <main class="search-main">
        <!-- 结果头部工具栏 -->
        <div class="results-toolbar">
          <div class="results-info">
            <template v-if="keyword">
              <span class="results-keyword">"{{ keyword }}"</span>
              <span class="results-count">找到 {{ searchState.total }} 个结果</span>
            </template>
            <template v-else>
              <span class="results-hint">输入关键词开始搜索</span>
            </template>
          </div>

          <div class="toolbar-actions">
            <!-- 布局切换 -->
            <el-radio-group v-model="layoutMode" size="small">
              <el-radio-button value="list">
                <el-icon><List /></el-icon>
              </el-radio-button>
              <el-radio-button value="grid">
                <el-icon><Grid /></el-icon>
              </el-radio-button>
            </el-radio-group>

            <!-- 排序 -->
            <el-dropdown @command="handleSortChange">
              <el-button size="small">
                {{ sortLabel }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="relevance">相关度</el-dropdown-item>
                  <el-dropdown-item command="name">名称</el-dropdown-item>
                  <el-dropdown-item command="updateTime">修改时间</el-dropdown-item>
                  <el-dropdown-item command="size">文件大小</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button size="small" @click="toggleSortOrder">
              <el-icon>
                <SortUp v-if="sortOrder === 'asc'" />
                <SortDown v-else />
              </el-icon>
            </el-button>
          </div>
        </div>

        <!-- 已激活的筛选标签 -->
        <div v-if="hasActiveFilters" class="active-filters-bar">
          <span class="filters-label">已筛选：</span>
          <el-tag
            v-for="type in filters.types"
            :key="type"
            closable
            size="small"
            @close="handleRemoveTypeFilter(type)"
          >
            {{ getTypeLabel(type) }}
          </el-tag>
          <el-tag
            v-if="filters.favorite"
            closable
            size="small"
            type="warning"
            @close="handleRemoveFavoriteFilter"
          >
            已收藏
          </el-tag>
          <el-tag
            v-for="tag in filters.tags"
            :key="tag"
            closable
            size="small"
            type="success"
            @close="handleRemoveTagFilter(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-button type="primary" link size="small" @click="handleClearAllFilters">
            清除全部
          </el-button>
        </div>

        <!-- 批量操作栏 -->
        <BatchOperationsBar
          v-if="selectedFiles.length > 0"
          :selected-ids="selectedFiles"
          @clear-selection="selectedFiles = []"
          @batch-favorite="handleBatchFavorite"
          @batch-tag="handleBatchTag"
          @batch-delete="handleBatchDelete"
          @batch-move="handleBatchMove"
        />

        <!-- 搜索结果列表 -->
        <div v-if="searchState.loading" class="search-loading">
          <el-skeleton :rows="5" animated />
        </div>

        <el-empty v-else-if="!keyword" description="请输入搜索关键字开始搜索" :image-size="120">
          <template #image>
            <el-icon :size="60" class="empty-icon"><Search /></el-icon>
          </template>
        </el-empty>

        <el-empty
          v-else-if="searchState.results.length === 0"
          description="未找到匹配的文件"
          :image-size="120"
        >
          <template #image>
            <el-icon :size="60" class="empty-icon"><DocumentDelete /></el-icon>
          </template>
        </el-empty>

        <div
          v-else
          :class="['search-results', layoutMode === 'grid' ? 'results-grid' : 'results-list']"
        >
          <!-- 媒体类型分组展示 -->
          <template v-for="(group, type) in groupedResults" :key="type">
            <div v-if="group.length > 0" class="result-group">
              <div class="group-header">
                <el-icon><component :is="getTypeIcon(type)" /></el-icon>
                <span>{{ getTypeLabel(type) }}</span>
                <span class="group-count">({{ group.length }})</span>
              </div>

              <div class="group-items">
                <SearchResultItem
                  v-for="file in group"
                  :key="file.id"
                  :file="file"
                  :layout="layoutMode"
                  :selected="selectedFiles.includes(file.id)"
                  :keyword="keyword"
                  @click="handleFileClick(file)"
                  @select="handleFileSelect(file, $event)"
                  @preview="handlePreview(file)"
                  @play="handlePlay(file)"
                  @download="handleDownload(file)"
                  @detail="showDetail(file)"
                />
              </div>
            </div>
          </template>
        </div>

        <!-- 分页 -->
        <div v-if="searchState.total > searchState.pageSize" class="search-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="searchState.pageSize"
            :total="searchState.total"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange"
          />
        </div>
      </main>
    </div>

    <!-- 详情抽屉 -->
    <FileDetailDrawer
      v-model="detailVisible"
      :file-id="detailFileId"
      @preview="handleDrawerPreview"
      @play-audio="handlePlayAudio"
    />

    <!-- 图片预览 -->
    <ImagePreview
      v-model="imagePreviewVisible"
      :file-list="previewImages"
      :initial-index="previewImageIndex"
    />

    <!-- 文本预览 -->
    <el-dialog
      v-model="textPreviewVisible"
      :title="previewFileName || '文本预览'"
      width="min(960px, 92vw)"
    >
      <PageState
        :loading="textPreviewLoading"
        :error="Boolean(textPreviewError)"
        :error-description="textPreviewError"
        :empty="!textPreviewLoading && !textPreviewError && !textPreviewContent"
        empty-description="暂无可预览内容"
        min-height="360px"
        @retry="loadTextPreview"
      >
        <TextPreview
          v-if="textPreviewContent"
          :content="textPreviewContent"
          :file-name="previewFileName"
          :highlight-keyword="keyword"
        />
      </PageState>
    </el-dialog>

    <!-- 音频播放器（底部固定） -->
    <AudioPlayerBar
      v-if="audioPlayerVisible"
      :file-id="audioFileId"
      :file-name="audioFileName"
      @close="audioPlayerVisible = false"
    />

    <!-- 保存视图对话框 -->
    <el-dialog v-model="showSaveFilterDialog" title="保存筛选视图" width="400px">
      <el-form>
        <el-form-item label="视图名称">
          <el-input v-model="newFilterViewName" placeholder="请输入视图名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveFilterDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveFilterView">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Star,
  Filter,
  Clock,
  View,
  Collection,
  Close,
  List,
  Grid,
  ArrowDown,
  SortUp,
  SortDown,
  DocumentDelete,
  Picture,
  VideoPlay,
  Headset,
  Document,
  Folder,
  More
} from '@element-plus/icons-vue'
import SearchFilterPanel from '@/components/search/SearchFilterPanel.vue'
import SearchHistory from '@/components/search/SearchHistory.vue'
import SearchResultItem from '@/components/search/SearchResultItem.vue'
import BatchOperationsBar from '@/components/common/BatchOperationsBar.vue'
import PageState from '@/components/PageState.vue'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import TextPreview from '@/components/preview/TextPreview.vue'
import AudioPlayerBar from '@/components/preview/AudioPlayerBar.vue'
import {
  searchFilesAdvanced,
  downloadFileUrl,
  getSearchHistory,
  clearSearchHistory,
  getHotSearchTerms,
  getFilterViews,
  saveFilterView,
  deleteFilterView,
  getTagList,
  getTextPreview as fetchTextPreview
} from '@/apis/file'
import { getFileRoute, getVideoRoute } from '@/router'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const inputKeyword = ref('')
const layoutMode = ref('grid')
const sortBy = ref('relevance')
const sortOrder = ref('desc')
const detailVisible = ref(false)
const detailFileId = ref(null)
const imagePreviewVisible = ref(false)
const previewImages = ref([])
const previewImageIndex = ref(0)
const textPreviewVisible = ref(false)
const previewFileId = ref(null)
const previewFileName = ref('')
const textPreviewLoading = ref(false)
const textPreviewError = ref('')
const textPreviewContent = ref('')
const audioPlayerVisible = ref(false)
const audioFileId = ref(null)
const audioFileName = ref('')
const selectedFiles = ref([])
const filterViews = ref([])
const showSaveFilterDialog = ref(false)
const newFilterViewName = ref('')
const availableTags = ref([])
const folderTree = ref([])

const filters = reactive({
  types: [],
  dateRange: null,
  sizeRange: null,
  directoryPath: null,
  favorite: false,
  recent: false,
  tags: []
})

const searchState = reactive({
  keyword: '',
  results: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  history: [],
  hotSearches: []
})

const quickFilterTypes = [
  { value: 'picture', label: '图片', icon: Picture },
  { value: 'video', label: '视频', icon: VideoPlay },
  { value: 'audio', label: '音频', icon: Headset },
  { value: 'document', label: '文档', icon: Document },
  { value: 'folder', label: '文件夹', icon: Folder }
]

const hasActiveFilters = computed(() => {
  return (
    filters.types.length > 0 ||
    filters.dateRange !== null ||
    filters.sizeRange !== null ||
    filters.directoryPath !== null ||
    filters.favorite === true ||
    filters.tags.length > 0
  )
})

const currentPage = computed({
  get: () => searchState.page,
  set: val => {
    searchState.page = val
  }
})

const sortLabel = computed(() => {
  const labels = {
    relevance: '相关度',
    name: '名称',
    updateTime: '修改时间',
    size: '文件大小'
  }
  return labels[sortBy.value] || '相关度'
})

const groupedResults = computed(() => {
  const groups = {}
  searchState.results.forEach(file => {
    const type = file.type || 'other'
    if (!groups[type]) groups[type] = []
    groups[type].push(file)
  })
  return groups
})

onMounted(() => {
  keyword.value = route.query.q || ''
  inputKeyword.value = keyword.value
  loadHistory()
  loadHotSearches()
  loadFilterViews()
  loadTags()
  if (keyword.value) {
    doSearch()
  }
})

watch(
  () => route.query.q,
  newQ => {
    keyword.value = newQ || ''
    inputKeyword.value = keyword.value
    selectedFiles.value = []
    if (keyword.value) {
      doSearch()
    } else {
      searchState.results = []
      searchState.total = 0
    }
  }
)

const loadHistory = async () => {
  try {
    const response = await getSearchHistory()
    searchState.history = (response.data || [])
      .map(item => (typeof item === 'string' ? item : item?.keyword))
      .filter(Boolean)
  } catch {
    searchState.history = []
  }
}

const loadHotSearches = async () => {
  try {
    const response = await getHotSearchTerms()
    searchState.hotSearches = response.data || []
  } catch {
    searchState.hotSearches = []
  }
}

const loadFilterViews = async () => {
  try {
    const response = await getFilterViews()
    filterViews.value = (response.data || []).map(view => {
      let parsedParams = {}
      try {
        parsedParams = view.viewParams ? JSON.parse(view.viewParams) : {}
      } catch {
        parsedParams = {}
      }
      return {
        id: view.id,
        name: view.viewName,
        filters: normalizeFilterState(parsedParams)
      }
    })
  } catch {
    filterViews.value = []
  }
}

const loadTags = async () => {
  try {
    const response = await getTagList()
    availableTags.value = response.data || []
  } catch {
    availableTags.value = []
  }
}

const doSearch = async () => {
  searchState.loading = true
  searchState.results = []
  searchState.total = 0
  searchState.keyword = keyword.value

  try {
    const params = {
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      page: searchState.page,
      pageSize: searchState.pageSize,
      ...buildFilterParams()
    }

    const response = await searchFilesAdvanced(keyword.value, params)
    const resultData = response.data || {}
    const files = Array.isArray(resultData.files) ? resultData.files : []
    searchState.results = files.map(normalizeSearchFile)
    searchState.total = resultData.total || searchState.results.length
  } catch {
    ElMessage.error('搜索失败，请稍后重试')
    searchState.results = []
  } finally {
    searchState.loading = false
  }
}

const buildFilterParams = () => {
  const params = {}
  if (filters.types?.length > 0) params.fileTypes = filters.types
  if (filters.dateRange?.length === 2) {
    params.startDate = filters.dateRange[0]
    params.endDate = filters.dateRange[1]
  }
  if (filters.sizeRange) {
    params.minSize = filters.sizeRange.min
    params.maxSize = filters.sizeRange.max
  }
  if (filters.directoryPath) params.directoryPath = filters.directoryPath
  if (filters.favorite) params.favoritesOnly = true
  if (filters.tags?.length > 0) params.tags = filters.tags
  return params
}

const handleSearch = () => {
  const trimmed = inputKeyword.value.trim()
  if (!trimmed) {
    ElMessage.warning('请输入搜索关键字')
    return
  }
  keyword.value = trimmed
  searchState.page = 1
  router.push({ path: '/search', query: { q: trimmed } })
}

const handleHistorySelect = histKeyword => {
  inputKeyword.value = histKeyword
  handleSearch()
}

const handleClearHistory = async () => {
  try {
    await clearSearchHistory()
    searchState.history = []
    ElMessage.success('历史记录已清空')
  } catch {
    ElMessage.error('清空失败')
  }
}

const toggleQuickFilter = type => {
  const index = filters.types.indexOf(type)
  if (index > -1) {
    filters.types.splice(index, 1)
  } else {
    filters.types.push(type)
  }
  handleFilterChange()
}

const toggleFavoriteFilter = () => {
  filters.favorite = !filters.favorite
  handleFilterChange()
}

const handleFilterChange = () => {
  searchState.page = 1
  doSearch()
}

const handleSortChange = command => {
  sortBy.value = command
  searchState.page = 1
  doSearch()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  handleSortChange(sortBy.value)
}

const handlePageChange = page => {
  searchState.page = page
  doSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleFileClick = file => {
  if (file.type === 'folder') {
    router.push(getFileRoute(file.id))
  }
}

const handleFileSelect = (file, checked) => {
  if (checked) {
    if (!selectedFiles.value.includes(file.id)) {
      selectedFiles.value.push(file.id)
    }
  } else {
    selectedFiles.value = selectedFiles.value.filter(id => id !== file.id)
  }
}

const handleRemoveTypeFilter = type => {
  filters.types = filters.types.filter(t => t !== type)
  handleFilterChange()
}

const handleRemoveFavoriteFilter = () => {
  filters.favorite = false
  handleFilterChange()
}

const handleRemoveTagFilter = tag => {
  filters.tags = filters.tags.filter(t => t !== tag)
  handleFilterChange()
}

const handleClearAllFilters = () => {
  filters.types = []
  filters.dateRange = null
  filters.sizeRange = null
  filters.directoryPath = null
  filters.favorite = false
  filters.recent = false
  filters.tags = []
  handleFilterChange()
}

const isCurrentView = view => {
  return JSON.stringify(view.filters) === JSON.stringify({ ...filters })
}

const handleLoadFilterView = view => {
  if (view.filters) {
    Object.assign(filters, view.filters)
    doSearch()
  }
}

const handleDeleteFilterView = async viewId => {
  try {
    await deleteFilterView(viewId)
    ElMessage.success('视图已删除')
    filterViews.value = filterViews.value.filter(v => v.id !== viewId)
  } catch {
    ElMessage.error('删除失败')
  }
}

const handleSaveFilterView = async () => {
  if (!newFilterViewName.value.trim()) {
    ElMessage.warning('请输入视图名称')
    return
  }
  try {
    await saveFilterView({
      viewName: newFilterViewName.value.trim(),
      viewParams: JSON.stringify({ ...filters }),
      isDefault: false
    })
    ElMessage.success('视图保存成功')
    showSaveFilterDialog.value = false
    newFilterViewName.value = ''
    loadFilterViews()
  } catch {
    ElMessage.error('保存失败')
  }
}

const handleBatchFavorite = ids => {
  ElMessage.success(`已批量收藏 ${ids.length} 个文件`)
  selectedFiles.value = []
}

const handleBatchTag = ids => {
  ElMessage.info(`批量标签功能: ${ids.length} 个文件`)
}

const handleBatchDelete = ids => {
  searchState.results = searchState.results.filter(f => !ids.includes(f.id))
  selectedFiles.value = []
}

const handleBatchMove = ids => {
  ElMessage.info(`批量移动功能: ${ids.length} 个文件`)
}

const handlePreview = file => {
  if (file.type === 'picture') {
    const images = searchState.results.filter(f => f.type === 'picture')
    const index = images.findIndex(f => f.id === file.id)
    previewImages.value = images
    previewImageIndex.value = index >= 0 ? index : 0
    imagePreviewVisible.value = true
  } else if (file.type === 'txt' || file.type === 'text') {
    previewFileId.value = file.resourceId || file.id
    previewFileName.value = file.fileName
    loadTextPreview()
    textPreviewVisible.value = true
  }
}

const handlePlay = file => {
  if (file.type === 'video') {
    const routeLocation = router.resolve(getVideoRoute(file.id))
    window.open(routeLocation.href, '_blank')
  } else if (file.type === 'audio') {
    audioFileId.value = file.resourceId || file.id
    audioFileName.value = file.fileName
    audioPlayerVisible.value = true
  }
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

const showDetail = file => {
  detailFileId.value = file.id
  detailVisible.value = true
}

const handleDrawerPreview = payload => {
  if (payload.type === 'image') {
    handlePreview(payload.file)
  } else if (payload.type === 'text') {
    handlePreview(payload.file)
  }
}

const handlePlayAudio = payload => {
  if (payload.type === 'audio') {
    handlePlay(payload.file)
  }
}

const getTypeLabel = type => {
  const labels = {
    picture: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    text: '文本',
    txt: '文本',
    code: '代码',
    compress: '压缩包',
    folder: '文件夹',
    other: '其他'
  }
  return labels[type] || type
}

const getTypeIcon = type => {
  const icons = {
    picture: Picture,
    video: VideoPlay,
    audio: Headset,
    document: Document,
    folder: Folder,
    other: More
  }
  return icons[type] || Document
}

const normalizeSearchFile = file => ({
  ...file,
  id: file.fileId ?? file.id,
  favorite: file.isFavorite ?? file.favorite ?? false,
  folderPath: file.folderPath ?? file.parentPath,
  tags: Array.isArray(file.tags) ? file.tags : []
})

const normalizeFilterState = value => ({
  types: value.types || value.fileTypes || [],
  dateRange: value.dateRange || null,
  sizeRange: value.sizeRange || null,
  directoryPath: value.directoryPath || null,
  favorite: Boolean(value.favorite || value.favoritesOnly),
  recent: Boolean(value.recent),
  tags: value.tags || []
})

const loadTextPreview = async () => {
  if (!previewFileId.value) {
    return
  }

  textPreviewLoading.value = true
  textPreviewError.value = ''
  textPreviewContent.value = ''

  try {
    const response = await fetchTextPreview(previewFileId.value)
    textPreviewContent.value = response.data?.content || ''
  } catch {
    textPreviewError.value = '文本预览加载失败'
  } finally {
    textPreviewLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: var(--color-bg-base);
}

// 顶部搜索区域
.search-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: var(--spacing-3xl) var(--spacing-xl);
  display: flex;
  justify-content: center;
}

.search-bar-container {
  width: 100%;
  max-width: 800px;
}

.search-input {
  :deep(.el-input__wrapper) {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: var(--radius-xl) 0 0 var(--radius-xl);
    padding: 4px 8px;
  }

  :deep(.el-input__inner) {
    font-size: var(--font-size-lg);
    height: 48px;
  }

  :deep(.el-input-group__append) {
    background: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: white;
    border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
    padding: 0 24px;
    border-left: none;
  }
}

.quick-filters {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.quick-filter-tag {
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
  }
}

// 主体内容区域
.search-content {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

// 左侧边栏
.search-sidebar {
  width: 300px;
  flex-shrink: 0;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  height: fit-content;
  position: sticky;
  top: var(--spacing-xl);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  box-sizing: border-box;
  max-width: 100%;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border-light);
    border-radius: var(--radius-sm);
  }
}

.sidebar-section {
  margin-bottom: var(--spacing-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;

  .el-button {
    margin-left: auto;
  }
}

.empty-views {
  padding: var(--spacing-md) 0;
  text-align: center;
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.filter-views-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-view-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-regular);

  &:hover,
  &.active {
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  .view-name {
    flex: 1;
    font-size: var(--font-size-sm);
  }

  .view-delete {
    opacity: 0;
    color: var(--color-text-placeholder);
    transition: opacity var(--transition-fast);

    &:hover {
      color: var(--color-danger);
    }
  }

  &:hover .view-delete {
    opacity: 1;
  }
}

// 右侧结果区域
.search-main {
  flex: 1;
  min-width: 0;
}

.results-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.results-info {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.results-keyword {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.results-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.results-hint {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.toolbar-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: nowrap;
}

// 已激活筛选标签
.active-filters-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
}

.filters-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

// 搜索结果
.search-loading {
  padding: var(--spacing-xl) 0;
}

.empty-icon {
  color: var(--color-text-placeholder);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.result-group {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.group-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: normal;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .results-grid & {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--spacing-md);
  }
}

// 分页
.search-pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
}

// 响应式
@media (max-width: 768px) {
  .search-content {
    flex-direction: column-reverse;
    padding: var(--spacing-md);
  }

  .search-sidebar {
    width: 100%;
    position: static;
    max-height: none;
    overflow-y: visible;
  }

  .results-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .toolbar-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
