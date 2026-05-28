<template>
  <div class="sidebar-container">
    <div class="sidebar-menu">
      <div class="menu-section">
        <div class="section-title">我的文件</div>
        <router-link
          v-for="item in myMenuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="18"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </div>

      <div class="menu-section">
        <div class="section-title">媒体分类</div>
        <router-link
          v-for="item in mediaMenuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="18"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </div>

      <div class="menu-section">
        <div class="section-title">系统</div>
        <router-link
          v-for="item in systemMenuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="18"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="storage-info">
        <div class="storage-bar">
          <div class="storage-bar__fill" :style="{ width: storagePercent + '%' }"></div>
        </div>
        <div class="storage-text">
          <span>{{ formatFileSize({ size: storageUsed }) }}</span>
          <span>/ {{ formatFileSize({ size: storageTotal }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  FolderOpened,
  Star,
  VideoCamera,
  Picture,
  Headset,
  Grid,
  TrendCharts,
  Delete,
  List,
  Brush,
  PieChart
} from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/file'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()

const myMenuItems = [
  { path: '/home', label: '首页', icon: HomeFilled },
  { path: '/files', label: '全部文件', icon: FolderOpened },
  { path: '/transfers', label: '传输列表', icon: Star }
]

const mediaMenuItems = [
  { path: '/media/videos', label: '视频', icon: VideoCamera },
  { path: '/media/images', label: '图片', icon: Picture },
  { path: '/media/audio', label: '音频', icon: Headset }
]

const systemMenuItems = [
  { path: '/category', label: '分类浏览', icon: Grid },
  { path: '/system', label: '系统信息', icon: TrendCharts },
  { path: '/governance/recycle', label: '回收站', icon: Delete },
  { path: '/governance/cleanup', label: '空间瘦身', icon: Brush },
  { path: '/governance/analysis', label: '存储分析', icon: PieChart },
  { path: '/tasks', label: '任务中心', icon: List }
]

const isActive = path => {
  if (path === '/home') {
    return route.path === '/' || route.path === '/home'
  }
  return route.path.startsWith(path)
}

const storageUsed = computed(() => store.storageUsed || 0)
const storageTotal = computed(() => store.storageTotal || 0)
const storagePercent = computed(() => {
  if (!storageTotal.value) return 0
  return Math.min(100, (storageUsed.value / storageTotal.value) * 100)
})

const handleFlush = () => {
  store.fetchStorageInfo()
}

onMounted(() => {
  store.fetchStorageInfo()
  window.eventBus.on('flushFileList', handleFlush)
})

onUnmounted(() => {
  window.eventBus.off('flushFileList', handleFlush)
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-lg) 0;
  background: var(--color-sidebar-bg);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--spacing-sm);
}

.menu-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-sidebar-text);
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.5;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  height: 42px;
  margin: 2px 0;
  padding: 0 var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-sidebar-text);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
  position: relative;

  .el-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  span {
    display: inline-block;
    vertical-align: middle;
  }

  &:hover {
    background: var(--color-sidebar-hover);
    color: var(--color-sidebar-text-active);
  }

  &.active {
    background: var(--color-sidebar-active);
    color: var(--color-sidebar-text-active);
    font-weight: var(--font-weight-medium);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 18px;
      background: var(--color-primary);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }
  }
}

.sidebar-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-sidebar-border);
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.storage-bar {
  width: 100%;
  height: 4px;
  background: var(--color-fill-base);
  border-radius: var(--radius-full);
  overflow: hidden;

  &__fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-base);
  }
}

.storage-text {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-sidebar-text);
  opacity: 0.7;
}

@media (max-width: 960px) {
  .sidebar-container {
    display: none;
  }
}
</style>
