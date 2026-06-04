<template>
  <div class="workspace-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">
          {{ isSearching ? '搜索结果' : currentFolderName || '全部文件' }}
        </h1>
        <p class="page-header__subtitle">{{ pageSubtitle }}</p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" :icon="Upload" @click="uploadFileTrigger">上传文件</el-button>
        <el-button plain :icon="FolderAdd" @click="createFolder">新建文件夹</el-button>
      </div>
    </div>

    <div v-if="isRootWorkspace" v-loading="summaryLoading" class="workspace-overview-card">
      <div class="workspace-overview__header compact">
        <div>
          <div class="workspace-overview__title">全部文件工作台</div>
          <div class="workspace-overview__subtitle">
            根目录用于统一浏览；最近上传是跨目录时间视图，点击卡片即可切换。
          </div>
        </div>
        <el-button
          v-if="isRecentView"
          type="primary"
          plain
          size="small"
          @click="setRootView('all')"
        >
          返回根目录视图
        </el-button>
      </div>

      <el-alert
        v-if="summaryErrorMessage"
        type="warning"
        :closable="false"
        show-icon
        :title="summaryErrorMessage"
        class="workspace-overview__alert"
      />

      <template v-else>
        <div class="summary-grid compact">
          <button
            v-for="card in summaryCards"
            :key="card.key"
            type="button"
            class="summary-card summary-card--action"
            :class="{ active: isRecentView && activeRecentFilter === card.key }"
            @click="openRecentRange(card.key)"
          >
            <div class="summary-label">{{ card.label }}</div>
            <div class="summary-value">{{ card.count }}</div>
            <div class="summary-meta">{{ card.meta }}</div>
          </button>
        </div>

        <div class="workspace-overview__footer compact">
          <div class="workspace-overview__hint">{{ workspaceHint }}</div>
          <div class="recent-filter-group">
            <el-tag
              v-for="filter in recentFilterOptions"
              :key="filter.key"
              :type="activeRecentFilter === filter.key ? 'primary' : 'info'"
              effect="light"
              class="recent-filter-tag"
              @click="setRecentFilter(filter.key)"
            >
              {{ filter.label }}
            </el-tag>
          </div>
        </div>
      </template>
    </div>

    <!-- Toolbar -->
    <div class="toolbar-card">
      <div class="toolbar-info">
        <el-breadcrumb v-if="!isRecentView" class="toolbar-breadcrumb" separator=">">
          <el-breadcrumb-item>
            <el-button link @click="goFileRoot">全部文件</el-button>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="item.id">
            <el-button v-if="index < breadcrumbList.length - 1" link @click="goToFolder(item.id)">
              {{ item.fileName }}
            </el-button>
            <span v-else class="current-folder">{{ item.fileName }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div v-else class="recent-view-indicator">
          <span class="recent-view-indicator__title">最近上传</span>
          <span class="recent-view-indicator__meta">{{ recentViewLabel }}</span>
          <el-button link size="small" @click="setRootView('all')">切换到根目录文件</el-button>
        </div>
        <el-button
          v-if="breadcrumbList.length > 1 && !isRecentView"
          link
          :icon="Back"
          class="back-btn"
          @click="goBack"
        >
          返回上级
        </el-button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="item-count">共 {{ pagination.total }} 项</div>

      <div class="toolbar-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          @clear="clearSearch"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Batch Toolbar -->
    <div v-if="selection.length > 0" class="batch-toolbar">
      <div class="batch-info">
        <span class="batch-count">已选择 {{ selection.length }} 项</span>
        <el-button link class="clear-btn" @click="clearSelection">清除选择</el-button>
      </div>
      <div class="batch-divider"></div>
      <div class="batch-actions">
        <el-button :icon="Download" @click="batchDownload">下载</el-button>
        <el-button :icon="Delete" @click="batchDelete">删除</el-button>
        <el-button :icon="Edit" @click="batchMove">移动</el-button>
      </div>
    </div>

    <!-- File Table -->
    <div class="table-card">
      <PageState
        :loading="loading"
        :error="Boolean(errorMessage)"
        :error-description="errorMessage"
        :empty="!loading && !errorMessage && currentTableData.length === 0"
        :empty-description="currentEmptyDescription"
        min-height="400px"
        @retry="renderFileList"
      >
        <el-table
          :data="displayedFileList"
          style="width: 100%"
          :row-class-name="getRowClassName"
          @selection-change="handleSelectionChange"
          @row-contextmenu="handleRowContextMenu"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="40" />

          <el-table-column label="名称" min-width="280">
            <template #default="{ row }">
              <div
                class="name-cell"
                draggable="true"
                :class="{
                  'drag-hover': dragOverFolderId === String(row.id) && row.type === 'folder'
                }"
                @dragstart="handleDragStart($event, row)"
                @dragover="handleDragOver($event, row)"
                @dragleave="handleDragLeave($event, row)"
                @drop="handleDrop($event, row)"
                @dragend="handleDragEnd"
              >
                <FileTypeIcon :type="row.type" />
                <el-button
                  link
                  class="name-button"
                  :class="{ 'folder-draggable': row.type === 'folder' }"
                  @click.stop="openRow(row)"
                >
                  {{ row.fileName }}
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="大小" width="120">
            <template #default="{ row }">
              <span v-if="row.type === 'folder'" class="size-display">
                {{ row.folderSize !== undefined ? formatFileSize({ size: row.folderSize }) : '-' }}
              </span>
              <span v-else class="size-display">{{ formatFileSize(row) }}</span>
            </template>
          </el-table-column>

          <el-table-column v-if="isRecentView" label="所在目录" width="120">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="openRecentFolder(row)">
                打开目录
              </el-button>
            </template>
          </el-table-column>

          <el-table-column :label="isRecentView ? '上传时间' : '修改时间'" width="160">
            <template #default="{ row }">
              <span class="size-display">
                {{ formatFileDate(isRecentView ? row.createTime : row.updateTime) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button
                  v-if="row.type !== 'folder'"
                  link
                  :icon="Download"
                  @click.stop="downloadFile(row)"
                >
                  下载
                </el-button>
                <el-button link :icon="Edit" @click.stop="renameFile(row)">重命名</el-button>
                <el-dropdown
                  trigger="click"
                  @command="cmd => handleMoreAction(cmd, row)"
                  @click.stop
                >
                  <el-button link class="more-btn" aria-label="更多操作" @click.stop>
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">
                        <el-icon><InfoFilled /></el-icon>
                        详情
                      </el-dropdown-item>
                      <el-dropdown-item command="move">
                        <el-icon><Rank /></el-icon>
                        移动
                      </el-dropdown-item>
                      <el-dropdown-item command="copy">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item divided command="delete" class="danger">
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </PageState>
    </div>

    <!-- Pagination -->
    <div class="pagination-card">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenuVisible" class="context-menu-overlay" @click="closeContextMenu"></div>
    <div
      v-if="contextMenuVisible"
      ref="contextMenuRef"
      class="context-menu"
      role="menu"
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
      @keydown.escape="closeContextMenu"
      @keydown.up.prevent="focusPrevMenuItem"
      @keydown.down.prevent="focusNextMenuItem"
      @keydown.tab.exact.prevent="focusNextMenuItem"
      @keydown.shift.tab.exact.prevent="focusPrevMenuItem"
    >
      <button class="context-menu-item" role="menuitem" @click="handleContextAction('open')">
        <el-icon><FolderOpened /></el-icon>
        <span>打开</span>
      </button>
      <button class="context-menu-item" role="menuitem" @click="handleContextAction('download')">
        <el-icon><Download /></el-icon>
        <span>下载</span>
      </button>
      <button class="context-menu-item" role="menuitem" @click="handleContextAction('rename')">
        <el-icon><Edit /></el-icon>
        <span>重命名</span>
      </button>
      <button class="context-menu-item" role="menuitem" @click="handleContextAction('move')">
        <el-icon><Rank /></el-icon>
        <span>移动</span>
      </button>
      <div class="context-menu-divider"></div>
      <button
        class="context-menu-item danger"
        role="menuitem"
        @click="handleContextAction('delete')"
      >
        <el-icon><Delete /></el-icon>
        <span>删除</span>
      </button>
    </div>

    <!-- Dialogs -->
    <FolderTreeDialog v-if="folderTreeVisible" v-bind="folderTreeProps" @return="dealReturn" />
    <FileDetailDrawer
      v-model="detailVisible"
      :file-id="detailFileId"
      @preview="handleDrawerPreview"
      @play-audio="handlePlayAudio"
    />

    <!-- Image Preview -->
    <ImagePreview
      v-model="imagePreviewVisible"
      :file-list="previewImages"
      :initial-index="previewImageIndex"
    />

    <!-- Text Preview Dialog -->
    <el-dialog
      v-model="textPreviewVisible"
      :title="previewFileName || '文本预览'"
      width="800px"
      destroy-on-close
    >
      <PageState
        :loading="textPreviewLoading"
        :error="Boolean(textPreviewError)"
        :error-description="textPreviewError"
        :empty="!textPreviewLoading && !textPreviewError && !textPreviewContent"
        min-height="300px"
        @retry="loadTextPreview"
      >
        <TextPreview
          v-if="textPreviewContent"
          :content="textPreviewContent"
          :file-name="previewFileName"
        />
      </PageState>
    </el-dialog>

    <!-- Audio Player Bar -->
    <AudioPlayerBar
      v-if="audioPlayerVisible"
      :file-id="audioFileId"
      :file-name="audioFileName"
      @close="audioPlayerVisible = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Back,
  Delete,
  Download,
  Edit,
  FolderAdd,
  Search,
  Upload,
  InfoFilled,
  Rank,
  CopyDocument,
  FolderOpened
} from '@element-plus/icons-vue'
import { getFileRoute, getVideoRoute } from '@/router'
import {
  createFile,
  deleteFiles as deleteFilesApi,
  downloadFileUrl,
  getFileList,
  getRecentUploadSummary,
  moveOrCopyFiles,
  renameFile as renameFileApi,
  searchFiles,
  getTextPreview
} from '@/apis/file'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import FolderTreeDialog from '@/components/FolderTreeDialog.vue'
import PageState from '@/components/PageState.vue'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import TextPreview from '@/components/preview/TextPreview.vue'
import AudioPlayerBar from '@/components/preview/AudioPlayerBar.vue'
import { formatSize } from '@/utils'
import { formatFileDate, formatFileSize, resolveErrorMessage } from '@/utils/file'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const currentFolderId = computed(() => {
  const id = route.params.folderId
  return id !== undefined ? String(id) : '0'
})

const isRootFolderId = folderId => String(folderId ?? '0') === '0'

const toApiFolderId = folderId => (isRootFolderId(folderId) ? 0 : String(folderId))

const currentFolderName = computed(() => {
  if (breadcrumbList.value.length > 0) {
    return breadcrumbList.value[breadcrumbList.value.length - 1].fileName
  }
  return ''
})

const folderTreeVisible = ref(false)
const folderTreeProps = ref({ type: 'move', title: '提示', sourceFiles: [] })
const fileList = ref([])
const breadcrumbList = ref([])
const loading = ref(false)
const errorMessage = ref('')
const selection = ref([])
const detailVisible = ref(false)
const detailFileId = ref(null)
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})
const searchKeyword = ref('')
const isSearching = ref(false)
const recentSummary = ref({})
const summaryLoading = ref(false)
const summaryErrorMessage = ref('')
const requestId = ref(0)

