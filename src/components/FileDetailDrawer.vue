<template>
  <el-drawer
    :model-value="modelValue"
    title="文件基础信息"
    size="420px"
    @close="emit('update:modelValue', false)"
  >
    <PageState
      :loading="loading"
      :error="Boolean(errorMessage)"
      :error-description="errorMessage"
      :empty="!loading && !errorMessage && !detail"
      empty-description="没有可展示的文件信息"
      min-height="100%"
      @retry="loadDetail"
    >
      <div v-if="detail" class="drawer-content">
        <div class="title-block">
          <FileTypeIcon :type="detail.type" />
          <div class="title-info">
            <div class="file-name">{{ detail.fileName }}</div>
            <div class="file-meta">{{ fileTypeLabel }}</div>
          </div>
        </div>

        <div class="action-row">
          <el-button type="primary" plain @click="openFolder">
            打开所在目录
          </el-button>
          <el-button v-if="detail.downloadable" plain @click="downloadFile">
            下载
          </el-button>
          <el-button v-if="detail.playable" plain @click="playVideo">
            播放视频
          </el-button>
          <el-button v-if="detail.downloadable" plain :loading="verifying" @click="verifyIntegrity">
            校验完整性
          </el-button>
        </div>

        <el-alert
          v-if="verifyMessage"
          :title="verifyMessage"
          :type="verifyType"
          show-icon
          :closable="false"
        />

        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="文件名">{{ detail.fileName }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ fileTypeLabel }}</el-descriptions-item>
          <el-descriptions-item label="文件扩展名">{{ detail.extension || '-' }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ fileSize }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ updateTime }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ createTime }}</el-descriptions-item>
          <el-descriptions-item label="所在目录">{{ detail.folderPath || '-' }}</el-descriptions-item>
          <el-descriptions-item label="资源标识">{{ detail.resourceId || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </PageState>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { downloadFileUrl, getFile, verifyFileMd5 } from '@/apis/file'
import PageState from '@/components/PageState.vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import { formatFileDate, getFileTypeLabel, resolveErrorMessage } from '@/utils/file'
import { formatSize } from '@/utils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fileId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()

const loading = ref(false)
const detail = ref(null)
const errorMessage = ref('')
const verifying = ref(false)
const verifyResult = ref(null)

const fileTypeLabel = computed(() => getFileTypeLabel(detail.value?.type))
const fileSize = computed(() => {
  if (!detail.value || detail.value.type === 'folder') {
    return '-'
  }
  if (detail.value.size === null || detail.value.size === undefined) {
    return '-'
  }
  return formatSize(detail.value.size, 2)
})
const updateTime = computed(() => formatFileDate(detail.value?.updateTime))
const createTime = computed(() => formatFileDate(detail.value?.createTime))
const verifyMessage = computed(() => {
  if (!verifyResult.value) {
    return ''
  }
  if (verifyResult.value.valid === true) {
    return '文件完整性校验通过'
  }
  if (verifyResult.value.valid === false) {
    return verifyResult.value.error || '文件完整性校验失败'
  }
  return verifyResult.value.message || '当前文件暂无可校验的 MD5 信息'
})
const verifyType = computed(() => {
  if (!verifyResult.value) {
    return 'info'
  }
  if (verifyResult.value.valid === true) {
    return 'success'
  }
  if (verifyResult.value.valid === false) {
    return 'error'
  }
  return 'warning'
})

const loadDetail = async () => {
  if (!props.modelValue || !props.fileId) {
    detail.value = null
    errorMessage.value = ''
    verifyResult.value = null
    return
  }
  loading.value = true
  errorMessage.value = ''
  verifyResult.value = null
  try {
    const response = await getFile(props.fileId)
    detail.value = response.data
  } catch (error) {
    detail.value = null
    errorMessage.value = resolveErrorMessage(error, '文件信息加载失败')
  } finally {
    loading.value = false
  }
}

const openFolder = () => {
  if (!detail.value) {
    return
  }
  const targetId = detail.value.type === 'folder' ? detail.value.id : detail.value.parentId
  emit('update:modelValue', false)
  router.push(`/folder/${targetId}`)
}

const playVideo = () => {
  if (!detail.value?.id) {
    return
  }
  emit('update:modelValue', false)
  router.push(`/video/${detail.value.id}`)
}

const downloadFile = () => {
  if (!detail.value?.id) {
    return
  }
  const link = document.createElement('a')
  link.href = downloadFileUrl(detail.value.id)
  link.click()
}

const verifyIntegrity = async () => {
  if (!detail.value?.id) {
    return
  }
  verifying.value = true
  try {
    const response = await verifyFileMd5(detail.value.id)
    verifyResult.value = response.data
    if (response.data.valid === true) {
      ElMessage.success('文件完整性校验通过')
    } else if (response.data.valid === false) {
      ElMessage.error(response.data.error || '文件完整性校验失败')
    } else {
      ElMessage.warning(response.data.message || '当前文件暂无可校验信息')
    }
  } catch (error) {
    ElMessage.error(resolveErrorMessage(error, '文件完整性校验失败'))
  } finally {
    verifying.value = false
  }
}

watch([() => props.modelValue, () => props.fileId], loadDetail, { immediate: true })
</script>

<style lang="scss" scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa, #eef4ff);
  border-radius: 12px;
}

.title-info {
  min-width: 0;
}

.file-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}

.file-meta {
  margin-top: 6px;
  color: #606266;
  font-size: 13px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-descriptions {
  :deep(.el-descriptions__label) {
    width: 110px;
  }
}
</style>
