<template>
  <div class="workspace-page">
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">全部文件</h1>
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
          <el-breadcrumb-item v-for="nav in navigation" :key="nav.id">
            <el-button link @click="goToFolder(nav.id)">{{ nav.fileName }}</el-button>
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
      </div>
    </div>

    <div v-if="selection.length > 0" class="batch-toolbar">
      <div class="batch-info">
        <span class="batch-count">已选择 {{ selection.length }} 项</span>
      </div>
      <div class="batch-actions">
        <el-button plain :icon="Edit" :disabled="!canRename" @click="renameFile(selection[0])">
          重命名
        </el-button>
        <el-button plain :icon="Download" :disabled="!canDownloadSelected" @click="downloadFiles(selection)">
          下载
        </el-button>
        <el-button plain :icon="Delete" :disabled="selection.length === 0" @click="deleteFiles(selection)">
          删除
        </el-button>
        <el-button plain :disabled="selection.length === 0" @click="moveTo(selection)">移动</el-button>
        <el-button plain :disabled="selection.length === 0" @click="copyTo(selection)">复制</el-button>
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
      <div class="table-card">
        <el-table
          :data="fileList"
          row-key="id"
          style="flex:1"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="52" />
          <el-table-column prop="fileName" label="文件名" min-width="320" sortable="custom">
            <template #default="{ row }">
              <div class="name-cell">
                <FileTypeIcon :type="row.type" />
                <el-button link class="name-button" @click="openRow(row)">
                  {{ row.fileName }}
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="140" sortable="custom">
            <template #default="{ row }">{{ formatFileSize(row) }}</template>
          </el-table-column>
          <el-table-column prop="updateTime" label="修改时间" min-width="180" sortable="custom">
            <template #default="{ row }">{{ formatFileDate(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="240" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button link @click="showDetail(row)">详情</el-button>
                <el-button link @click="openRow(row)">
                  {{ row.type === 'folder' ? '打开' : row.type === 'video' ? '播放' : '查看' }}
                </el-button>
                <el-dropdown v-if="row.type !== 'folder'">
                  <el-button link class="more-btn">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="downloadFiles([row])">下载</el-dropdown-item>
                      <el-dropdown-item @click="moveTo([row])">移动</el-dropdown-item>
                      <el-dropdown-item @click="copyTo([row])">复制</el-dropdown-item>
                      <el-dropdown-item @click="renameFile(row)">重命名</el-dropdown-item>
                      <el-dropdown-item divided @click="deleteFiles([row])">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-dropdown v-else>
                  <el-button link class="more-btn">
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
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

    <FolderTreeDialog v-if="folderTreeVisible" v-bind="folderTreeProps" @return="dealReturn" />
    <FileDetailDrawer v-model="detailVisible" :file-id="detailFileId" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Back,
  Delete,
  Download,
  Edit,
  FolderAdd,
  RefreshRight,
  Upload
} from '@element-plus/icons-vue'
import {
  createFile,
  deleteFiles as deleteFilesApi,
  downloadFileUrl,
  getFileList,
  moveOrCopyFiles,
  renameFile as renameFileApi
} from '@/apis/file'
import FolderTreeDialog from '@/components/FolderTreeDialog.vue'
import PageState from '@/components/PageState.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import { formatFileDate, formatFileSize, resolveErrorMessage } from '@/utils/file'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  folderId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const store = useAppStore()

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

const selectionSummary = computed(() => {
  if (selection.value.length === 0) {
    return '未选择文件'
  }
  return `已选 ${selection.value.length} 项`
})

const canRename = computed(() => selection.value.length === 1)
const canDownloadSelected = computed(
  () => selection.value.length > 0 && selection.value.every(item => item.type !== 'folder')
)

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
    const response = await getFileList(props.folderId, sortState.value)
    fileList.value = response.data || []
    navigation.value = response.extra || []
  } catch (error) {
    fileList.value = []
    navigation.value = []
    errorMessage.value = resolveErrorMessage(error, '文件列表加载失败')
  } finally {
    loading.value = false
  }
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
        await createFile(Number(props.folderId), value, 'folder')
        ElMessage.success('文件夹创建成功')
        renderFileList()
      } catch (error) {
        handleErrorMessage(error, '文件夹创建失败')
      }
    })
    .catch(() => {})
}

const renameFile = (row) => {
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

const deleteFiles = (rows) => {
  if (!rows.length) {
    return
  }
  const ids = rows.map(item => item.id)
  ElMessageBox.confirm('删除后不可恢复，确认继续吗？', '删除文件', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteFilesApi(ids)
        ElMessage.success('文件删除成功')
        renderFileList()
      } catch (error) {
        handleErrorMessage(error, '文件删除失败')
      }
    })
    .catch(() => {})
}

const moveTo = (rows) => {
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

const copyTo = (rows) => {
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

const dealReturn = async (payload) => {
  if (payload.type === 'cancel') {
    folderTreeVisible.value = false
    return
  }

  const targetIds = payload.value || []
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
    ElMessage.success(folderTreeProps.value.type === 'move' ? '文件移动成功' : '文件复制成功')
    folderTreeVisible.value = false
    renderFileList()
  } catch (error) {
    handleErrorMessage(error, folderTreeProps.value.type === 'move' ? '文件移动失败' : '文件复制失败')
  }
}

const handleSelectionChange = (rows) => {
  selection.value = rows
}

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    sortBy: prop || 'fileName',
    sortOrder: order === 'descending' ? 'desc' : 'asc'
  }
  renderFileList()
}

const showDetail = (row) => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const goToFolder = (folderId) => {
  router.push(`/folder/${folderId}`)
}

const openVideo = (fileId) => {
  const routeLocation = router.resolve(`/video/${fileId}`)
  window.open(routeLocation.href, '_blank')
}

const openRow = (row) => {
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

  rows.forEach((item, index) => {
    window.setTimeout(() => {
      const link = document.createElement('a')
      link.href = downloadFileUrl(item.id)
      link.click()
    }, index * 300)
  })
}

const handleFlush = () => {
  renderFileList()
}

watch(
  () => props.folderId,
  (folderId) => {
    store.setFolderId(Number(folderId))
    renderFileList()
  },
  { immediate: true }
)

onMounted(() => {
  window.eventBus.on('flushFileList', handleFlush)
})

onUnmounted(() => {
  window.eventBus.off('flushFileList', handleFlush)
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

.toolbar-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.toolbar-breadcrumb {
  :deep(.el-breadcrumb__item) {
    float: none;
  }
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

.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.batch-count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
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

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-divider {
    display: none;
  }
}
</style>
