<template>
  <div v-if="selectedCount > 0" class="batch-operations-bar">
    <div class="batch-info">
      <el-checkbox :model-value="true" @change="handleClearSelection">
        已选择 {{ selectedCount }} 项
      </el-checkbox>
    </div>
    <div class="batch-actions">
      <el-button type="warning" :icon="Star" size="small" @click="handleBatchFavorite">
        批量收藏
      </el-button>
      <el-button type="primary" :icon="CollectionTag" size="small" @click="handleBatchTag">
        批量标签
      </el-button>
      <el-button type="danger" :icon="Delete" size="small" @click="handleBatchDelete">
        批量删除
      </el-button>
      <el-button :icon="FolderOpened" size="small" @click="handleBatchMove">批量移动</el-button>
      <el-divider direction="vertical" />
      <el-button link size="small" @click="handleClearSelection">取消选择</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, CollectionTag, Delete, FolderOpened } from '@element-plus/icons-vue'

const props = defineProps({
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'clear-selection',
  'batch-favorite',
  'batch-tag',
  'batch-delete',
  'batch-move'
])

const selectedCount = computed(() => props.selectedIds.length)

const handleClearSelection = () => {
  emit('clear-selection')
}

const handleBatchFavorite = () => {
  emit('batch-favorite', props.selectedIds)
  ElMessage.success(`已批量收藏 ${selectedCount.value} 个文件`)
}

const handleBatchTag = () => {
  emit('batch-tag', props.selectedIds)
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedCount.value} 个文件吗？`, '批量删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('batch-delete', props.selectedIds)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleBatchMove = () => {
  emit('batch-move', props.selectedIds)
}
</script>

<style lang="scss" scoped>
.batch-operations-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary-bg);
  border: 1px solid var(--color-primary-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.batch-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
</style>
