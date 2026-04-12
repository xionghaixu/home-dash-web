<template>
  <div class="global-uploader">
    <Uploader
      :options="options"
      ref="uploaderFile"
      :auto-start="true"
      class="uploader-app"
      :file-status-text="statusText"
      @file-added="onFileAdded"
      @file-progress="onFileProgress"
      @file-success="onFileSuccess"
      @file-error="onFileError"
    >
      <UploaderUnsupport></UploaderUnsupport>
      <UploaderBtn id="global-uploader-btn" ref="uploadFileBtn">选择文件</UploaderBtn>

      <UploaderList v-show="panelShow">
        <template #default="props">
          <div class="file-panel" :class="{ collapse: collapse }">
          <div class="file-title">
            <span>上传文件列表</span>
            <div class="operate">
              <el-button @click="fileListShow" text :title="collapse ? '展开' : '折叠'">
                <el-icon><component :is="collapse ? FullScreen : Minus" /></el-icon>
              </el-button>
              <el-button @click="close" text title="关闭">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>

          <ul class="file-list" v-if="!collapse">
            <li v-for="file in props.fileList" :key="file.id">
              <UploaderFile
                :class="'file_' + file.id"
                ref="files"
                :file="file"
                :list="true"
              ></UploaderFile>
            </li>
            <div class="no-file" v-if="!props.fileList.length">
              <el-icon><Folder /></el-icon>
              暂无待上传文件
            </div>
          </ul>
        </div>
        </template>
      </UploaderList>
    </Uploader>
  </div>
</template>

<script>
import Uploader from './uploader/Uploader.vue'
import UploaderUnsupport from './uploader/Unsupport.vue'
import UploaderBtn from './uploader/Btn.vue'
import UploaderList from './uploader/List.vue'
import UploaderFile from './uploader/File.vue'
import { resourceUploadUrl, mergeResource } from '@/apis/resource'
import { useAppStore } from '@/stores/app'
import { FullScreen, Minus, Close, Folder } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  components: {
    Uploader,
    UploaderUnsupport,
    UploaderBtn,
    UploaderList,
    UploaderFile,
    FullScreen,
    Minus,
    Close,
    Folder
  },
  props: {
    parentId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      store: useAppStore(),
      fileMap: {},
      options: {
        target: resourceUploadUrl(),
        chunkSize: '2048000',
        fileParameterName: 'file',
        maxChunkRetries: 3,
        testChunks: true,
        simultaneousUploads: 3
      },
      statusText: {
        success: '成功了',
        error: '出错了',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中'
      },
      panelShow: false,
      collapse: false
    }
  },
  computed: {
    uploader() {
      return this.$refs.uploaderFile.uploader
    }
  },
  methods: {
    onFileAdded() {
      this.fileMap[arguments[0].uniqueIdentifier] = this.store.folderId
      this.panelShow = true
    },
    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      )
    },
    onFileSuccess() {
      const file = arguments[0].file,
        resource = {
          fileName: file.name,
          size: file.size,
          identifier: arguments[0].uniqueIdentifier,
          parentId: this.fileMap[arguments[0].uniqueIdentifier]
        }
      mergeResource(resource)
        .then(() => {
          window.eventBus.emit('flushFileList', this.fileMap[arguments[0].uniqueIdentifier])
        })
        .catch(() => {
          ElMessage.error('文件合并失败，请重新上传')
        })
    },
    onFileError() {},
    fileListShow() {
      this.collapse = !this.collapse
    },
    close() {
      this.uploader.cancel()
      this.panelShow = false
    }
  },
  mounted() {
    window.eventBus.on('openUploader', query => {
      this.params = query || {}
      if (this.$refs.uploadFileBtn) {
        this.$refs.uploadFileBtn.$el.click()
      }
    })
  },
  unmounted() {
    window.eventBus.off('openUploader')
  }
}
</script>

<style lang="scss" scoped>
.global-uploader {
  position: fixed;
  z-index: 200;
  right: 15px;
  bottom: 5px;

  .uploader-app {
    width: 520px;
  }

  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      font-size: 14px;
      border-bottom: 1px solid #ddd;

      .operate {
        flex: 1;
        text-align: right;
      }
    }

    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;

      > li {
        background-color: #fff;
      }
    }

    &.collapse {
      .file-title {
        background-color: #e7ecf2;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  .uploader-file-icon {
    &:before {
      content: '' !important;
    }

    &[icon='image'] {
      background-image: url(../assets/file_icons.png);
      background-position: -596px -306px;
    }
    &[icon='video'] {
      background: url(../assets/file_icons.png) !important;
      background-position: -596px -1630px !important;
    }
    &[icon='document'] {
      background: url(../assets/text-icon.png);
    }
  }

  .uploader-file-actions > span {
    margin-right: 6px;
  }
}

#global-uploader-btn {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}
</style>
