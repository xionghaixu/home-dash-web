<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-bar-wrapper">
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

      <div class="search-layout-toggle">
        <el-radio-group v-model="layoutMode" size="small">
          <el-radio-button value="list">列表</el-radio-button>
          <el-radio-button value="grid">网格</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="search-body">
      <div class="search-sidebar">
        <FilterViewSelector @select="handleFilterViewSelect" @save-custom="handleSaveCustomView" />

        <el-divider />

        <SearchHistory
          :history="searchState.history"
          @select="handleHistorySelect"
          @clear="handleClearHistory"
        />

        <el-divider />

        <HotSearchTags :tags="searchState.hotSearches" @select="handleHotTagSelect" />

        <el-divider />

        <div class="filter-view-section">
          <div class="section-header">
            <span class="section-title">已保存视图</span>
          </div>
          <div v-if="filterViews.length === 0" class="empty-views">
            <span>暂无保存的视图</span>
          </div>
          <div v-else class="filter-views-list">
            <div
              v-for="view in filterViews"
              :key="view.id"
              class="filter-view-item"
              @click="handleLoadFilterView(view)"
            >
              <span class="view-name">{{ view.name }}</span>
              <el-icon class="view-delete" @click.stop="handleDeleteFilterView(view.id)">
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="search-main">
        <div class="main-header">
          <div class="results-info">
            <span v-if="keyword">搜索 "{{ keyword }}"</span>
            <span v-if="searchState.total > 0">，找到 {{ searchState.total }} 个结果</span>
          </div>

          <div v-if="hasActiveFilters" class="filter-tags">
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
              v-if="filters.favorite !== null"
              closable
              size="small"
              @close="handleRemoveFavoriteFilter"
            >
              {{ filters.favorite ? '已收藏' : '未收藏' }}
            </el-tag>
            <el-button type="primary" link size="small" @click="handleClearAllFilters">
              清除全部
            </el-button>
          </div>

          <div class="sort-options">
            <el-select v-model="sortBy" size="small" @change="handleSortChange">
              <el-option value="name" label="名称" />
              <el-option value="size" label="大小" />
              <el-option value="updateTime" label="时间" />
            </el-select>
            <el-button size="small" @click="toggleSortOrder">
              {{ sortOrder === 'asc' ? '升序' : '降序' }}
            </el-button>
          </div>
        </div>

        <div class="filter-panel-toggle">
          <el-button @click="showFilterPanel = !showFilterPanel">
            <el-icon><Filter /></el-icon>
            筛选面板
            <el-badge v-if="hasActiveFilters" is-dot />
          </el-button>
        </div>

        <el-collapse-transition>
          <SearchFilterPanel
            v-if="showFilterPanel"
            v-model="filters"
            @change="handleFilterChange"
          />
        </el-collapse-transition>

        <BatchOperationsBar
          :selected-ids="selectedFiles"
          @clear-selection="selectedFiles = []"
          @batch-favorite="handleBatchFavorite"
          @batch-tag="handleBatchTag"
          @batch-delete="handleBatchDelete"
          @batch-move="handleBatchMove"
        />

        <div v-if="searchState.loading" class="search-loading">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <span>搜索中...</span>
        </div>

        <el-empty v-else-if="!keyword" description="请输入搜索关键字" />

        <el-empty
          v-else-if="searchState.results.length === 0 && !searchState.loading"
          description="未找到匹配的文件"
        />

        <div
          v-else
          :class="['search-results', layoutMode === 'grid' ? 'results-grid' : 'results-list']"
        >
          <div
            v-for="file in searchState.results"
            :key="file.id"
            :class="['result-item', { 'result-item--selected': selectedFiles.includes(file.id) }]"
            @click="handleFileClick(file)"
          >
            <div class="result-checkbox" @click.stop>
              <el-checkbox
                :model-value="selectedFiles.includes(file.id)"
                @change="handleFileSelect(file, $event)"
              />
            </div>

            <div class="result-icon">
              <FileTypeIcon :type="file.type" />
            </div>

            <div class="result-info">
              <div class="result-name" v-html="highlightKeyword(file.fileName)"></div>
              <div class="result-meta">
                <span>{{ formatSize(file.size) }}</span>
                <span>{{ formatFileDate(file.updateTime) }}</span>
                <span v-if="file.favorite" class="favorite-indicator">
                  <el-icon><Star /></el-icon>
                </span>
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
                v-else-if="file.type === 'picture'"
                type="primary"
                link
                @click.stop="previewImage(file)"
              >
                预览
              </el-button>
              <el-button
                v-else-if="file.type === 'txt' || file.type === 'text'"
                type="primary"
                link
                @click.stop="previewText(file)"
              >
                预览
              </el-button>
              <el-button
                v-else-if="file.type === 'audio'"
                type="primary"
                link
                @click.stop="previewAudio(file)"
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

        <div v-if="searchState.total > searchState.pageSize" class="search-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="searchState.pageSize"
            :total="searchState.total"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <FileDetailDrawer
      v-model="detailVisible"
      :file-id="detailFileId"
      @preview="handleDrawerPreview"
      @play-audio="handlePlayAudio"
    />

    <ImagePreview
      v-model="imagePreviewVisible"
      :file-list="previewImages"
      :initial-index="previewImageIndex"
    />

    <TextPreview
      v-model="textPreviewVisible"
      :file-id="previewFileId"
      :file-name="previewFileName"
    />

    <AudioPlayer v-model="audioPlayerVisible" :file-id="audioFileId" :file-name="audioFileName" />

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
import { Search, Loading, Filter, Delete, Star } from '@element-plus/icons-vue'
import FilterViewSelector from '@/components/search/FilterViewSelector.vue'
import BatchOperationsBar from '@/components/common/BatchOperationsBar.vue'
import {
  searchFiles,
  downloadFileUrl,
  getSearchHistory,
  clearSearchHistory,
  getHotSearchTerms,
  getFilterViews,
  saveFilterView,
  deleteFilterView
} from '@/apis/file'
import { getFileRoute, getVideoRoute } from '@/router'
import { formatSize } from '@/utils/index'
import { formatFileDate } from '@/utils/file'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import TextPreview from '@/components/preview/TextPreview.vue'
import AudioPlayer from '@/components/preview/AudioPlayer.vue'
import SearchFilterPanel from '@/components/search/SearchFilterPanel.vue'
import SearchHistory from '@/components/search/SearchHistory.vue'
import HotSearchTags from '@/components/search/HotSearchTags.vue'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const inputKeyword = ref('')
const layoutMode = ref('list')
const sortBy = ref('name')
const sortOrder = ref('asc')
const showFilterPanel = ref(false)
const detailVisible = ref(false)
const detailFileId = ref(null)
const imagePreviewVisible = ref(false)
const previewImages = ref([])
const previewImageIndex = ref(0)
const textPreviewVisible = ref(false)
const previewFileId = ref(null)
const previewFileName = ref('')
const audioPlayerVisible = ref(false)
const audioFileId = ref(null)
const audioFileName = ref('')
const selectedFiles = ref([])
const filterViews = ref([])
const showSaveFilterDialog = ref(false)
const newFilterViewName = ref('')

