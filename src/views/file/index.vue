<template>
  <div class="workspace-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">文件列表</h1>
        <p class="page-header__subtitle">在当前目录中完成上传、整理、下载和批量操作。</p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" :icon="Upload" @click="uploadFileTrigger">上传文件</el-button>
        <el-button plain :icon="FolderAdd" @click="createFolder">新建文件夹</el-button>
        <el-button plain :icon="RefreshRight" :loading="loading" @click="renderFileList">
          刷新
        </el-button>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="toolbar-info">
        <span class="toolbar-label">当前位置</span>
        <el-breadcrumb separator="/" class="toolbar-breadcrumb">
          <el-breadcrumb-item
            v-for="(nav, index) in navigation"
            :key="nav.id"
            class="breadcrumb-item"
          >
            <el-tooltip
              :content="nav.fileName"
              placement="top"
              :disabled="nav.fileName.length <= 15"
            >
              <el-button
                link
                :class="{ 'current-folder': index === navigation.length - 1 }"
                @click="goToFolder(nav.id)"
              >
                {{
                  nav.fileName.length > 15 ? nav.fileName.substring(0, 15) + '...' : nav.fileName
                }}
              </el-button>
            </el-tooltip>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <el-button
          v-if="navigation.length > 1"
          link
          :icon="Back"
          class="back-btn"
          @click="goToFolder(navigation[navigation.length - 2].id)"
        >
          返回上级
        </el-button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-info">
        <span class="item-count">{{ fileList.length }} 项</span>
        <span v-if="pagination.total !== undefined" class="item-count">
          共 {{ pagination.total }} 项
        </span>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索当前目录文件..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          @clear="clearSearch"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div v-if="selection.length > 0" class="batch-toolbar">
      <div class="batch-info">
        <span class="batch-count">已选择 {{ selection.length }} 项</span>
        <el-button link type="primary" class="clear-btn" @click="clearSelection">
          清空选择
        </el-button>
      </div>
      <div class="batch-divider"></div>
      <div class="batch-actions">
        <el-button
          plain
          :icon="Download"
          :disabled="!canDownloadSelected"
          :title="
            !canDownloadSelected && selection.some(item => item.type === 'folder')
              ? '文件夹暂不支持直接下载'
              : '下载所选文件'
          "
          @click="downloadFiles(selection)"
        >
          下载
        </el-button>
        <el-button plain :disabled="selection.length === 0" @click="moveTo(selection)">
          移动
        </el-button>
        <el-button plain :disabled="selection.length === 0" @click="copyTo(selection)">
          复制
        </el-button>
        <el-button
          plain
          :icon="Edit"
          :disabled="selection.length !== 1"
          :title="selection.length !== 1 ? '请选择一项进行重命名' : ''"
          @click="renameFile(selection[0])"
        >
          重命名
        </el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          :disabled="selection.length === 0"
          @click="deleteFiles(selection)"
        >
          删除
        </el-button>
      </div>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && fileList.length === 0"
      empty-description="当前目录暂无文件，可以先上传文件或新建文件夹。"
      min-height="420px"
      @retry="renderFileList"
    >
      <div class="table-card" @contextmenu.prevent="handleTableContextMenu">
        <el-table
          :data="fileList"
          row-key="id"
          style="flex: 1"
          highlight-current-row
          :row-class-name="getRowClassName"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          @row-contextmenu="handleRowContextMenu"
          @row-dblclick="openRow"
        >
          <el-table-column type="selection" width="52" />
          <el-table-column prop="fileName" label="文件名" min-width="320" sortable="custom">
            <template #default="{ row }">
              <div class="name-cell">
                <FileTypeIcon :type="row.type" />
                <el-button
                  link
                  class="name-button"
                  :class="{ 'folder-draggable': row.type === 'folder' }"
                  draggable="true"
                  @click="openRow(row)"
                  @dragstart="handleFolderDragStart($event, row)"
                  @dragend="handleFolderDragEnd"
                  @dragover.prevent="handleDragOver($event, row)"
                  @dragenter.prevent="handleDragEnter($event, row)"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleFolderDrop($event, row)"
                >
                  {{ row.fileName }}
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="140" sortable="custom">
            <template #default="{ row }">
              <span v-if="row.type === 'folder'" class="size-display">
                {{
                  row.folderSize !== undefined && row.folderSize !== null
                    ? formatFileSize({ size: row.folderSize })
                    : '--'
                }}
              </span>
              <span v-else class="size-display">{{ formatFileSize(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="修改时间" min-width="180" sortable="custom">
            <template #default="{ row }">{{ formatFileDate(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="180" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button link @click="showDetail(row)">详情</el-button>
                <el-dropdown>
                  <el-button link class="more-btn">
                    操作
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="row.type !== 'folder'" @click="downloadFiles([row])">
                        下载
                      </el-dropdown-item>
                      <el-dropdown-item @click="moveTo([row])">移动</el-dropdown-item>
                      <el-dropdown-item @click="copyTo([row])">复制</el-dropdown-item>
                      <el-dropdown-item @click="renameFile(row)">重命名</el-dropdown-item>
                      <el-dropdown-item divided @click="deleteFiles([row])">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </PageState>

    <div v-if="pagination.totalPages > 1" class="pagination-card">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <FolderTreeDialog v-if="folderTreeVisible" v-bind="folderTreeProps" @return="dealReturn" />
    <FileDetailDrawer v-model="detailVisible" :file-id="detailFileId" />

    <teleport to="body">
      <div
        v-if="contextMenuVisible"
        class="context-menu-overlay"
        @click="closeContextMenu"
        @contextmenu.prevent="closeContextMenu"
      >
        <div
          class="context-menu"
          :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
          @click.stop
        >
          <div
            v-if="contextMenuRow?.type !== 'folder'"
            class="context-menu-item"
            @click="contextMenuAction('download')"
          >
            <el-icon><Download /></el-icon>
            <span>下载</span>
          </div>
          <div class="context-menu-item" @click="contextMenuAction('move')">
            <el-icon><DArrowRight /></el-icon>
            <span>移动</span>
          </div>
          <div class="context-menu-item" @click="contextMenuAction('copy')">
            <el-icon><CopyDocument /></el-icon>
            <span>复制</span>
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" @click="contextMenuAction('rename')">
            <el-icon><Edit /></el-icon>
            <span>重命名</span>
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item danger" @click="contextMenuAction('delete')">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Back,
  Delete,
  Download,
  Edit,
  FolderAdd,
  RefreshRight,
  Search,
  Upload,
  DArrowRight,
  CopyDocument
} from '@element-plus/icons-vue'
import { getFileRoute, getVideoRoute } from '@/router'
import {
  createFile,
  deleteFiles as deleteFilesApi,
  downloadFileUrl,
  getFileListPaginated,
  moveOrCopyFiles,
  renameFile as renameFileApi,
  searchFiles
} from '@/apis/file'
import FolderTreeDialog from '@/components/FolderTreeDialog.vue'
import PageState from '@/components/PageState.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import { formatFileDate, formatFileSize, resolveErrorMessage } from '@/utils/file'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const currentFolderId = computed(() => {
  const id = route.params.folderId
  return id !== undefined ? Number(id) : '0'
})

