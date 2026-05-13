<template>
  <el-drawer
    :model-value="modelValue"
    title="文件详情"
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
          <div class="favorite-btn">
            <FavoriteButton
              v-model:favorite="detail.favorite"
              :file-id="detail.resourceId || detail.id"
              @change="handleFavoriteChange"
            />
          </div>
        </div>

        <div class="action-row">
          <el-button type="primary" plain @click="openFolder">打开所在目录</el-button>
          <el-button v-if="detail.downloadable" plain @click="downloadFile">下载</el-button>
          <el-button v-if="detail.playable" plain @click="handlePlayVideo">播放视频</el-button>
          <el-button v-if="detail.previewable" plain @click="handlePreview">预览</el-button>
          <el-button v-if="detail.downloadable" plain :loading="verifying" @click="verifyIntegrity">
            校验
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
          <el-descriptions-item label="文件扩展名">
            {{ detail.extension || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ fileSize }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ updateTime }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ createTime }}</el-descriptions-item>
          <el-descriptions-item label="所在目录">
            {{ detail.folderPath || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="资源标识">
            {{ detail.resourceId || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="section">
          <div class="section-header">
            <span class="section-title">标签</span>
            <el-button type="primary" link size="small" @click="showTagManager = true">
              <el-icon><Plus /></el-icon>
              管理
            </el-button>
          </div>
          <div class="tags-container">
            <el-tag
              v-for="tag in tags"
              :key="tag.id"
              closable
              size="default"
              @close="handleRemoveTag(tag.id)"
            >
              {{ tag.name }}
            </el-tag>
            <span v-if="tags.length === 0" class="empty-text">暂无标签</span>
          </div>
        </div>

        <RemarkEditor
          v-model:remark="detail.remark"
          :file-id="detail.resourceId || detail.id"
          @change="handleRemarkChange"
        />
      </div>
    </PageState>

    <TagManager v-model="showTagManager" :file-id="detail?.resourceId || detail?.id" @change="handleTagsChange" />
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getFileRoute, getVideoRoute } from '@/router'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, StarFilled, Plus, Edit } from '@element-plus/icons-vue'
import FavoriteButton from '@/components/common/FavoriteButton.vue'
import TagManager from '@/components/detail/TagManager.vue'
import RemarkEditor from '@/components/detail/RemarkEditor.vue'
import {
  downloadFileUrl,
  getFile,
  getSearchFileDetail,
  verifyFileMd5,
  getFileTags,
  removeFileTag,
  getFileFavorite
} from '@/apis/file'
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

const emit = defineEmits(['update:modelValue', 'preview', 'playAudio'])

const router = useRouter()

const loading = ref(false)
const detail = ref(null)
const errorMessage = ref('')
const verifying = ref(false)
const verifyResult = ref(null)
const tags = ref([])
const showTagManager = ref(false)

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
    tags.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''
  verifyResult.value = null

  try {
    const [fileResponse, tagsResponse] = await Promise.all([
      getSearchFileDetail(props.fileId).catch(() => getFile(props.fileId)),
      getFileTags(props.fileId).catch(() => ({ data: [] })),
    ])

    const rawDetail = fileResponse.data || {}
    detail.value = {
      ...rawDetail,
      id: rawDetail.fileId ?? rawDetail.id,
      favorite: rawDetail.isFavorite ?? rawDetail.favorite ?? false,
      folderPath: rawDetail.folderPath ?? rawDetail.parentPath,
      createTime: rawDetail.createTime ?? rawDetail.updateTime
    }

    if (detail.value.resourceId) {
      const favoriteResponse = await getFileFavorite(detail.value.resourceId).catch(() => ({ data: false }))
      detail.value.favorite = Boolean(favoriteResponse.data)
    }

    tags.value = tagsResponse.data || []
  } catch (error) {
    detail.value = null
    errorMessage.value = resolveErrorMessage(error, '文件信息加载失败')
  } finally {
    loading.value = false
  }
}

watch(
  [() => props.modelValue, () => props.fileId],
  () => {
    loadDetail()
  },
  { immediate: true }
)

const openFolder = () => {
  if (!detail.value) {
    return
  }
  const targetId = detail.value.type === 'folder' ? detail.value.id : detail.value.parentId
  emit('update:modelValue', false)
  router.push(getFileRoute(targetId))
}

const handlePlayVideo = () => {
  if (!detail.value?.id) {
    return
  }
  emit('update:modelValue', false)
  router.push(getVideoRoute(detail.value.id))
}

const handlePreview = () => {
  if (!detail.value) return

  if (detail.value.type === 'picture') {
    emit('preview', { type: 'image', file: detail.value })
  } else if (detail.value.type === 'audio') {
    emit('playAudio', { type: 'audio', file: detail.value })
  } else if (detail.value.type === 'txt' || detail.value.type === 'text') {
    emit('preview', { type: 'text', file: detail.value })
  }
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

const handleFavoriteChange = val => {
  detail.value.favorite = val
}

const handleTagsChange = newTags => {
  tags.value = newTags || []
}

const handleRemarkChange = val => {
  detail.value.remark = val
}

const handleRemoveTag = async tagId => {
  if (!detail.value?.id) return

  try {
    await removeFileTag(detail.value.resourceId || detail.value.id, tagId)
    tags.value = tags.value.filter(t => t.id !== tagId)
    ElMessage.success('标签已移除')
  } catch {
    ElMessage.error('移除失败')
  }
}
</script>

<style lang="scss" scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.title-block {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-fill-base), var(--color-primary-bg));
  border-radius: var(--radius-lg);
}

.title-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  word-break: break-all;
}

.file-meta {
  margin-top: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.favorite-btn {
  flex-shrink: 0;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.detail-descriptions {
  :deep(.el-descriptions__label) {
    width: 110px;
  }
}

.section {
  border-top: 1px solid var(--color-border-lighter);
  padding-top: var(--spacing-lg);
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.remark-content {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
