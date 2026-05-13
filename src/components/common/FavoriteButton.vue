<template>
  <el-button
    :type="isFavorite ? 'warning' : 'default'"
    :icon="isFavorite ? StarFilled : Star"
    :size="size"
    :circle="circle"
    :loading="loading"
    @click="handleToggle"
  >
    <span v-if="showLabel">{{ isFavorite ? '已收藏' : '收藏' }}</span>
  </el-button>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { addFavorite, removeFavorite } from '@/apis/file'

const props = defineProps({
  fileId: {
    type: [String, Number],
    required: true
  },
  favorite: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  },
  circle: {
    type: Boolean,
    default: true
  },
  showLabel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:favorite', 'change'])

const isFavorite = ref(props.favorite)
const loading = ref(false)

watch(
  () => props.favorite,
  val => {
    isFavorite.value = val
  }
)

const handleToggle = async () => {
  if (!props.fileId) return

  loading.value = true
  try {
    if (isFavorite.value) {
      await removeFavorite(props.fileId)
    } else {
      await addFavorite(props.fileId)
    }
    isFavorite.value = !isFavorite.value
    emit('update:favorite', isFavorite.value)
    emit('change', isFavorite.value)
    ElMessage.success(isFavorite.value ? '已添加收藏' : '已取消收藏')
  } catch {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}
</script>
