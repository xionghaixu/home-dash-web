<template>
  <div class="page-state" :style="{ minHeight }">
    <div v-if="loading" class="state-panel state-panel--loading">
      <div class="loading-animation">
        <div class="loading-spinner"></div>
      </div>
      <el-skeleton :rows="5" animated class="loading-skeleton" />
      <p class="state-text">{{ loadingText }}</p>
    </div>
    <div v-else-if="error" class="state-panel state-panel--error">
      <el-result icon="error" :title="errorTitle" :sub-title="errorDescription">
        <template #extra>
          <el-button type="primary" @click="$emit('retry')">
            <el-icon><RefreshRight /></el-icon>
            重新加载
          </el-button>
        </template>
      </el-result>
    </div>
    <div v-else-if="empty" class="state-panel state-panel--empty">
      <div class="empty-illustration">
        <svg viewBox="0 0 120 120" class="empty-svg">
          <circle cx="60" cy="60" r="50" fill="var(--color-fill-base)" />
          <path
            d="M40 50 L60 70 L80 50"
            stroke="var(--color-text-placeholder)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="45" cy="45" r="5" fill="var(--color-text-placeholder)" />
          <circle cx="75" cy="45" r="5" fill="var(--color-text-placeholder)" />
        </svg>
      </div>
      <p class="empty-title">暂无数据</p>
      <p class="empty-description">{{ emptyDescription }}</p>
      <slot name="empty-action"></slot>
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
import { RefreshRight } from '@element-plus/icons-vue'

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
  animation: fadeIn 0.3s ease;
}

.state-panel {
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border-lighter);
  border-radius: var(--radius-lg);
}

.state-panel--loading {
  gap: var(--spacing-lg);
}

.loading-animation {
  display: flex;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-lighter);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-skeleton {
  width: 100%;
  max-width: 400px;
}

.state-text {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.state-panel--empty {
  gap: var(--spacing-md);
}

.empty-illustration {
  margin-bottom: var(--spacing-md);
}

.empty-svg {
  width: 100px;
  height: 100px;
  opacity: 0.6;
}

.empty-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.empty-description {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 280px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
