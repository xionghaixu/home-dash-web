<template>
  <el-menu :default-active="active" class="navbar-menu">
    <el-menu-item index="1" @click="linkToFileList">
      <el-icon><Document /></el-icon>
      <template #title>全部文件</template>
    </el-menu-item>
    <el-menu-item index="2" @click="linkTo('/system')">
      <el-icon><Setting /></el-icon>
      <template #title>系统信息</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Document, Setting } from '@element-plus/icons-vue'

const store = useAppStore()

const route = useRoute()
const router = useRouter()

const active = ref('1')
const navbar = [
  {
    name: 'folder',
    index: '1'
  },
  {
    name: 'system',
    index: '2'
  }
]

const linkToFileList = () => {
  router.push('/folder/' + store.folderId)
}

const linkTo = (path) => {
  router.push(path)
}

watch(() => route.path, () => {
  const currentPath = route.path
  navbar.forEach(bar => {
    if (currentPath.indexOf(bar.name) !== -1) {
      active.value = bar.index
    }
  })
}, { immediate: true })
</script>

<style lang="scss" scoped>
.navbar-menu {
  padding-top: 20px;
}
</style>
