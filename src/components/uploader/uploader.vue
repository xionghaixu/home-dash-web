<template>
  <div class="uploader">
    <slot :files="files" :file-list="fileList" :started="started">
      <UploaderUnsupport></UploaderUnsupport>
      <UploaderDrop>
        <p>Drop files here to upload or</p>
        <UploaderBtn>select files</UploaderBtn>
        <UploaderBtn :directory="true">select folder</UploaderBtn>
      </UploaderDrop>
      <UploaderList></UploaderList>
    </slot>
  </div>
</template>

<script>
/**
 * Uploader 组件 - 文件上传核心组件
 * @description 基于simple-uploader.js封装的Vue上传组件，支持分片上传、断点续传
 * @component
 * @example
 * <uploader :options="uploadOptions" :auto-start="true"></uploader>
 */
import Uploader from 'simple-uploader.js'
import { kebabCase } from './common/utils'
import UploaderBtn from './Btn.vue'
import UploaderDrop from './Drop.vue'
import UploaderUnsupport from './Unsupport.vue'
import UploaderList from './List.vue'

const COMPONENT_NAME = 'Uploader'
const FILE_ADDED_EVENT = 'fileAdded'
const FILES_ADDED_EVENT = 'filesAdded'
const UPLOAD_START_EVENT = 'uploadStart'

export default {
  name: COMPONENT_NAME,
  provide() {
    return {
      uploader: this
    }
  },
  props: {
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    fileStatusText: {
      type: [Object, Function],
      default() {
        return {
          success: 'success',
          error: 'error',
          uploading: 'uploading',
          paused: 'paused',
          waiting: 'waiting'
        }
      }
    }
  },
  data() {
    return {
      started: false,
      files: [],
      fileList: []
    }
  },
  methods: {
    /**
     * 开始上传
     * @description 标记上传状态为已开始
     */
    uploadStart() {
      this.started = true
    },
    /**
     * 文件添加处理
     * @description 处理单个文件添加事件
     * @param {Object} file - 添加的文件对象
     * @returns {Boolean} 如果文件被忽略则返回false
     */
    fileAdded(file) {
      this.$emit(kebabCase(FILE_ADDED_EVENT), file)
      if (file.ignored) {
        // is ignored, filter it
        return false
      }
    },
    /**
     * 多文件添加处理
     * @description 处理多个文件添加事件
     * @param {Array} files - 添加的文件数组
     * @param {Array} fileList - 文件列表
     * @returns {Boolean} 如果文件被忽略则返回false
     */
    filesAdded(files, fileList) {
      this.$emit(kebabCase(FILES_ADDED_EVENT), files, fileList)
      if (files.ignored || fileList.ignored) {
        // is ignored, filter it
        return false
      }
    },
    /**
     * 文件移除处理
     * @description 更新文件列表状态
     */
    fileRemoved() {
      this.files = this.uploader.files
      this.fileList = this.uploader.fileList
    },
    /**
     * 文件提交处理
     * @description 更新文件列表并自动开始上传
     */
    filesSubmitted() {
      this.files = this.uploader.files
      this.fileList = this.uploader.fileList
      if (this.autoStart) {
        this.uploader.upload()
      }
    },
    /**
     * 统一事件处理
     * @description 处理所有uploader事件并转发
     * 实现逻辑：
     * 1. 使用EVENTSMAP映射特殊事件到对应的处理方法
     * 2. 对于需要特殊处理的事件（如fileAdded、filesAdded），直接返回
     * 3. 对于其他事件，转换为kebab-case格式并触发Vue事件
     * @param {...any} args - 事件参数，第一个参数为事件名称
     */
    allEvent(...args) {
      const name = args[0]

      // 事件映射表：定义需要特殊处理的事件
      const EVENTSMAP = {
        [FILE_ADDED_EVENT]: true, // 文件添加事件：标记为true表示需要过滤
        [FILES_ADDED_EVENT]: true, // 多文件添加事件：标记为true表示需要过滤
        [UPLOAD_START_EVENT]: 'uploadStart' // 上传开始事件：映射到uploadStart方法
      }

      const handler = EVENTSMAP[name]
      if (handler) {
        if (handler === true) {
          // 标记为true的事件不需要额外处理，直接返回
          return
        }
        // 调用映射的处理方法
        this[handler].apply(this, args.slice(1))
      }

      // 将事件名转换为kebab-case格式并触发Vue事件
      args[0] = kebabCase(name)
      this.$emit.apply(this, args)
    }
  },
  created() {
    // 创建uploader实例，配置初始暂停状态
    const options = { ...this.options, initialPaused: !this.autoStart }
    const uploader = new Uploader(options)
    this.uploader = uploader
    this.uploader.fileStatusText = this.fileStatusText

    // 注册事件监听器
    uploader.on('catchAll', this.allEvent)
    uploader.on(FILE_ADDED_EVENT, this.fileAdded)
    uploader.on(FILES_ADDED_EVENT, this.filesAdded)
    uploader.on('fileRemoved', this.fileRemoved)
    uploader.on('filesSubmitted', this.filesSubmitted)
  },
  unmounted() {
    // 组件销毁时移除所有事件监听器，避免内存泄漏
    const uploader = this.uploader
    uploader.off('catchAll', this.allEvent)
    uploader.off(FILE_ADDED_EVENT, this.fileAdded)
    uploader.off(FILES_ADDED_EVENT, this.filesAdded)
    uploader.off('fileRemoved', this.fileRemoved)
    uploader.off('filesSubmitted', this.filesSubmitted)
    this.uploader = null
  },
  components: {
    UploaderBtn,
    UploaderDrop,
    UploaderUnsupport,
    UploaderList
    // UploaderFiles,
    // UploaderFile
  }
}
</script>

<style>
.uploader {
  position: relative;
}
</style>