// Previews
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

const isRootWorkspace = computed(() => !isSearching.value && isRootFolderId(currentFolderId.value))
const isRecentView = computed(() => isRootWorkspace.value && route.query.view === 'recent')
const activeRecentFilter = computed(() => {
  const range = route.query.range
  return ['today', 'week', 'month'].includes(range) ? range : 'recent'
})

const recentFilterOptions = [
  { key: 'recent', label: '最近上传' },
  { key: 'today', label: '今日上传' },
  { key: 'week', label: '本周上传' },
  { key: 'month', label: '本月上传' }
]

const recentFiles = computed(() => {
  const files = Array.isArray(recentSummary.value.recentFiles)
    ? recentSummary.value.recentFiles
    : []
  return files.map(normalizeFileItem)
})

const filteredRecentFiles = computed(() => {
  if (!isRecentView.value) {
    return recentFiles.value
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  return recentFiles.value.filter(file => {
    const createTime = file.createTime ? new Date(file.createTime).getTime() : 0
    switch (activeRecentFilter.value) {
      case 'today':
        return createTime >= todayStart
      case 'week':
        return createTime >= weekStart.getTime()
      case 'month':
        return createTime >= monthStart
      default:
        return true
    }
  })
})

const currentTableData = computed(() =>
  isRecentView.value ? filteredRecentFiles.value : fileList.value
)

const pageSubtitle = computed(() => {
  if (isSearching.value) {
    return `找到 ${currentTableData.value.length} 个结果`
  }
  if (isRecentView.value) {
    return '查看跨目录的最近上传记录，并可直接定位到实际目录。'
  }
  if (isRootWorkspace.value) {
    return '全部文件页作为工作台入口，集中查看总览、最近上传和根目录内容。'
  }
  return '管理和浏览您的文件'
})

const summaryCards = computed(() => [
  {
    key: 'today',
    label: '今日上传',
    count: recentSummary.value.todayCount || 0,
    meta: formatSize(recentSummary.value.todaySize || 0)
  },
  {
    key: 'week',
    label: '本周上传',
    count: recentSummary.value.weekCount || 0,
    meta: formatSize(recentSummary.value.weekSize || 0)
  },
  {
    key: 'month',
    label: '本月上传',
    count: recentSummary.value.monthCount || 0,
    meta: formatSize(recentSummary.value.monthSize || 0)
  },
  {
    key: 'recent',
    label: '最近上传',
    count: recentSummary.value.totalCount || 0,
    meta: isRecentView.value ? '当前正在浏览最近上传' : '点击查看跨目录上传记录'
  }
])

const recentViewLabel = computed(() => {
  const currentFilter = recentFilterOptions.find(item => item.key === activeRecentFilter.value)
  return currentFilter ? currentFilter.label : '全部最近上传'
})

const workspaceHint = computed(() => {
  if (isRecentView.value) {
    return `当前表格展示 ${recentViewLabel.value} 的跨目录上传记录。`
  }
  return '默认显示根目录文件；点击上方卡片进入对应上传时间视图。'
})

const currentEmptyDescription = computed(() => {
  if (isRecentView.value) {
    return '当前筛选范围内暂无最近上传记录。'
  }
  return '暂无文件，上传您的第一个文件吧'
})

const normalizeFileItem = item => {
  if (!item || typeof item !== 'object') {
    return item
  }

  const normalizedId = item.id ?? item.fileId
  const normalizedType = typeof item.type === 'string' ? item.type.toLowerCase() : item.type

  return {
    ...item,
    id: normalizedId !== undefined && normalizedId !== null ? String(normalizedId) : normalizedId,
    fileId:
      item.fileId !== undefined && item.fileId !== null
        ? String(item.fileId)
        : normalizedId !== undefined && normalizedId !== null
          ? String(normalizedId)
          : normalizedId,
    type: normalizedType,
    favorite: item.favorite ?? item.isFavorite ?? false,
    updateTime: item.updateTime ?? item.createTime ?? null,
    folderPath: item.folderPath ?? item.parentPath ?? null,
    parentId:
      item.parentId !== undefined && item.parentId !== null ? String(item.parentId) : item.parentId,
    resourceId:
      item.resourceId !== undefined && item.resourceId !== null
        ? String(item.resourceId)
        : item.resourceId
  }
}

const normalizeBreadcrumbs = paths => {
  if (!Array.isArray(paths)) {
    return []
  }
  return paths.map(item => ({
    ...item,
    id:
      item.id !== undefined && item.id !== null
        ? String(item.id)
        : item.fileId !== undefined && item.fileId !== null
          ? String(item.fileId)
          : (item.id ?? item.fileId)
  }))
}

const loadRecentSummary = async () => {
  if (!isRootWorkspace.value) {
    recentSummary.value = {}
    summaryErrorMessage.value = ''
    return
  }

  summaryLoading.value = true
  summaryErrorMessage.value = ''

  try {
    const response = await getRecentUploadSummary(30)
    recentSummary.value = {
      ...(response.data || {}),
      recentFiles: Array.isArray(response.data?.recentFiles) ? response.data.recentFiles : []
    }
  } catch (error) {
    recentSummary.value = {}
    summaryErrorMessage.value = resolveErrorMessage(error, '上传概览加载失败')
  } finally {
    summaryLoading.value = false
  }
}

const displayedFileList = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return currentTableData.value.slice(start, end)
})

