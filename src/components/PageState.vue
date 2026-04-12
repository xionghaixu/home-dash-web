<template>
  <div class="page-state" :style="{ minHeight }">
    <div v-if="loading" class="state-panel">
      <el-skeleton :rows="5" animated />
      <p class="state-text">{{ loadingText }}</p>
    </div>
    <div v-else-if="error" class="state-panel">
      <el-result icon="error" :title="errorTitle" :sub-title="errorDescription">
        <template #extra>
          <el-button type="primary" @click="$emit('retry')">重新加载</el-button>
        </template>
      </el-result>
    </div>
    <div v-else-if="empty" class="state-panel">
      <el-empty :description="emptyDescription" />
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '正在加载数据...'
  },
  errorTitle: {
    type: String,
    default: '加载失败'
  },
  errorDescription: {
    type: String,
    default: '请稍后重试'
  },
  emptyDescription: {
    type: String,
    default: '暂无数据'
  },
  minHeight: {
    type: String,
    default: '320px'
  }
})

defineEmits(['retry'])
</script>

<style lang="scss" scoped>
.page-state {
  width: 100%;
}

.state-panel {
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.state-text {
  margin-top: 16px;
  color: #606266;
  text-align: center;
}
</style>