const folderTreeVisible = ref(false)
const folderTreeProps = ref({
  type: 'move',
  title: '提示',
  sourceFiles: []
})
const fileList = ref([])
const navigation = ref([])
const selection = ref([])
const loading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const detailFileId = ref(null)
const sortState = ref({
  sortBy: 'fileName',
  sortOrder: 'asc'
})
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuRow = ref(null)
const dragSourceFolder = ref(null)
const dragTargetFolder = ref(null)
const dragOverFolderId = ref(null)
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

const canDownloadSelected = computed(
  () => selection.value.length > 0 && selection.value.every(item => item.type !== 'folder')
)

const handleKeyDown = event => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

  switch (event.key) {
    case 'Escape':
      if (selection.value.length > 0) {
        clearSelection()
      }
      break
    case 'Delete':
    case 'Backspace':
      if (selection.value.length > 0) {
        deleteFiles(selection.value)
      }
      break
    case 'F2':
      if (selection.value.length === 1) {
        renameFile(selection.value[0])
      }
      break
    case 'Enter':
      if (selection.value.length === 1) {
        openRow(selection.value[0])
      }
      break
    case 'a':
    case 'A':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const table = document.querySelector('.el-table')
        if (table) {
          const checkbox = table.querySelector('.el-table__header-wrapper .el-checkbox')
          if (checkbox) {
            checkbox.click()
          }
        }
      }
      break
  }
}