// Context menu
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuRow = ref(null)
const contextMenuRef = ref(null)

const focusFirstMenuItem = () => {
  setTimeout(() => {
    if (contextMenuRef.value) {
      const firstItem = contextMenuRef.value.querySelector('.context-menu-item')
      if (firstItem) firstItem.focus()
    }
  })
}

const focusNextMenuItem = () => {
  if (!contextMenuRef.value) return
  const items = Array.from(contextMenuRef.value.querySelectorAll('.context-menu-item'))
  const currentIndex = items.indexOf(document.activeElement)
  const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
  items[nextIndex]?.focus()
}

const focusPrevMenuItem = () => {
  if (!contextMenuRef.value) return
  const items = Array.from(contextMenuRef.value.querySelectorAll('.context-menu-item'))
  const currentIndex = items.indexOf(document.activeElement)
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
  items[prevIndex]?.focus()
}

const handleRowContextMenu = (row, column, event) => {
  event.preventDefault()
  contextMenuRow.value = row
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
  focusFirstMenuItem()
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuRow.value = null
}

const handleContextAction = action => {
  const row = contextMenuRow.value
  if (!row) return

  switch (action) {
    case 'open':
      openRow(row)
      break
    case 'download':
      downloadFile(row)
      break
    case 'rename':
      renameFile(row)
      break
    case 'move':
      moveFile(row)
      break
    case 'delete':
      deleteFile(row)
      break
  }
  closeContextMenu()
}

