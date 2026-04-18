<template>
  <div class="uploader-list">
    <slot :file-list="fileList">
      <ul>
        <li v-for="file in fileList" :key="file.id">
          <UploaderFile :file="file" :list="true"></UploaderFile>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
/**
 * UploaderList 组件 - 上传队列列表组件
 * @description 展示上传队列中的文件列表
 * @component
 * @example
 * <uploader-list></uploader-list>
 */
import { uploaderMixin } from './common/mixins'
import UploaderFile from './File.vue'

const COMPONENT_NAME = 'UploaderList'

export default {
  name: COMPONENT_NAME,
  components: {
    UploaderFile
  },
  mixins: [uploaderMixin],
  computed: {
    fileList() {
      return this.uploader.fileList
    }
  }
}
</script>

<style>
.uploader-list {
  position: relative;
}
.uploader-list > ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
