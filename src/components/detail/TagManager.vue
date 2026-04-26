<template>
  <el-dialog v-model="visible" title="标签管理" width="420px" @close="handleClose">
    <div class="tag-manager">
      <div class="current-tags">
        <div class="section-label">当前标签</div>
        <div v-if="localTags.length === 0" class="empty-tags">暂无标签</div>
        <div v-else class="tags-list">
          <el-tag
            v-for="tag in localTags"
            :key="tag.id"
            closable
            :color="tag.tagColor || ''"
            @close="handleRemoveTag(tag.id)"
          >
            {{ tag.tagName }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <div class="add-tag">
        <div class="section-label">添加标签</div>
        <el-input
          v-model="newTagName"
          placeholder="输入标签名称，按回车添加"
          clearable
          @keyup.enter="handleAddTag"
        >
          <template #append>
            <el-button @click="handleAddTag">添加</el-button>
          </template>
        </el-input>
      </div>

      <div v-if="allTags.length > 0" class="existing-tags">
        <div class="section-label">已有标签</div>
        <div class="tags-list">
          <el-tag
            v-for="tag in availableTags"
            :key="tag.id"
            class="clickable-tag"
            :color="tag.tagColor || ''"
            @click="handleSelectExistingTag(tag)"
          >
            {{ tag.tagName }}
          </el-tag>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getFileTags, addFileTags, removeFileTag, getTagList } from '@/apis/file'

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

const emit = defineEmits(['update:modelValue', 'change'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const localTags = ref([])
const allTags = ref([])
const newTagName = ref('')
const loading = ref(false)

const availableTags = computed(() => {
  const localTagIds = localTags.value.map(t => t.id)
  return allTags.value.filter(tag => !localTagIds.includes(tag.id))
})

watch(
  () => props.modelValue,
  async val => {
    if (val && props.fileId) {
      await loadTags()
    }
  }
)

const loadTags = async () => {
  if (!props.fileId) return
  loading.value = true
  try {
    const [fileTagsRes, allTagsRes] = await Promise.all([
      getFileTags(props.fileId).catch(() => ({ data: [] })),
      getTagList().catch(() => ({ data: [] }))
    ])
    localTags.value = fileTagsRes.data || []
    allTags.value = allTagsRes.data || []
  } catch {
    ElMessage.error('标签加载失败')
  } finally {
    loading.value = false
  }
}

const handleAddTag = async () => {
  if (!props.fileId || !newTagName.value.trim()) return

  try {
    await addFileTags(props.fileId, [newTagName.value.trim()])
    newTagName.value = ''
    await loadTags()
    emit('change', localTags.value)
    ElMessage.success('标签添加成功')
  } catch {
    ElMessage.error('添加失败')
  }
}

const handleRemoveTag = async tagId => {
  if (!props.fileId) return

  try {
    await removeFileTag(props.fileId, tagId)
    localTags.value = localTags.value.filter(t => t.id !== tagId)
    emit('change', localTags.value)
    ElMessage.success('标签已移除')
  } catch {
    ElMessage.error('移除失败')
  }
}

const handleSelectExistingTag = async tag => {
  if (!props.fileId) return

  try {
    await addFileTags(props.fileId, [tag.tagName])
    await loadTags()
    emit('change', localTags.value)
    ElMessage.success('标签添加成功')
  } catch {
    ElMessage.error('添加失败')
  }
}

const handleClose = () => {
  newTagName.value = ''
  localTags.value = []
}
</script>

<style lang="scss" scoped>
.tag-manager {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.empty-tags {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
  padding: var(--spacing-md) 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.clickable-tag {
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.8;
  }
}
</style>