const handleRowClick = row => {
  if (row.type === 'folder') {
    router.push(getFileRoute(row.id))
  } else {
    openRow(row)
  }
}

const getRowClassName = ({ row }) => {
  if (route.query.highlightId && String(row.id) === String(route.query.highlightId)) {
    return 'highlight-row'
  }
  return ''
}

const uploadFileTrigger = () => {
  window.eventBus.emit('openUploader')
}

const createFolder = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: value => {
        if (!value || !value.trim()) {
          return '文件夹名称不能为空'
        }
        return true
      }
    })
    if (value) {
      await createFile({
        fileName: value.trim(),
        type: 'folder',
        parentId: toApiFolderId(currentFolderId.value)
      })
      ElMessage.success('文件夹创建成功')
      renderFileList()
    }
  } catch {
    // User cancelled
  }
}

const renderFileList = async () => {
  const currentRequestId = ++requestId.value
  loading.value = true
  errorMessage.value = ''
  try {
    if (isSearching.value && searchKeyword.value.trim()) {
      const response = await searchFiles(searchKeyword.value.trim())
      if (currentRequestId !== requestId.value) return
      fileList.value = Array.isArray(response.data) ? response.data.map(normalizeFileItem) : []
      breadcrumbList.value = []
    } else {
      const response = await getFileList(toApiFolderId(currentFolderId.value))
      if (currentRequestId !== requestId.value) return
      fileList.value = Array.isArray(response.data) ? response.data.map(normalizeFileItem) : []
      breadcrumbList.value = normalizeBreadcrumbs(response.extra)
    }

    await loadRecentSummary()
    if (currentRequestId !== requestId.value) return
    store.fetchStorageInfo()
    selection.value = []
    syncPaginationState()
  } catch (error) {
    if (currentRequestId !== requestId.value) return
    fileList.value = []
    breadcrumbList.value = []
    selection.value = []
    syncPaginationState()
    errorMessage.value = resolveErrorMessage(error, '加载失败')
  } finally {
    if (currentRequestId === requestId.value) {
      loading.value = false
    }
  }
}

