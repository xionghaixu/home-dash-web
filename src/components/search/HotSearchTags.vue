<template>
  <div v-if="hotFilters.length > 0" class="hot-search-tags">
    <div class="hot-header">
      <span class="hot-title">
        <el-icon><TrendCharts /></el-icon>
        热门筛选
      </span>
    </div>
    <div class="hot-list">
      <el-tag
        v-for="item in hotFilters"
        :key="`${item.filterType}-${item.filterValue}`"
        class="hot-tag"
        :type="getTagType(item.filterType)"
        size="small"
        @click="handleClick(item)"
      >
        {{ item.displayName || item.filterValue }}
        <span class="hot-count">({{ formatCount(item.count) }})</span>
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { TrendCharts } from '@element-plus/icons-vue'

defineProps({
  hotFilters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const getTagType = filterType => {
  const typeMap = {
    type: 'primary',
    tag: 'success',
    favorite: 'warning',
    size: 'info',
    date: 'danger'
  }
  return typeMap[filterType] || ''
}

const formatCount = count => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}

const handleClick = item => {
  emit('select', item)
}
</script>

<style lang="scss" scoped>
.hot-search-tags {
  margin-bottom: var(--spacing-lg);
}

.hot-header {
  margin-bottom: var(--spacing-sm);
}

.hot-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.hot-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.hot-tag {
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    transform: scale(1.05);
  }
}

.hot-count {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}
</style>
