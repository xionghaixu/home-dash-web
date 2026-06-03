<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="fit-content"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="image-preview-dialog"
    @closed="handleClosed"
  >
    <div class="preview-container">
      <div v-if="hasPrev" class="preview-nav">
        <el-button :icon="ArrowLeft" circle class="nav-btn" @click="prev" />
      </div>
      <div class="preview-image-wrapper">
        <el-image
          :src="imageSrc"
          :initial-index="currentIndex"
          :preview-src-list="imageList"
          fit="contain"
          class="preview-image"
          hide-on-click-modal
          @load="handleImageLoad"
          @error="handleImageError"
        >
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
          </template>
          <template #error>
            <div class="image-error">
              <el-icon><PictureFilled /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      <div v-if="hasNext" class="preview-nav">
        <el-button :icon="ArrowRight" circle class="nav-btn" @click="next" />
      </div>
    </div>
    <template #footer>
      <div class="preview-footer">
        <span class="image-info">{{ currentIndex + 1 }} / {{ imageList.length }}</span>
        <div class="footer-actions">
          <el-button @click="handleClose">关闭</el-button>
          <el-button type="primary" @click="download">下载</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight, Loading, PictureFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadFileUrl } from '@/apis/file'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fileList: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const currentIndex = ref(props.initialIndex)
const loading = ref(false)
const error = ref(false)

watch(
  () => props.initialIndex,
  newVal => {
    currentIndex.value = newVal
  }
)

watch(
  () => props.modelValue,
  val => {
    if (val) {
      currentIndex.value = props.initialIndex
    }
  }
)

const imageList = computed(() => {
  return props.fileList
    .map(file => file?.id ?? file?.fileId)
    .filter(Boolean)
    .map(fileId => downloadFileUrl(fileId))
})

const title = computed(() => {
  if (props.fileList.length > 0 && props.fileList[currentIndex.value]) {
    return props.fileList[currentIndex.value].fileName
  }
  return '图片预览'
})

const imageSrc = computed(() => {
  if (imageList.value.length > 0) {
    return imageList.value[currentIndex.value]
  }
  return ''
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < imageList.value.length - 1)

const prev = () => {
  if (hasPrev.value) {
    currentIndex.value--
  }
}

const next = () => {
  if (hasNext.value) {
    currentIndex.value++
  }
}

const handleImageLoad = () => {
  loading.value = false
  error.value = false
}

const handleImageError = () => {
  loading.value = false
  error.value = true
  ElMessage.error('图片加载失败')
}

const handleClose = () => {
  visible.value = false
}

const handleClosed = () => {
  currentIndex.value = props.initialIndex
  loading.value = false
  error.value = false
  emit('close')
}

const download = () => {
  if (props.fileList.length > 0 && props.fileList[currentIndex.value]) {
    try {
      const link = document.createElement('a')
      const currentFile = props.fileList[currentIndex.value]
      link.href = downloadFileUrl(currentFile?.id ?? currentFile?.fileId)
      link.click()
      ElMessage.success('下载任务已开始')
    } catch {
      ElMessage.error('下载失败，请稍后重试')
    }
  }
}

const handleKeyDown = e => {
  if (!visible.value) return
  if (e.key === 'ArrowLeft') {
    prev()
  } else if (e.key === 'ArrowRight') {
    next()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

defineExpose({
  prev,
  next
})
</script>

<style lang="scss" scoped>
.image-preview-dialog {
  // 限制弹窗宽度范围
  :deep(.el-dialog) {
    max-width: 85vw;
    min-width: 300px;
    margin: 0 auto;
  }

  :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--color-border-lighter);
    padding: var(--spacing-md) var(--spacing-lg);
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    overflow: hidden;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid var(--color-border-lighter);
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: var(--color-bg-page);
  padding: var(--spacing-md);
  // 限制容器高度
  max-height: 75vh;
}

.preview-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.nav-btn {
  background: var(--color-bg-white);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }
}

.preview-image-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  // 限制图片容器尺寸
  max-width: 70vw;
  max-height: 70vh;
}

.preview-image {
  // 图片自适应，保持比例
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.image-loading,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 200px;
  height: 200px;
  color: var(--color-text-secondary);
  font-size: 14px;

  .el-icon {
    font-size: 32px;
  }
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.footer-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.image-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

// 响应式调整
@media (max-width: 768px) {
  .image-preview-dialog {
    :deep(.el-dialog) {
      max-width: 95vw;
    }
  }

  .preview-container {
    padding: var(--spacing-sm);
  }

  .preview-image-wrapper {
    max-width: 85vw;
  }

  .preview-image {
    max-height: 60vh;
  }
}

@media (max-width: 480px) {
  .preview-nav {
    display: none;
  }

  .preview-image-wrapper {
    max-width: 100%;
  }

  .preview-image {
    max-height: 50vh;
  }
}
</style>