const handleErrorMessage = (error, fallback) => {
  ElMessage.error(resolveErrorMessage(error, fallback))
}

const uploadFileTrigger = () => {
  window.eventBus.emit('openUploader')
}

const renderFileList = async () => {
  loading.value = true
  errorMessage.value = ''
  selection.value = []
  try {
    if (isSearching.value && searchKeyword.value.trim()) {
      const response = await searchFiles(searchKeyword.value.trim(), {
        ...sortState.value,
        parentId: currentFolderId.value
      })
      fileList.value = response.data || []
      navigation.value = response.extra?.paths || []
      pagination.value.total = fileList.value.length
      pagination.value.totalPages = 1
      pagination.value.hasNext = false
      pagination.value.hasPrev = false
    } else {
      const response = await getFileListPaginated(currentFolderId.value, {
        ...sortState.value,
        page: pagination.value.page,
        pageSize: pagination.value.pageSize
      })
      fileList.value = response.data || []
      navigation.value = response.extra?.paths || []
      pagination.value.total = response.extra?.total || 0
      pagination.value.totalPages = response.extra?.totalPages || 0
      pagination.value.hasNext = response.extra?.hasNext || false
      pagination.value.hasPrev = response.extra?.hasPrev || false
    }
  } catch (error) {
    fileList.value = []
    navigation.value = []
    errorMessage.value = resolveErrorMessage(error, '文件列表加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    isSearching.value = true
    pagination.value.page = 1
    renderFileList()
  } else {
    clearSearch()
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  pagination.value.page = 1
  renderFileList()
}

const createFolder = () => {
  ElMessageBox.prompt('请输入文件夹名', '新增文件夹', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{1,100}$/,
    inputErrorMessage: '文件夹名长度必须小于100'
  })
    .then(async ({ value }) => {
      try {
        await createFile(Number(currentFolderId.value), value, 'folder')
        ElMessage.success('文件夹创建成功')
        renderFileList()
      } catch (error) {
        handleErrorMessage(error, '文件夹创建失败')
      }
    })
    .catch(() => {})
}

const renameFile = row => {
  if (!row) {
    return
  }
  ElMessageBox.prompt('请输入新的文件名称', '重命名', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{1,100}$/,
    inputValue: row.fileName,
    inputErrorMessage: '文件名长度必须小于100'
  })
    .then(async ({ value }) => {
      try {
        await renameFileApi(row.id, value)
        ElMessage.success('文件重命名成功')
        renderFileList()
      } catch (error) {
        handleErrorMessage(error, '文件重命名失败')
      }
    })
    .catch(() => {})
}

const deleteFiles = rows => {
  if (!rows.length) {
    return
  }
  const ids = rows.map(item => item.id)
  const fileNames = rows.map(item => item.fileName).join('、')
  ElMessageBox.confirm(`确定要删除 ${rows.length} 个文件/文件夹吗？\n\n${fileNames}`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    distinguishCancelAndClose: true
  })
    .then(async () => {
      try {
        await deleteFilesApi(ids)
        ElMessage.success({
          message: `成功删除 ${rows.length} 个文件/文件夹`,
          duration: 2000
        })
        renderFileList()
      } catch (error) {
        handleErrorMessage(error, '文件删除失败')
      }
    })
    .catch(() => {})
}

const moveTo = rows => {
  if (!rows.length) {
    return
  }
  folderTreeProps.value = {
    type: 'move',
    title: '移动到',
    sourceFiles: rows
  }
  nextTick(() => {
    folderTreeVisible.value = true
  })
}

