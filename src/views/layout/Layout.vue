<template>
  <el-container
    class="app-container"
    :class="{ 'drag-over': isDragOver }"
    @dragenter.prevent="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <el-header height="56px">
      <Header></Header>
    </el-header>
    <el-container class="main-wrapper">
      <el-aside :width="asideWidth">
        <Aside></Aside>
      </el-aside>
      <el-main class="main-area">
        <div class="main-container">
          <router-view v-slot="{ Component, route }">
            <transition name="page-fade-slide" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>

    <transition name="fade">
      <div v-if="isDragOver" class="drag-overlay">
        <div class="drag-content">
          <el-icon :size="64" class="drag-icon"><UploadFilled /></el-icon>
          <p class="drag-text">松开鼠标上传文件</p>
        </div>
      </div>
    </transition>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import Header from '@/views/layout/Header.vue'
import Aside from '@/views/layout/Aside.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const asideWidth = computed(() => themeStore.sidebarCollapsed ? '64px' : '220px')

const isDragOver = ref(false)

let dragCounter = 0

const handleDragEnter = e => {
  e.preventDefault()
  dragCounter++
  isDragOver.value = true
}

const handleDragLeave = () => {
  dragCounter--
  if (dragCounter <= 0) {
    isDragOver.value = false
    dragCounter = 0
  }
}

const handleDrop = e => {
  e.preventDefault()
  isDragOver.value = false
  dragCounter = 0

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    window.eventBus.emit('openUploader')

    setTimeout(() => {
      window.eventBus.emit('triggerFileAdd', Array.from(files))
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.main-wrapper {
  height: calc(100vh - 56px);
  overflow: hidden;
}

.el-header {
  padding: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  box-shadow: var(--shadow-md);
  line-height: 56px;
  z-index: var(--z-index-sticky);
}

.el-aside {
  background: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-sidebar-border);
  transition: width var(--transition-slow);
  overflow: hidden;
}

.main-area {
  padding: 0;
  overflow: hidden;
  background: var(--color-bg-page);
}

.main-container {
  height: 100%;
  padding: var(--spacing-lg);
  overflow-y: auto;
  box-sizing: border-box;
}

// Page transition animations
.page-fade-slide-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.page-fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// Responsive adaptations
@media (max-width: 768px) {
  .el-aside {
    position: fixed;
    left: -220px;
    top: 56px;
    height: calc(100vh - 56px);
    z-index: var(--z-index-fixed);
    box-shadow: var(--shadow-xl);

    &.is-mobile-open {
      left: 0;
    }
  }

  .main-area {
    width: 100%;
  }

  .main-container {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: var(--spacing-sm);
  }
}

.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drag-content {
  text-align: center;
  color: #fff;
}

.drag-icon {
  animation: bounce 1s infinite;
}

.drag-text {
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
