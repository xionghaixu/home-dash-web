<template>
  <div class="search-filter-panel">
    <div class="filter-header">
      <span class="filter-title">筛选</span>
      <el-button v-if="hasActiveFilters" type="primary" link size="small" @click="clearAll">
        清除全部
      </el-button>
    </div>

    <div class="filter-section">
      <div class="section-title">文件类型</div>
      <div class="filter-options">
        <el-check-tag
          v-for="type in fileTypes"
          :key="type.value"
          :checked="isTypeSelected(type.value)"
          @change="toggleType(type.value)"
        >
          {{ type.label }}
        </el-check-tag>
      </div>
    </div>

    <div class="filter-section">
      <div class="section-title">标签</div>
      <div class="filter-options">
        <el-check-tag
          v-for="tag in availableTags"
          :key="tag.id"
          :checked="isTagSelected(tag.id)"
          :style="{
            backgroundColor: isTagSelected(tag.id) ? tag.tagColor || 'var(--color-primary)' : ''
          }"
          @change="toggleTag(tag.id)"
        >
          {{ tag.tagName }}
        </el-check-tag>
        <span v-if="availableTags.length === 0" class="empty-text">暂无标签</span>
      </div>
    </div>

    <div class="filter-section">
      <div class="section-title">目录</div>
      <el-tree-select
        v-model="selectedFolder"
        :data="folderTree"
        :props="{ label: 'fileName', value: 'id', children: 'children' }"
        placeholder="选择目录"
        clearable
        check-strictly
        @change="handleFolderChange"
      />
    </div>

    <div class="filter-section">
      <div class="section-title">时间范围</div>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        @change="handleDateChange"
      />
    </div>

    <div class="filter-section">
      <div class="section-title">大小范围</div>
      <el-slider
        v-model="sizeRange"
        range
        :max="sizeOptions.length - 1"
        :marks="sizeMarks"
        @change="handleSizeChange"
      />
    </div>

    <div class="filter-section">
      <div class="section-title">其他</div>
      <div class="filter-options">
        <el-check-tag :checked="filters.favorite" @change="toggleFavorite">仅收藏</el-check-tag>
        <el-check-tag :checked="filters.recent" @change="toggleRecent">最近使用</el-check-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  availableTags: {
    type: Array,
    default: () => []
  },
  folderTree: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const fileTypes = [
  { value: 'picture', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'document', label: '文档' },
  { value: 'text', label: '文本' },
  { value: 'code', label: '代码' },
  { value: 'compress', label: '压缩包' }
]

const sizeOptions = [
  { label: '0', value: 0 },
  { label: '1MB', value: 1024 * 1024 },
  { label: '10MB', value: 10 * 1024 * 1024 },
  { label: '100MB', value: 100 * 1024 * 1024 },
  { label: '1GB', value: 1024 * 1024 * 1024 },
  { label: '10GB', value: 10 * 1024 * 1024 * 1024 }
]

const filters = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const selectedFolder = ref(null)
const dateRange = ref(null)
const sizeRange = ref([0, sizeOptions.length - 1])

const sizeMarks = computed(() => {
  const marks = {}
  sizeOptions.forEach((opt, index) => {
    marks[index] = opt.label
  })
  return marks
})

const hasActiveFilters = computed(() => {
  const f = filters.value
  return (
    (f.types && f.types.length > 0) ||
    (f.tags && f.tags.length > 0) ||
    f.folder ||
    f.dateRange ||
    f.sizeRange ||
    f.favorite ||
    f.recent
  )
})

const isTypeSelected = type => {
  return filters.value.types?.includes(type) || false
}

const isTagSelected = tagId => {
  return filters.value.tags?.includes(tagId) || false
}

const toggleType = type => {
  const current = filters.value.types || []
  const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type]
  updateFilter('types', updated)
}

const toggleTag = tagId => {
  const current = filters.value.tags || []
  const updated = current.includes(tagId) ? current.filter(t => t !== tagId) : [...current, tagId]
  updateFilter('tags', updated)
}

const toggleFavorite = () => {
  updateFilter('favorite', !filters.value.favorite)
}

const toggleRecent = () => {
  updateFilter('recent', !filters.value.recent)
}

const handleFolderChange = val => {
  updateFilter('folder', val)
}

const handleDateChange = val => {
  updateFilter('dateRange', val)
}

const handleSizeChange = val => {
  if (!val) return
  const minSize = sizeOptions[val[0]].value
  const maxSize = sizeOptions[val[1]].value
  updateFilter('sizeRange', { min: minSize, max: maxSize })
}

const updateFilter = (key, value) => {
  filters.value = { ...filters.value, [key]: value }
  emit('change', filters.value)
}

const clearAll = () => {
  selectedFolder.value = null
  dateRange.value = null
  sizeRange.value = [0, sizeOptions.length - 1]
  filters.value = {}
  emit('change', filters.value)
}

watch(
  () => props.modelValue,
  val => {
    if (!val.folder) selectedFolder.value = null
    if (!val.dateRange) dateRange.value = null
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.search-filter-panel {
  padding: var(--spacing-md);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.filter-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.filter-section {
  margin-bottom: var(--spacing-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}
</style>
