<template>
  <div id="app">
    <el-config-provider :locale="zhCn">
      <router-view></router-view>
      <FileUpload></FileUpload>
    </el-config-provider>
  </div>
</template>

<script setup>
import FileUpload from '@/components/FileUpload.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<style lang="scss">
@import '@/styles/index.scss';
</style>