const filters = reactive({
  types: [],
  dateRange: null,
  sizeRange: null,
  folderId: null,
  favorite: null,
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

const hasActiveFilters = computed(() => {
  return (
    filters.types.length > 0 ||
    filters.dateRange !== null ||
    filters.sizeRange !== null ||
    filters.folderId !== null ||
    filters.favorite !== null ||
    filters.tags.length > 0
  )
})

const currentPage = computed({
  get: () => searchState.page,
  set: val => {
    searchState.page = val
  }
})

onMounted(() => {
  keyword.value = route.query.q || ''
  inputKeyword.value = keyword.value
  loadHistory()
  loadHotSearches()
  loadFilterViews()
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
    searchState.history = response.data || []
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
    filterViews.value = response.data || []
  } catch {
    filterViews.value = []
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

    const response = await searchFiles(keyword.value, params)
    searchState.results = response.data || []
    searchState.total = response.extra?.total || searchState.results.length
  } catch {
    ElMessage.error('搜索失败，请稍后重试')
    searchState.results = []
  } finally {
    searchState.loading = false
  }
}

const buildFilterParams = () => {
  const params = {}

  if (filters.types && filters.types.length > 0) {
    params.types = filters.types.join(',')
  }
  if (filters.dateRange && filters.dateRange.length === 2) {
    params.startDate = filters.dateRange[0]
    params.endDate = filters.dateRange[1]
  }
  if (filters.sizeRange) {
    params.sizeRange = filters.sizeRange
  }
  if (filters.folderId) {
    params.folderId = filters.folderId
  }
  if (filters.favorite !== null) {
    params.favorite = filters.favorite
  }
  if (filters.tags && filters.tags.length > 0) {
    params.tags = filters.tags.join(',')
  }

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

const handleHotTagSelect = tagKeyword => {
  inputKeyword.value = tagKeyword
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

const handleFilterChange = () => {
  searchState.page = 1
  doSearch()
}

const handleSortChange = () => {
  searchState.page = 1
  doSearch()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  handleSortChange()
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
  filters.favorite = null
  handleFilterChange()
}

const handleClearAllFilters = () => {
  filters.types = []
  filters.dateRange = null
  filters.sizeRange = null
  filters.folderId = null
  filters.favorite = null
  filters.tags = []
  handleFilterChange()
}

const handleFilterViewSelect = ({ filters: viewFilters }) => {
  Object.assign(filters, viewFilters)
  doSearch()
}

const handleSaveCustomView = async view => {
  try {
    await saveFilterView(view)
    ElMessage.success('自定义视图已保存')
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

const handleSaveFilterView = async () => {
  if (!newFilterViewName.value.trim()) {
    ElMessage.warning('请输入视图名称')
    return
  }

  try {
    await saveFilterView({
      name: newFilterViewName.value,
      filters: { ...filters }
    })
    ElMessage.success('视图保存成功')
    showSaveFilterDialog.value = false
    newFilterViewName.value = ''
    loadFilterViews()
  } catch {
    ElMessage.error('保存失败')
  }
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

const getTypeLabel = type => {
  const labels = {
    picture: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    compress: '压缩包',
    folder: '文件夹'
  }
  return labels[type] || type
}

const playVideo = file => {
  const routeLocation = router.resolve(getVideoRoute(file.id))
  window.open(routeLocation.href, '_blank')
}

const previewImage = file => {
  const images = searchState.results.filter(f => f.type === 'picture')
  const index = images.findIndex(f => f.id === file.id)
  previewImages.value = images
  previewImageIndex.value = index >= 0 ? index : 0
  imagePreviewVisible.value = true
}

const previewText = file => {
  previewFileId.value = file.id
  previewFileName.value = file.fileName
  textPreviewVisible.value = true
}

const previewAudio = file => {
  audioFileId.value = file.id
  audioFileName.value = file.fileName
  audioPlayerVisible.value = true
}

const showDetail = file => {
  detailFileId.value = file.id
  detailVisible.value = true
}

const handleDrawerPreview = payload => {
  if (payload.type === 'image') {
    previewImage(payload.file)
  } else if (payload.type === 'text') {
    previewText(payload.file)
  }
}

const handlePlayAudio = payload => {
  if (payload.type === 'audio') {
    previewAudio(payload.file)
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

const escapeHtml = str => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

.search-header {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.search-bar-wrapper {
  flex: 1;
  max-width: 600px;
}

.search-layout-toggle {
  flex-shrink: 0;
}

.search-body {
  display: flex;
  gap: var(--spacing-xl);
}

.search-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.search-main {
  flex: 1;
  min-width: 0;
}

.main-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.results-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.filter-tags {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  flex: 1;
}

.sort-options {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-panel-toggle {
  margin-bottom: var(--spacing-md);
}

.filter-view-section {
  padding: var(--spacing-md) 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.empty-views {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
  text-align: center;
  padding: var(--spacing-md) 0;
}

.filter-views-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-view-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-fill-base);

    .view-delete {
      opacity: 1;
    }
  }
}

.view-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
}

.view-delete {
  opacity: 0;
  color: var(--color-text-placeholder);
  transition: opacity var(--transition-fast);

  &:hover {
    color: var(--color-danger);
  }
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
  &.results-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  &.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }

  &--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  .results-grid & {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
  }
}

.result-checkbox {
  flex-shrink: 0;
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

  .results-grid & {
    width: 64px;
    height: 64px;
  }
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

  .results-grid & {
    text-align: center;
  }
}

.result-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);

  .results-grid & {
    justify-content: center;
  }
}

.favorite-indicator {
  color: var(--color-warning);
}

.result-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-sm);

  .results-grid & {
    margin-top: var(--spacing-sm);
  }
}

.search-pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.keyword-highlight {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-bg);
  padding: 0 2px;
  border-radius: 2px;
}
</style>
