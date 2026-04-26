<template>
  <div v-if="history.length > 0" class="search-history">
    <div class="history-header">
      <span class="history-title">
        <el-icon><Clock /></el-icon>
        搜索历史
      </span>
      <el-button type="primary" link size="small" @click="handleClear">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </div>
    <div class="history-list">
      <el-tag
        v-for="item in displayHistory"
        :key="item"
        class="history-tag"
        size="small"
        @click="handleClick(item)"
      >
        {{ item }}
      </el-tag>
      <el-button
        v-if="history.length > maxDisplay"
        type="primary"
        link
        size="small"
        @click="showAll = !showAll"
      >
        {{ showAll ? '收起' : `更多 (${history.length - maxDisplay})` }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  },
  maxDisplay: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['select', 'clear'])

const showAll = ref(false)

const displayHistory = computed(() => {
  if (showAll.value) {
    return props.history
  }
  return props.history.slice(0, props.maxDisplay)
})

const handleClick = item => {
  emit('select', item)
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空搜索历史吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('clear')
    ElMessage.success('搜索历史已清空')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.search-history {
  margin-bottom: var(--spacing-lg);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.history-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.history-tag {
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
  }
}
</style>