const syncPaginationState = () => {
  pagination.value.total = currentTableData.value.length
  pagination.value.totalPages = Math.max(
    1,
    Math.ceil(currentTableData.value.length / pagination.value.pageSize)
  )
  if (pagination.value.page > pagination.value.totalPages) {
    pagination.value.page = 1
  }
  pagination.value.hasNext = pagination.value.page < pagination.value.totalPages
  pagination.value.hasPrev = pagination.value.page > 1
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    isSearching.value = true
    renderFileList()
  } else {
    clearSearch()
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  renderFileList()
}

const handlePageChange = page => {
  pagination.value.page = page
}

const handlePageSizeChange = pageSize => {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  syncPaginationState()
}

// Drag and Drop implementation
const draggedItem = ref(null)
const dragOverFolderId = ref(null)

const handleDragStart = (event, row) => {
  draggedItem.value = row
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(row.id))
}

const handleDragOver = (event, row) => {
  if (!draggedItem.value) return
  // Cannot drag onto itself
  if (String(draggedItem.value.id) === String(row.id)) return
  // Can only drop onto folder
  if (row.type !== 'folder') return

  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverFolderId.value = String(row.id)
}

const handleDragLeave = (event, row) => {
  if (dragOverFolderId.value === String(row.id)) {
    dragOverFolderId.value = null
  }
}

