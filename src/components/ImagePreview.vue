<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="auto"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="image-preview-dialog"
    @closed="handleClosed"
  >
    <div class="preview-container">
      <div class="preview-nav">
        <el-button v-if="hasPrev" :icon="ArrowLeft" circle class="nav-btn" @click="prev" />
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
        />
      </div>
      <div class="preview-nav">
        <el-button v-if="hasNext" :icon="ArrowRight" circle class="nav-btn" @click="next" />
      </div>
    </div>
    <template #footer>
      <div class="preview-footer">
        <span class="image-info">{{ currentIndex + 1 }} / {{ imageList.length }}</span>
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="download">下载</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
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

const imageList = computed(() => {
  return props.fileList.map(file => downloadFileUrl(file.id))
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
      link.href = downloadFileUrl(props.fileList[currentIndex.value].id)
      link.click()
      ElMessage.success('下载任务已开始')
    } catch {
      ElMessage.error('下载失败，请稍后重试')
    }
  }
}

defineExpose({
  prev,
  next
})
</script>

<style lang="scss" scoped>
.image-preview-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--color-border-lighter);
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 80vh;
    overflow: hidden;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid var(--color-border-lighter);
    padding: var(--spacing-md) var(--spacing-xl);
  }
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  max-height: 80vh;
  background: var(--color-bg-page);
  padding: var(--spacing-xl);
}

.preview-nav {
  padding: var(--spacing-lg);
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
  max-width: calc(100% - 160px);
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.image-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .preview-container {
    padding: var(--spacing-md);
  }

  .preview-nav {
    padding: var(--spacing-sm);
  }

  .preview-image-wrapper {
    max-width: calc(100% - 100px);
  }
}

@media (max-width: 480px) {
  .preview-nav {
    display: none;
  }

  .preview-image-wrapper {
    max-width: 100%;
  }
}
</style>
