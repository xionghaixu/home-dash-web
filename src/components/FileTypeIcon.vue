<template>
  <span class="file-icon" :class="[iconType, { colorful: isColorful }]" :style="iconStyle">
    <el-icon v-if="isColorful" :size="22"><component :is="iconComponent" /></el-icon>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getFileIconType } from '@/utils/file'
import { useThemeStore } from '@/stores/theme'
import {
  Folder,
  Document,
  VideoCamera,
  Microphone,
  Picture,
  Files,
  ChatDotRound,
  Box,
  Monitor,
  Tools
} from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  }
})

const themeStore = useThemeStore()
const iconType = computed(() => getFileIconType(props.type))

/** 文件类型到图标组件的映射 */
const iconComponentMap = {
  folder: Folder,
  picture: Picture,
  video: VideoCamera,
  audio: Microphone,
  doc: Files,
  txt: ChatDotRound,
  pdf: Document,
  compress_file: Box,
  web: Monitor,
  code: Tools
}

/** 是否使用彩色图标 */
const isColorful = computed(() => themeStore.colorfulIcon && iconComponentMap[props.type])

/** 图标组件 */
const iconComponent = computed(() => iconComponentMap[props.type] || Document)

/** 彩色模式下的图标颜色 */
const iconColorMap = {
  folder: '#FFA726',
  picture: '#42A5F5',
  video: '#EF5350',
  audio: '#AB47BC',
  doc: '#26A69A',
  txt: '#78909C',
  pdf: '#EC407A',
  compress_file: '#8D6E63',
  web: '#5C6BC0',
  code: '#7E57C2'
}

const iconStyle = computed(() => {
  if (isColorful.value) {
    return { color: iconColorMap[props.type] || 'var(--color-primary)' }
  }
  return {}
})
</script>

<style lang="scss" scoped>
.file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 26px;
  height: 23px;
  background-image: url('../assets/file_icons.png');
  background-repeat: no-repeat;
}

.default {
  background-position: -596px -566px;
}

.folder {
  background-position: -594px -862px;
}

.pdf {
  background-position: -596px -136px;
}

.compress_file {
  background-position: -596px -1664px;
}

.video {
  background-position: -596px -1630px;
}

.audio {
  background-position: -596px -442px;
}

.picture {
  background-position: -596px -306px;
}

.doc {
  background-position: -596px -170px;
}

.txt {
  background-position: -596px -102px;
}

.ppt {
  background-position: -596px -204px;
}

.torrent {
  background-position: -596px 0;
}

.web {
  background-position: -594px -1458px;
}

.code {
  background-position: -596px -1424px;
}

/* 彩色图标模式 */
.colorful {
  background-image: none;
  width: 24px;
  height: 24px;
}
</style>
