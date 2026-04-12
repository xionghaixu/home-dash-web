<template>
  <el-menu :default-active="active" class="navbar-menu">
    <el-menu-item index="/folder" @click="linkToFileList">
      <el-icon><Document /></el-icon>
      <template #title>全部文件</template>
    </el-menu-item>
    <el-menu-item index="/recent" @click="linkTo('/recent')">
      <el-icon><Clock /></el-icon>
      <template #title>最近上传</template>
    </el-menu-item>
    <el-menu-item index="/category" @click="linkTo('/category/picture')">
      <el-icon><Grid /></el-icon>
      <template #title>基础分类</template>
    </el-menu-item>
    <el-menu-item index="/transfers" @click="linkTo('/transfers')">
      <el-icon><UploadFilled /></el-icon>
      <template #title>传输列表</template>
    </el-menu-item>
    <el-menu-item index="/system" @click="linkTo('/system')">
      <el-icon><Setting /></el-icon>
      <template #title>系统信息</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Clock, Document, Grid, Setting, UploadFilled } from '@element-plus/icons-vue'

const store = useAppStore()

const route = useRoute()
const router = useRouter()

const active = ref('/folder')

const linkToFileList = () => {
  router.push('/folder/' + store.folderId)
}

const linkTo = (path) => {
  router.push(path)
}

watch(() => route.path, () => {
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
}, { immediate: true })
</script>

<style lang="scss" scoped>
.navbar-menu {
  padding-top: 20px;
}
</style>
