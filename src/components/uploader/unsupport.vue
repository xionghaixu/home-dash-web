<template>
  <div class="uploader-unsupport" v-show="!support">
    <slot>
      <p>
        Your browser, unfortunately, is not supported by Uploader.js. The library requires support
        for
        <a href="http://www.w3.org/TR/FileAPI/">the HTML5 File API</a>
        along with
        <a href="http://www.w3.org/TR/FileAPI/#normalization-of-params">file slicing</a>
        .
      </p>
    </slot>
  </div>
</template>

<script>
/**
 * UploaderUnsupport 组件 - 浏览器不支持提示组件
 * @description 当浏览器不支持HTML5 File API时显示提示信息
 * @component
 * @example
 * <uploader-unsupport></uploader-unsupport>
 */
import { uploaderMixin, supportMixin } from './common/mixins'

const COMPONENT_NAME = 'UploaderUnsupport'

export default {
  name: COMPONENT_NAME,
  mixins: [uploaderMixin, supportMixin]
}
</script>

<style>
.uploader-unsupport {
  position: relative;
  z-index: 10;
  overflow: hidden;
}
</style>
