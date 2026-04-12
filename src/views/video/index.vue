<template>
  <el-container class="app-container">
    <el-header height="50px">
      <Header :aside-visible="false"></Header>
    </el-header>
    <el-container>
      <el-main>
        <div class="video-container">
          <div class="header">
            <div class="video-title">
              {{ title }}
            </div>
            <div class="other">
              <el-link type="primary" @click="download">下载</el-link>
            </div>
          </div>
          <div class="video-content">
            <video
              ref="videoPlayer"
              controls
              class="video-player"
              :src="videoSrc"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
/**
 * VideoPlayer 组件 - 视频播放页面
 * @description 使用HTML5原生video播放器播放视频文件，支持视频下载功能
 * @component
 * @example
 * <video-player :fileId="videoFileId"></video-player>
 */
import { ref, onMounted } from 'vue'
import Header from '@/views/layout/Header.vue'
import { getFile, downloadFileUrl } from '@/apis/file'

// Props
const props = defineProps({
  fileId: {
    type: String,
    required: true
  }
})

// 响应式数据
const title = ref('')
const videoSrc = ref(downloadFileUrl(props.fileId))
const videoPlayer = ref(null)

/**
 * 下载视频文件
 * @description 创建一个隐藏的a标签来触发视频文件下载
 */
const download = () => {
  const tag = document.createElement('a')
  tag.setAttribute('href', downloadFileUrl(props.fileId))
  tag.click()
}

// 生命周期钩子
onMounted(() => {
  getFile(props.fileId)
    .then(response => {
      title.value = response.data.fileName
    })
    .catch(() => {})
})
</script>

<style lang="scss" scoped>
@import '@/styles/layout.scss';
.video-container {
  width: 980px;
  height: 100%;
  margin: 0 auto;
  .header {
    height: 50px;
    line-height: 50px;
    display: flex;
    justify-content: space-between;
  }
  .video-content {
    width: 980px;
    .video-player {
      width: 100%;
      max-height: 600px;
      background-color: #000;
    }
  }
}
</style>
