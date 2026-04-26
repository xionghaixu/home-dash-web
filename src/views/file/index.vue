<template>
  <div class="workspace-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">
          {{ isSearching ? '搜索结果' : (currentFolderName || '全部文件') }}
        </h1>
        <p class="page-header__subtitle">
          {{ isSearching ? `找到 ${fileList.length} 个结果` : '管理和浏览您的文件' }}
        </p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" :icon="Upload" @click="uploadFileTrigger">上传文件</el-button>
        <el-button plain :icon="FolderAdd" @click="createFolder">新建文件夹</el-button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar-card">
      <div class="toolbar-info">
        <el-breadcrumb class="toolbar-breadcrumb" separator=">">
          <el-breadcrumb-item>
            <el-button link @click="goHome">首页</el-button>
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbList"
            :key="item.id"
          >
            <el-button
              v-if="index < breadcrumbList.length - 1"
              link
              @click="goToFolder(item.id)"
            >
              {{ item.fileName }}
            </el-button>
            <span v-else class="current-folder">{{ item.fileName }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <el-button v-if="breadcrumbList.length > 0" link :icon="Back" class="back-btn" @click="goBack">
          返回上级
        </el-button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="item-count">
        共 {{ pagination.total }} 项
      </div>

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
        :empty="!loading && !errorMessage && fileList.length === 0"
        empty-description="暂无文件，上传您的第一个文件吧"
        min-height="400px"
        @retry="renderFileList"
      >
        <el-table
          :data="fileList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-contextmenu="handleRowContextMenu"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="40" />

          <el-table-column label="名称" min-width="280">
            <template #default="{ row }">
              <div class="name-cell">
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

          <el-table-column label="修改时间" width="160">
            <template #default="{ row }">
              <span class="size-display">{{ formatFileDate(row.updateTime) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button v-if="row.type !== 'folder'" link :icon="Download" @click.stop="downloadFile(row)">
                  下载
                </el-button>
                <el-button link :icon="Edit" @click.stop="renameFile(row)">重命名</el-button>
                <el-dropdown trigger="click" @command="cmd => handleMoreAction(cmd, row)">
                  <el-button link class="more-btn">
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">
                        <el-icon><InfoFilled /></el-icon>详情
                      </el-dropdown-item>
                      <el-dropdown-item command="move">
                        <el-icon><Rank /></el-icon>移动
                      </el-dropdown-item>
                      <el-dropdown-item command="copy">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item divided command="delete" class="danger">
                        <el-icon><Delete /></el-icon>删除
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
      class="context-menu"
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
    >
      <div class="context-menu-item" @click="handleContextAction('open')">
        <el-icon><FolderOpened /></el-icon>
        <span>打开</span>
      </div>
      <div class="context-menu-item" @click="handleContextAction('download')">
        <el-icon><Download /></el-icon>
        <span>下载</span>
      </div>
      <div class="context-menu-item" @click="handleContextAction('rename')">
        <el-icon><Edit /></el-icon>
        <span>重命名</span>
      </div>
      <div class="context-menu-item" @click="handleContextAction('move')">
        <el-icon><Rank /></el-icon>
        <span>移动</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item danger" @click="handleContextAction('delete')">
        <el-icon><Delete /></el-icon>
        <span>删除</span>
      </div>
    </div>

    <!-- Dialogs -->
    <FolderTreeDialog v-if="folderTreeVisible" v-bind="folderTreeProps" @return="dealReturn" />
    <FileDetailDrawer v-model="detailVisible" :file-id="detailFileId" />
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
  moveOrCopyFiles,
  renameFile as renameFileApi,
  searchFiles
} from '@/apis/file'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import FolderTreeDialog from '@/components/FolderTreeDialog.vue'
import PageState from '@/components/PageState.vue'
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

// Context menu
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuRow = ref(null)

const handleRowContextMenu = (row, column, event) => {
  event.preventDefault()
  contextMenuRow.value = row
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuRow.value = null
}

const handleContextAction = (action) => {
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

const handleRowClick = (row) => {
  if (row.type === 'folder') {
    router.push(getFileRoute(row.id))
  }
}

const uploadFileTrigger = () => {
  window.eventBus.emit('openUploader')
}

const createFolder = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '文件夹名称不能为空'
        }
        return true
      }
    })
    if (value) {
      await createFile({ fileName: value.trim(), type: 'folder', parentId: currentFolderId.value })
      ElMessage.success('文件夹创建成功')
      renderFileList()
    }
  } catch {
    // User cancelled
  }
}

const renderFileList = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    if (isSearching.value && searchKeyword.value.trim()) {
      const response = await searchFiles(searchKeyword.value.trim())
      fileList.value = response.data || []
      breadcrumbList.value = []
      pagination.value.total = fileList.value.length
      pagination.value.totalPages = 1
    } else {
      const response = await getFileList(currentFolderId.value)
      fileList.value = response.data || []
      breadcrumbList.value = response.breadcrumb || []
      pagination.value.total = response.total || fileList.value.length
      pagination.value.totalPages = response.totalPages || 1
      pagination.value.hasNext = response.hasNext || false
      pagination.value.hasPrev = response.hasPrev || false
    }
  } catch (error) {
    fileList.value = []
    breadcrumbList.value = []
    errorMessage.value = resolveErrorMessage(error, '加载失败')
  } finally {
    loading.value = false
  }
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
  renderFileList()
}

const handlePageSizeChange = pageSize => {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  renderFileList()
}

const handleSelectionChange = (val) => {
  selection.value = val
}

const clearSelection = () => {
  selection.value = []
}

const goHome = () => {
  router.push('/')
}

const goToFolder = (folderId) => {
  router.push(getFileRoute(folderId))
}

const goBack = () => {
  if (breadcrumbList.value.length > 1) {
    const parentFolder = breadcrumbList.value[breadcrumbList.value.length - 2]
    router.push(getFileRoute(parentFolder.id))
  } else {
    goHome()
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
  showDetail(row)
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
      inputValidator: (value) => {
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selection.value.length} 个文件吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
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
  try {
    await moveOrCopyFiles({ sourceIds: [row.id], targetId: currentFolderId.value, operation: 'copy' })
    ElMessage.success('复制成功')
    renderFileList()
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '复制失败'))
  }
}

const showDetail = row => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const dealReturn = async (result) => {
  folderTreeVisible.value = false
  if (result && result.success) {
    ElMessage.success(result.message || '操作成功')
    renderFileList()
  }
}

watch(
  () => currentFolderId.value,
  () => {
    store.setFolderId(Number(currentFolderId.value))
    pagination.value.page = 1
    searchKeyword.value = ''
    isSearching.value = false
    renderFileList()
  },
  { immediate: true }
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
  height: 100%;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  min-height: 400px;

  :deep(.el-table) {
    flex: 1;
  }
}

.pagination-card {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
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

  .el-icon {
    font-size: 15px;
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
}
</style>