const copyTo = rows => {
  if (!rows.length) {
    return
  }
  folderTreeProps.value = {
    type: 'copy',
    title: '复制到',
    sourceFiles: rows
  }
  nextTick(() => {
    folderTreeVisible.value = true
  })
}

const dealReturn = async payload => {
  if (payload.type === 'cancel') {
    folderTreeVisible.value = false
    return
  }

  const targetIds = payload.value || []
  const conflicts = payload.conflicts || []
  const sourceIds = folderTreeProps.value.sourceFiles.map(file => file.id)

  if (folderTreeProps.value.type === 'move' && targetIds.length !== 1) {
    ElMessage.error('移动操作必须选择一个目标文件夹')
    return
  }
  if (folderTreeProps.value.type === 'copy' && targetIds.length !== 1) {
    ElMessage.error('复制操作必须选择一个目标文件夹')
    return
  }

  try {
    await moveOrCopyFiles(sourceIds, targetIds, folderTreeProps.value.type)
    folderTreeVisible.value = false

    const actionType = folderTreeProps.value.type === 'move' ? '移动' : '复制'
    let successMessage = `成功${actionType} ${sourceIds.length} 个文件/文件夹`

    if (conflicts.length > 0) {
      successMessage += `，其中 ${conflicts.length} 个文件已自动重命名`
    }

    ElMessage.success({
      message: successMessage,
      duration: 3000
    })

    renderFileList()
  } catch (error) {
    handleErrorMessage(
      error,
      folderTreeProps.value.type === 'move' ? '文件移动失败' : '文件复制失败'
    )
  }
}

const handleSelectionChange = rows => {
  selection.value = rows
}

const clearSelection = () => {
  selection.value = []
}

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    sortBy: prop || 'fileName',
    sortOrder: order === 'descending' ? 'desc' : 'asc'
  }
  pagination.value.page = 1
  renderFileList()
}

const handlePageChange = page => {
  pagination.value.page = page
  renderFileList()
}

const handlePageSizeChange = pageSize => {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  renderFileList()
}

const showDetail = row => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const goToFolder = folderId => {
  router.push(getFileRoute(folderId))
}

const openVideo = fileId => {
  const routeLocation = router.resolve(getVideoRoute(fileId))
  window.open(routeLocation.href, '_blank')
}

const openRow = row => {
  if (row.type === 'folder') {
    goToFolder(row.id)
    return
  }
  if (row.type === 'video') {
    openVideo(row.id)
    return
  }
  showDetail(row)
}

const downloadFiles = (rows = []) => {
  if (!rows.length) {
    return
  }
  if (rows.some(item => item.type === 'folder')) {
    ElMessage.warning('文件夹暂不支持直接下载')
    return
  }

  try {
    rows.forEach((item, index) => {
      window.setTimeout(() => {
        const link = document.createElement('a')
        link.href = downloadFileUrl(item.id)
        link.click()
      }, index * 300)
    })
  } catch (error) {
    handleErrorMessage(error, '下载失败')
  }
}

const handleRowContextMenu = (row, column, event) => {
  event.preventDefault()
  contextMenuRow.value = row
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
}

const handleTableContextMenu = event => {
  contextMenuRow.value = null
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = false
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuRow.value = null
}

const contextMenuAction = action => {
  if (!contextMenuRow.value) return

  closeContextMenu()

  switch (action) {
    case 'download':
      downloadFiles([contextMenuRow.value])
      break
    case 'move':
      moveTo([contextMenuRow.value])
      break
    case 'copy':
      copyTo([contextMenuRow.value])
      break
    case 'rename':
      renameFile(contextMenuRow.value)
      break
    case 'delete':
      deleteFiles([contextMenuRow.value])
      break
  }
}

const handleFolderDragStart = (event, row) => {
  if (row.type !== 'folder') return
  dragSourceFolder.value = row
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(row.id))
}

const handleFolderDragEnd = () => {
  dragSourceFolder.value = null
  dragTargetFolder.value = null
  dragOverFolderId.value = null
}

