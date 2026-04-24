<template>
  <label v-show="support" ref="btn" class="uploader-btn">
    <slot></slot>
  </label>
</template>

<script>
/**
 * UploaderBtn 组件 - 文件选择按钮组件
 * @description 提供文件选择按钮，支持选择文件或文件夹
 * @component
 * @example
 * <uploader-btn>选择文件</uploader-btn>
 * <uploader-btn :directory="true">选择文件夹</uploader-btn>
 */
import { uploaderMixin, supportMixin } from './common/mixins'

const COMPONENT_NAME = 'UploaderBtn'

export default {
  name: COMPONENT_NAME,
  mixins: [uploaderMixin, supportMixin],
  props: {
    directory: {
      type: Boolean,
      default: false
    },
    single: {
      type: Boolean,
      default: false
    },
    attrs: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  mounted() {
    // 在下一个DOM更新周期后，将按钮元素绑定到uploader实例
    // assignBrowse方法会自动创建隐藏的file input元素并绑定点击事件
    this.$nextTick(() => {
      this.uploader.uploader.assignBrowse(this.$refs.btn, this.directory, this.single, this.attrs)
    })
  }
}
</script>

<style>
.uploader-btn {
  display: inline-block;
  position: relative;
  padding: 4px 8px;
  font-size: 100%;
  line-height: 1.4;
  color: #666;
  border: 1px solid #666;
  cursor: pointer;
  border-radius: 2px;
  background: none;
  outline: none;
}
.uploader-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