const handleDrop = async (event, row) => {
  event.preventDefault()
  dragOverFolderId.value = null

  if (!draggedItem.value) return
  const sourceId = draggedItem.value.id
  const targetId = row.id

  if (String(sourceId) === String(targetId)) return
  if (row.type !== 'folder') return

  try {
    loading.value = true
    await moveOrCopyFiles([sourceId], [targetId], 'move')
    ElMessage.success(`成功移动 "${draggedItem.value.fileName}" 到 "${row.fileName}"`)
    await renderFileList()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '移动失败'))
  } finally {
    loading.value = false
    draggedItem.value = null
  }
}

const handleDragEnd = () => {
  draggedItem.value = null
  dragOverFolderId.value = null
}

const handleSelectionChange = val => {
  selection.value = val
}

const clearSelection = () => {
  selection.value = []
}

const goFileRoot = () => {
  router.push('/files')
}

const goToFolder = folderId => {
  router.push(getFileRoute(folderId))
}

const goBack = () => {
  if (breadcrumbList.value.length > 1) {
    const parentFolder = breadcrumbList.value[breadcrumbList.value.length - 2]
    router.push(getFileRoute(parentFolder.id))
  } else {
    goFileRoot()
  }
}

const openVideo = fileId => {
  const routeLocation = router.resolve(getVideoRoute(fileId))
  window.open(routeLocation.href, '_blank')
}

const openRow = row => {
  if (row.type === 'folder') {
    router.push(getFileRoute(row.id))
    return
  }
  if (row.type === 'video') {
    openVideo(row.id)
    return
  }
  if (row.type === 'picture') {
    handlePreview(row)
    return
  }
  if (row.type === 'audio') {
    handlePlay(row)
    return
  }
  if (row.type === 'txt' || row.type === 'text') {
    handlePreview(row)
    return
  }
}

const downloadFile = row => {
  if (row.type === 'folder') {
    ElMessage.warning('文件夹暂不支持下载')
    return
  }
  window.open(downloadFileUrl(row.id), '_blank')
}

const batchDownload = () => {
  selection.value.forEach(file => {
    if (file.type !== 'folder') {
      window.open(downloadFileUrl(file.id), '_blank')
    }
  })
}

const renameFile = async row => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: row.fileName,
      inputValidator: value => {
        if (!value || !value.trim()) {
          return '名称不能为空'
        }
        return true
      }
    })
    if (value && value.trim() !== row.fileName) {
      await renameFileApi(row.id, value.trim())
      ElMessage.success('重命名成功')
      renderFileList()
    }
  } catch {
    // User cancelled
  }
}

const deleteFile = async row => {
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteFilesApi([row.id])
    ElMessage.success('删除成功')
    renderFileList()
  } catch {
    // User cancelled
  }
}

