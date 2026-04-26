<template>
  <div class="remark-editor">
    <div class="remark-header">
      <span class="section-title">备注</span>
      <el-button
        v-if="!isEditing"
        type="primary"
        link
        size="small"
        :icon="Edit"
        @click="startEdit"
      >
        编辑
      </el-button>
      <template v-else>
        <el-button type="primary" link size="small" @click="handleSave">保存</el-button>
        <el-button link size="small" @click="cancelEdit">取消</el-button>
      </template>
    </div>

    <div v-if="!isEditing" class="remark-display">
      <span v-if="displayContent" class="remark-text">{{ displayContent }}</span>
      <span v-else class="remark-empty">暂无备注</span>
    </div>

    <div v-else class="remark-edit">
      <el-input
        v-model="editContent"
        type="textarea"
        :rows="4"
        :maxlength="500"
        show-word-limit
        placeholder="请输入备注内容"
        @blur="handleAutoSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { saveFileRemark } from '@/apis/file'

const props = defineProps({
  fileId: {
    type: [String, Number],
    default: null
  },
  remark: {
    type: String,
    default: ''
  },
  autoSave: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:remark', 'change'])

const isEditing = ref(false)
const editContent = ref('')
const displayContent = computed(() => props.remark)

watch(
  () => props.remark,
  val => {
    if (!isEditing.value) {
      editContent.value = val || ''
    }
  },
  { immediate: true }
)

const startEdit = () => {
  editContent.value = props.remark || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = props.remark || ''
}

const handleSave = async () => {
  if (!props.fileId) return

  try {
    await saveFileRemark(props.fileId, editContent.value)
    emit('update:remark', editContent.value)
    emit('change', editContent.value)
    isEditing.value = false
    ElMessage.success('备注已保存')
  } catch {
    ElMessage.error('保存失败')
  }
}

const handleAutoSave = () => {
  if (props.autoSave && editContent.value !== props.remark) {
    handleSave()
  }
}
</script>

<style lang="scss" scoped>
.remark-editor {
  border-top: 1px solid var(--color-border-lighter);
  padding-top: var(--spacing-lg);
}

.remark-header {
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

.remark-display {
  min-height: 40px;
}

.remark-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.remark-empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.remark-edit {
  :deep(.el-textarea__inner) {
    resize: none;
  }
}
</style>
