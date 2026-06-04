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
      <el-aside :width="sidebarWidth">
        <Aside></Aside>
      </el-aside>
      <el-main class="main-area">
        <a href="#main-content" class="skip-link">跳转到主要内容</a>
        <div id="main-content" role="main" class="main-container">
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

const sidebarWidth = computed(() => '220px')

const isDragOver = ref(false)

let dragCounter = 0

const handleDragEnter = e => {
  const types = e.dataTransfer?.types || []
  if (!Array.from(types).includes('Files')) {
    return
  }
  e.preventDefault()
  dragCounter++
  isDragOver.value = true
}

const handleDragLeave = () => {
  if (!isDragOver.value) return
  dragCounter--
  if (dragCounter <= 0) {
    isDragOver.value = false
    dragCounter = 0
  }
}

const handleDrop = e => {
  if (!isDragOver.value) return
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
  background: var(--color-bg-page);
}

.el-header {
  padding: 0;
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border-light);
  line-height: 56px;
  z-index: var(--z-index-sticky);
  position: relative;
}

.main-wrapper {
  height: calc(100vh - 56px);
  overflow: hidden;
}

.el-aside {
  background: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-sidebar-border);
  transition: width var(--transition-slow);
  overflow: hidden;
  flex-shrink: 0;
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
  background: var(--color-bg-page);
}

// Page transition animations
.page-fade-slide-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Drag overlay
.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
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

// Skip navigation link
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--spacing-md);
  z-index: 10000;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: top var(--transition-fast);

  &:focus {
    top: var(--spacing-md);
  }
}

// Responsive adaptations
@media (max-width: 960px) {
  .el-aside {
    display: none;
  }

  .main-area {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .main-container {
    padding: var(--spacing-md);
  }
}
</style>
