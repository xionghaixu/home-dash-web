<template>
  <el-container class="app-container">
    <el-header height="56px">
      <Header></Header>
    </el-header>
    <el-container class="main-wrapper">
      <el-aside width="220px">
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
  </el-container>
</template>

<script setup>
import Header from '@/views/layout/Header.vue'
import Aside from '@/views/layout/Aside.vue'
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
