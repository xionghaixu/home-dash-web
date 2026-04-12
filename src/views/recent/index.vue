<template>
  <div class="workspace-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">最近上传</h2>
        <p class="page-subtitle">集中查看最近进入系统的文件，快速跳转、下载或播放。</p>
      </div>
      <div class="page-actions">
        <el-button plain :icon="RefreshRight" :loading="loading" @click="loadRecentFiles">
          刷新
        </el-button>
      </div>
    </div>

    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && fileList.length === 0"
      empty-description="最近还没有上传记录。"
      min-height="420px"
      @retry="loadRecentFiles"
    >
      <div class="table-card">
        <el-table :data="fileList" row-key="id" height="100%">
          <el-table-column prop="fileName" label="文件名" min-width="320">
            <template #default="{ row }">
              <div class="name-cell">
                <FileTypeIcon :type="row.type" />
                <el-button link class="name-button" @click="openRow(row)">
                  {{ row.fileName }}
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="140">
            <template #default="{ row }">{{ formatFileSize(row) }}</template>
          </el-table-column>
          <el-table-column label="上传时间" min-width="180">
            <template #default="{ row }">{{ formatFileDate(row.createTime) }}</template>
          </el-table-column>
          <el-table-column label="所在目录" min-width="150">
            <template #default="{ row }">
              <el-button link @click="goToFolder(row.parentId)">打开目录</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="220" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button link @click="showDetail(row)">详情</el-button>
                <el-button link @click="goToFolder(row.parentId)">所在目录</el-button>
                <el-button v-if="row.type === 'video'" link @click="openVideo(row.id)">播放</el-button>
                <el-button v-else link @click="downloadFile(row.id)">下载</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </PageState>

    <FileDetailDrawer v-model="detailVisible" :file-id="detailFileId" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadFileUrl, getRecentFiles } from '@/apis/file'
import FileDetailDrawer from '@/components/FileDetailDrawer.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import PageState from '@/components/PageState.vue'
import { formatFileDate, formatFileSize, resolveErrorMessage } from '@/utils/file'

const router = useRouter()

const fileList = ref([])
const loading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const detailFileId = ref(null)

const loadRecentFiles = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getRecentFiles(20)
    fileList.value = response.data || []
  } catch (error) {
    fileList.value = []
    errorMessage.value = resolveErrorMessage(error, '最近上传列表加载失败')
  } finally {
    loading.value = false
  }
}

const goToFolder = (folderId) => {
  router.push(`/folder/${folderId}`)
}

const openVideo = (fileId) => {
  const routeLocation = router.resolve(`/video/${fileId}`)
  window.open(routeLocation.href, '_blank')
}

const openRow = (row) => {
  if (row.type === 'video') {
    openVideo(row.id)
    return
  }
  showDetail(row)
}

const showDetail = (row) => {
  detailFileId.value = row.id
  detailVisible.value = true
}

const downloadFile = (fileId) => {
  const link = document.createElement('a')
  link.href = downloadFileUrl(fileId)
  link.click()
  ElMessage.success('下载任务已开始')
}

onMounted(() => {
  loadRecentFiles()
})
</script>

<style lang="scss" scoped>
.workspace-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.page-header,
.table-card {
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

.table-card {
  height: calc(100vh - 240px);
  min-height: 420px;
  padding: 8px 0;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.name-button {
  min-width: 0;
  justify-content: flex-start;
  white-space: normal;
  word-break: break-all;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-card {
    height: auto;
    min-height: 360px;
  }
}
</style>
