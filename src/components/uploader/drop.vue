<template>
  <div class="uploader-drop" :class="dropClass" ref="drop" v-show="support">
    <slot></slot>
  </div>
</template>

<script>
/**
 * UploaderDrop 组件 - 文件拖拽上传区域组件
 * @description 提供拖拽文件上传的区域，支持拖拽高亮效果
 * @component
 * @example
 * <uploader-drop>
 *   <p>拖拽文件到此处上传</p>
 * </uploader-drop>
 */
import { uploaderMixin, supportMixin } from './common/mixins'

const COMPONENT_NAME = 'UploaderDrop'

export default {
  name: COMPONENT_NAME,
  mixins: [uploaderMixin, supportMixin],
  data() {
    return {
      dropClass: ''
    }
  },
  methods: {
    /**
     * 拖拽进入事件处理
     * @description 当文件拖拽进入区域时添加高亮样式
     */
    onDragEnter() {
      this.dropClass = 'uploader-dragover'
    },
    /**
     * 拖拽离开事件处理
     * @description 当文件拖拽离开区域时移除高亮样式
     */
    onDragLeave() {
      this.dropClass = ''
    },
    /**
     * 拖拽放下事件处理
     * @description 当文件拖拽放下时添加放下样式
     */
    onDrop() {
      this.dropClass = 'uploader-droped'
    }
  },
  mounted() {
    // 在下一个DOM更新周期后，绑定拖拽事件
    this.$nextTick(() => {
      const dropEle = this.$refs.drop
      const uploader = this.uploader.uploader

      // 将拖拽区域元素绑定到uploader实例
      uploader.assignDrop(dropEle)

      // 注册拖拽事件监听器
      uploader.on('dragenter', this.onDragEnter)
      uploader.on('dragleave', this.onDragLeave)
      uploader.on('drop', this.onDrop)
    })
  },
  beforeUnmount() {
    // 组件销毁前移除所有事件监听器，避免内存泄漏
    const dropEle = this.$refs.drop
    const uploader = this.uploader.uploader

    uploader.off('dragenter', this.onDragEnter)
    uploader.off('dragleave', this.onDragLeave)
    uploader.off('drop', this.onDrop)

    // 解绑拖拽区域
    uploader.unAssignDrop(dropEle)
  }
}
</script>

<style>
.uploader-drop {
  position: relative;
  padding: 10px;
  overflow: hidden;
  border: 1px dashed #ccc;
  background-color: #f5f5f5;
}
.uploader-dragover {
  border-color: #999;
  background-color: #f7f7f7;
}
</style>
