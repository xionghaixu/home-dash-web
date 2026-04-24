<template>
  <div class="uploader-files">
    <slot :files="files">
      <ul>
        <li v-for="file in files" :key="file.id">
          <UploaderFile :file="file"></UploaderFile>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
/**
 * UploaderFiles 组件 - 上传文件列表组件
 * @description 展示所有上传文件的列表
 * @component
 * @example
 * <uploader-files></uploader-files>
 */
import { uploaderMixin } from './common/mixins'
import UploaderFile from './File.vue'

const COMPONENT_NAME = 'UploaderFiles'

export default {
  name: COMPONENT_NAME,
  components: {
    UploaderFile
  },
  mixins: [uploaderMixin],
  computed: {
    files() {
      return this.uploader.files
    }
  }
}
</script>

<style>
.uploader-files {
  position: relative;
}
.uploader-files > ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