const batchDelete = async () => {
  if (selection.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selection.value.length} 个文件吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const ids = selection.value.map(file => file.id)
    await deleteFilesApi(ids)
    ElMessage.success('批量删除成功')
    selection.value = []
    renderFileList()
  } catch {
    // User cancelled
  }
}

const moveFile = row => {
  folderTreeProps.value = { type: 'move', title: '移动文件', sourceFiles: [row] }
  folderTreeVisible.value = true
}

const batchMove = () => {
  if (selection.value.length === 0) return
  folderTreeProps.value = { type: 'move', title: '批量移动', sourceFiles: selection.value }
  folderTreeVisible.value = true
}

const handleMoreAction = (command, row) => {
  switch (command) {
    case 'detail':
      showDetail(row)
      break
    case 'move':
      moveFile(row)
      break
    case 'copy':
      copyFile(row)
      break
    case 'delete':
      deleteFile(row)
      break
  }
}

const copyFile = async row => {
  folderTreeProps.value = { type: 'copy', title: '复制文件', sourceFiles: [row] }
  folderTreeVisible.value = true
}

const showDetail = row => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const handlePreview = file => {
  if (file.type === 'picture') {
    const images = currentTableData.value.filter(f => f.type === 'picture')
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
    openVideo(file.id)
  } else if (file.type === 'audio') {
    audioFileId.value = file.resourceId || file.id
    audioFileName.value = file.fileName
    audioPlayerVisible.value = true
  }
}

const handleDrawerPreview = payload => {
  if (payload.type === 'image') {
    handlePreview(payload.file)
  } else {
    handlePreview(payload.file)
  }
}

const handlePlayAudio = payload => {
  handlePlay(payload.file)
}

const loadTextPreview = async () => {
  if (!previewFileId.value) return
  textPreviewLoading.value = true
  textPreviewError.value = ''
  textPreviewContent.value = ''
  try {
    const response = await getTextPreview(previewFileId.value)
    textPreviewContent.value = response.data?.content || ''
  } catch {
    textPreviewError.value = '文本预览加载失败'
  } finally {
    textPreviewLoading.value = false
  }
}

const openRecentFolder = file => {
  router.push(getFileRoute(file.parentId ?? 0))
}

const setRootView = mode => {
  const query = { ...route.query }
  if (mode === 'recent') {
    query.view = 'recent'
    if (!query.range) {
      query.range = 'recent'
    }
  } else {
    delete query.view
    delete query.range
  }
  pagination.value.page = 1
  router.replace({ path: '/files', query })
}

const setRecentFilter = filter => {
  pagination.value.page = 1
  if (filter === 'recent') {
    router.replace({
      path: '/files',
      query: {
        ...route.query,
        view: 'recent',
        range: 'recent'
      }
    })
    return
  }
  router.replace({
    path: '/files',
    query: {
      ...route.query,
      view: 'recent',
      range: filter
    }
  })
}

const openRecentRange = range => {
  setRecentFilter(range)
}

const dealReturn = async result => {
  folderTreeVisible.value = false
  if (!result || result.type !== 'submit') {
    return
  }

  if (result.conflicts && result.conflicts.length > 0) {
    ElMessage.error('目标文件夹存在同名文件，无法进行移动/复制')
    return
  }

  const fileIds = (folderTreeProps.value.sourceFiles || []).map(file => file.id).filter(Boolean)
  const targetIds = Array.isArray(result.value)
    ? result.value.filter(id => id !== undefined && id !== null)
    : []
  const operationType = folderTreeProps.value.type || 'move'

  if (fileIds.length === 0 || targetIds.length === 0) {
    return
  }

  try {
    await moveOrCopyFiles(fileIds, targetIds, operationType)
    ElMessage.success(operationType === 'copy' ? '复制成功' : '移动成功')
    selection.value = []
    await renderFileList()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, operationType === 'copy' ? '复制失败' : '移动失败'))
  }
}

watch(
  () => currentFolderId.value,
  () => {
    store.setFolderId(currentFolderId.value)
    pagination.value.page = 1
    searchKeyword.value = ''
    isSearching.value = false
    renderFileList()
  },
  { immediate: true }
)

