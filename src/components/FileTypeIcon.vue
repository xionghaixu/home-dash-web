<template>
  <span class="file-icon" :class="iconType" />
</template>

<script setup>
import { computed } from 'vue'
import { getFileIconType } from '@/utils/file'

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  }
})

const iconType = computed(() => getFileIconType(props.type))
</script>

<style lang="scss" scoped>
.file-icon {
  display: inline-block;
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
</style>