const handleDragOver = (event, row) => {
  if (row.type === 'folder' && dragSourceFolder.value && dragSourceFolder.value.id !== row.id) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragEnter = (event, row) => {
  if (row.type === 'folder') {
    dragOverFolderId.value = row.id
  }
}

const handleDragLeave = () => {
  dragOverFolderId.value = null
}

const handleFolderDrop = async (event, targetFolder) => {
  if (!dragSourceFolder.value || targetFolder.type !== 'folder') return
  if (dragSourceFolder.value.id === targetFolder.id) return

  dragTargetFolder.value = targetFolder

  try {
    await moveOrCopyFiles([dragSourceFolder.value.id], [targetFolder.id], 'move')
    ElMessage.success('文件夹已移动')
    await renderFileList()
  } catch (error) {
    handleErrorMessage(error, '移动文件夹失败')
  } finally {
    handleFolderDragEnd()
  }
}

const getRowClassName = ({ row }) => {
  if (dragOverFolderId.value === row.id && dragSourceFolder.value?.id !== row.id) {
    return 'drag-over-row'
  }
  return ''
}

watch(
  () => currentFolderId.value,
  folderId => {
    store.setFolderId(Number(folderId))
    pagination.value.page = 1
    searchKeyword.value = ''
    isSearching.value = false
    renderFileList()
  },
  { immediate: true }
)

onMounted(() => {
  window.eventBus.on('flushFileList', renderFileList)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.eventBus.off('flushFileList', renderFileList)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
.workspace-page {
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
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
}

.toolbar-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.size-display {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.toolbar-breadcrumb {
  :deep(.el-breadcrumb__item) {
    float: none;
  }
}

.breadcrumb-item {
  :deep(.el-button) {
    transition: all var(--transition-fast);

    &:hover {
      color: var(--color-primary);
    }
  }
}

.current-folder {
  color: var(--color-primary) !important;
  font-weight: var(--font-weight-semibold) !important;
}

.back-btn {
  margin-left: var(--spacing-sm);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border-lighter);
}

.item-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.toolbar-search {
  margin-left: auto;
}

.search-input {
  width: 280px;

  :deep(.el-input__wrapper) {
    border-radius: var(--radius-md);
  }
}

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary);
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
  height: 20px;
  background: var(--color-primary);
  opacity: 0.3;
}

.batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
  overflow: hidden;
  min-height: 400px;

  :deep(.el-table) {
    flex: 1;
  }
}

.pagination-card {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-lighter);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.name-button {
  min-width: 0;
  justify-content: flex-start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.folder-draggable {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

:deep(.el-table__row) {
  &.drag-over-row {
    background: var(--color-primary-bg);

    td {
      background: var(--color-primary-bg);
    }
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
  min-width: 180px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-lighter);
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
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);

  .el-icon {
    font-size: 16px;
    color: var(--color-text-secondary);
  }

  &:hover {
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

    &:hover {
      background: var(--color-danger-light);
    }
  }
}

.context-menu-divider {
  height: 1px;
  background: var(--color-border-lighter);
  margin: var(--spacing-xs) 0;
}

@media (max-width: 1280px) {
  .toolbar-card {
    gap: var(--spacing-md);
  }
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
    gap: var(--spacing-md);
  }

  .toolbar-divider {
    display: none;
  }

  .batch-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .batch-divider {
    width: 100%;
    height: 1px;
  }

  .batch-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .table-card {
    min-height: 300px;
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: var(--spacing-lg);
  }

  .toolbar-card {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .batch-toolbar {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .page-header__actions {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }

  .page-header__actions .el-button {
    width: 100%;
  }

  :deep(.el-table) {
    font-size: var(--font-size-xs);
  }

  :deep(.el-table__header th) {
    padding: 8px 4px;
  }

  :deep(.el-table__body td) {
    padding: 8px 4px;
  }

  .row-actions {
    flex-direction: column;
    gap: 2px;
  }

  .row-actions .el-button {
    padding: 2px 4px;
    font-size: var(--font-size-xs);
  }
}
</style>
