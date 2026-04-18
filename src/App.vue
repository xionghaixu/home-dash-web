<template>
  <div id="app">
    <el-config-provider :locale="zhCn">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <FileUpload></FileUpload>
    </el-config-provider>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style lang="scss">
@use '@/styles/index.scss';
</style>
