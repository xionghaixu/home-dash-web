<template>
  <div class="filter-view-selector">
    <el-dropdown trigger="click" @command="handleCommand">
      <el-button type="primary" plain size="small">
        <el-icon><Filter /></el-icon>
        筛选视图
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="default">默认视图</el-dropdown-item>
          <el-dropdown-item command="favorite">仅收藏</el-dropdown-item>
          <el-dropdown-item command="recent">最近使用</el-dropdown-item>
          <el-dropdown-item command="large">大文件 (>100MB)</el-dropdown-item>
          <el-dropdown-item command="images">仅图片</el-dropdown-item>
          <el-dropdown-item command="videos">仅视频</el-dropdown-item>
          <el-dropdown-item divided command="custom">自定义视图...</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-dialog v-model="showCustomDialog" title="自定义筛选视图" width="500px">
      <el-form :model="customView" label-width="100px">
        <el-form-item label="视图名称">
          <el-input v-model="customView.name" placeholder="输入视图名称" />
        </el-form-item>
        <el-form-item label="文件类型">
          <el-checkbox-group v-model="customView.types">
            <el-checkbox label="picture">图片</el-checkbox>
            <el-checkbox label="video">视频</el-checkbox>
            <el-checkbox label="audio">音频</el-checkbox>
            <el-checkbox label="document">文档</el-checkbox>
            <el-checkbox label="text">文本</el-checkbox>
            <el-checkbox label="code">代码</el-checkbox>
            <el-checkbox label="compress">压缩包</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="仅收藏">
          <el-switch v-model="customView.favorite" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-select v-model="customView.dateRange" placeholder="选择时间范围" clearable>
            <el-option label="今天" value="today" />
            <el-option label="最近7天" value="week" />
            <el-option label="最近30天" value="month" />
            <el-option label="最近90天" value="quarter" />
          </el-select>
        </el-form-item>
        <el-form-item label="大小范围">
          <el-slider v-model="customView.sizeRange" range :max="4" :marks="sizeMarks" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCustomDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCustomView">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Filter, ArrowDown } from '@element-plus/icons-vue'

const emit = defineEmits(['select', 'save-custom'])

const showCustomDialog = ref(false)
const customView = ref({
  name: '',
  types: [],
  favorite: false,
  dateRange: '',
  sizeRange: [0, 4]
})

const sizeMarks = {
  0: '0',
  1: '1MB',
  2: '10MB',
  3: '100MB',
  4: '1GB+'
}

const handleCommand = command => {
  if (command === 'custom') {
    showCustomDialog.value = true
    return
  }

  const presetFilters = {
    default: {},
    favorite: { favorite: true },
    recent: { recent: true },
    large: { sizeRange: { min: 100 * 1024 * 1024, max: Number.MAX_SAFE_INTEGER } },
    images: { types: ['picture'] },
    videos: { types: ['video'] }
  }

  emit('select', {
    name: command,
    filters: presetFilters[command] || {}
  })
}

const saveCustomView = () => {
  if (!customView.value.name.trim()) {
    ElMessage.warning('请输入视图名称')
    return
  }

  emit('save-custom', {
    name: customView.value.name,
    filters: {
      types: customView.value.types,
      favorite: customView.value.favorite,
      dateRange: customView.value.dateRange,
      sizeRange: customView.value.sizeRange
    }
  })

  showCustomDialog.value = false
  customView.value = {
    name: '',
    types: [],
    favorite: false,
    dateRange: '',
    sizeRange: [0, 4]
  }
  ElMessage.success('自定义视图已保存')
}
</script>

<style lang="scss" scoped>
.filter-view-selector {
  display: inline-flex;
}
</style>
