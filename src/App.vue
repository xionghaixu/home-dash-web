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
* {
  margin: 0px;
  padding: 0px;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