watch(
  () => [route.query.view, route.query.range],
  () => {
    pagination.value.page = 1
    syncPaginationState()
  }
)

onMounted(() => {
  window.eventBus.on('flushFileList', renderFileList)
})

onUnmounted(() => {
  window.eventBus.off('flushFileList', renderFileList)
})
</script>

<style lang="scss" scoped>
.workspace-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-height: 100%;
  height: auto;
  padding-bottom: 96px;
  box-sizing: border-box;
  animation: fadeInUp 0.3s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  &__subtitle {
    margin: var(--spacing-sm) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    flex-shrink: 0;
  }
}

.workspace-overview-card {
  padding: var(--spacing-xl);
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.workspace-overview__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.workspace-overview__header.compact {
  margin-bottom: var(--spacing-sm);
}

.workspace-overview__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.workspace-overview__subtitle {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.workspace-overview__alert {
  margin-bottom: var(--spacing-md);
}

.workspace-mode-switch {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-lg);
}

.summary-grid.compact {
  gap: var(--spacing-md);
}

.summary-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-lighter);
}

.summary-card {
  padding: var(--spacing-lg);
}

.summary-card--action {
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary-light);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }
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

.workspace-overview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  flex-wrap: wrap;
}

.workspace-overview__footer.compact {
  margin-top: var(--spacing-sm);
}

.recent-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.recent-filter-tag {
  cursor: pointer;
}

.workspace-overview__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.recent-view-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.recent-view-indicator__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.recent-view-indicator__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.toolbar-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.toolbar-breadcrumb {
  :deep(.el-breadcrumb__item) {
    float: none;
  }
}

.current-folder {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.back-btn {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.toolbar-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border);
}

.item-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.toolbar-search {
  margin-left: auto;
}

.search-input {
  width: 240px;
}

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-lg);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.batch-count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.clear-btn {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
}

.batch-divider {
  width: 1px;
  height: 16px;
  background: var(--color-primary);
  opacity: 0.3;
}

.batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.table-card {
  display: flex;
  flex-direction: column;
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  min-height: 400px;
  flex-shrink: 0;

  :deep(.el-table) {
    width: 100%;
  }
}

.pagination-card {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0 calc(var(--spacing-xl) + 12px);
  flex-shrink: 0;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  border: 1px dashed transparent;
  border-radius: var(--radius-sm);
  padding: 4px;
  transition: all var(--transition-fast);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &.drag-hover {
    background: var(--color-primary-bg) !important;
    border-color: var(--color-primary) !important;
    transform: scale(1.02);
  }
}

.name-button {
  min-width: 0;
  justify-content: flex-start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.folder-draggable {
    cursor: pointer;
  }
}

.row-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 2px;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
}

.context-menu {
  position: fixed;
  min-width: 160px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xs) 0;
  z-index: 3001;
  animation: contextMenuFadeIn 0.15s ease;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: none;
  border: none;
  width: 100%;
  text-align: left;

  .el-icon {
    font-size: 15px;
    color: var(--color-text-secondary);
  }

  &:hover,
  &:focus-visible {
    background: var(--color-fill-base);
    color: var(--color-primary);

    .el-icon {
      color: var(--color-primary);
    }
  }

  &.danger {
    color: var(--color-danger);

    .el-icon {
      color: var(--color-danger);
    }

    &:hover,
    &:focus-visible {
      background: var(--color-danger-light);
    }
  }
}

.context-menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-xs) 0;
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-overview__header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-divider {
    display: none;
  }

  .batch-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .batch-divider {
    width: 100%;
    height: 1px;
  }
}

@media (max-width: 640px) {
  .workspace-page {
    padding-bottom: 120px;
  }

  .page-header__actions {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-xs);
  }

  .page-header__actions .el-button {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

:deep(.el-table__row.highlight-row) {
  animation: flashHighlight 2s ease-out;
}

@keyframes flashHighlight {
  0% {
    background-color: var(--color-primary-bg);
  }
  50% {
    background-color: var(--color-primary-bg);
  }
  100% {
    background-color: transparent;
  }
}
</style>
