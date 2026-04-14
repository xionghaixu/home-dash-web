<template>
  <div class="sidebar-container">
    <el-menu
      :default-active="active"
      class="sidebar-menu"
      background-color="transparent"
      text-color="var(--color-sidebar-text)"
      active-text-color="var(--color-sidebar-text-active)"
      :collapse="isCollapsed"
      :collapse-transition="false"
    >
      <div class="menu-section">
        <div class="section-title" v-if="!isCollapsed">工作台</div>
        <el-menu-item index="/folder" @click="linkToFileList">
          <el-icon><Document /></el-icon>
          <span>全部文件</span>
        </el-menu-item>
        <el-menu-item index="/recent" @click="linkTo('/recent')">
          <el-icon><Clock /></el-icon>
          <span>最近上传</span>
        </el-menu-item>
        <el-menu-item index="/category" @click="linkTo('/category/picture')">
          <el-icon><Grid /></el-icon>
          <span>基础分类</span>
        </el-menu-item>
      </div>

      <div class="menu-section">
        <div class="section-title" v-if="!isCollapsed">传输</div>
        <el-menu-item index="/transfers" @click="linkTo('/transfers')">
          <el-icon><UploadFilled /></el-icon>
          <span>传输列表</span>
          <el-badge v-if="transferCount > 0" :value="transferCount" :max="99" class="transfer-badge" />
        </el-menu-item>
      </div>

      <div class="menu-section">
        <div class="section-title" v-if="!isCollapsed">系统</div>
        <el-menu-item index="/system" @click="linkTo('/system')">
          <el-icon><Setting /></el-icon>
          <span>系统信息</span>
        </el-menu-item>
      </div>
    </el-menu>

    <div class="sidebar-footer">
      <div class="version-info" v-if="!isCollapsed">
        <span>v1.0.0</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  Document,
  Clock,
  Grid,
  Setting,
  UploadFilled
} from '@element-plus/icons-vue'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const active = ref('/folder')
const isCollapsed = ref(false)
const transferCount = ref(0)

const linkToFileList = () => {
  router.push('/folder/' + store.folderId)
}

const linkTo = (path) => {
  router.push(path)
}

const updateActive = () => {
  const currentPath = route.path
  if (currentPath.startsWith('/folder')) {
    active.value = '/folder'
    return
  }
  if (currentPath.startsWith('/recent')) {
    active.value = '/recent'
    return
  }
  if (currentPath.startsWith('/category')) {
    active.value = '/category'
    return
  }
  if (currentPath.startsWith('/transfers')) {
    active.value = '/transfers'
    return
  }
  if (currentPath.startsWith('/system')) {
    active.value = '/system'
  }
}

watch(() => route.path, updateActive, { immediate: true })

// Listen for transfer count updates
watch(() => store.transferCount, (val) => {
  transferCount.value = val
}, { immediate: true })
</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-lg) 0;
}

.sidebar-menu {
  flex: 1;
  border: none;

  &:not(.el-menu--collapse) {
    width: var(--sidebar-width);
  }
}

.menu-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-sidebar-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
}

:deep(.el-menu-item) {
  position: relative;
  height: 48px;
  margin: var(--spacing-xs) var(--spacing-sm);
  padding: 0 var(--spacing-lg) !important;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);

  .el-icon {
    font-size: 18px;
    margin-right: var(--spacing-md);
  }

  span {
    display: inline-block;
    vertical-align: middle;
  }

  &:hover {
    background: var(--color-sidebar-hover) !important;
  }

  &.is-active {
    background: var(--color-sidebar-active) !important;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: var(--color-primary);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }
  }
}

.transfer-badge {
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  margin-top: 0;
}

.sidebar-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-sidebar-border);
}

.version-info {
  font-size: var(--font-size-xs);
  color: var(--color-sidebar-text);
  opacity: 0.4;
}
</style>
