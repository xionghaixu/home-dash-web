<template>
  <el-main>
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="box">
          <div class="info-header">磁盘</div>
          <div class="info-body clearfix">
            <div class="border-right col-3">
              <span class="info-body-header">系统总容量</span>
              <br />
              <span class="text-primary">{{ totalCap }}</span>
              <span class="mark">GB</span>
            </div>
            <div class="border-right col-3">
              <span class="info-body-header">已使用</span>
              <br />
              <span class="text-success">{{ usedCap }}</span>
              <span class="mark">GB</span>
            </div>
            <div class="col-3">
              <span class="info-body-header">剩余</span>
              <br />
              <span class="text-success">{{ freeCap }}</span>
              <span class="mark">GB</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="info-row" :gutter="20">
      <el-col :span="24">
        <div class="box">
          <div class="info-header">系统文件信息</div>
          <div class="info-body clearfix">
            <div class="border-right col-3">
              <span class="info-body-header">文件与文件夹数</span>
              <br />
              <span class="text-primary">{{ totalNum }}</span>
            </div>
            <div class="border-right col-3">
              <span class="info-body-header">文件夹数</span>
              <br />
              <span class="text-success">{{ folderNum }}</span>
            </div>
            <div class="col-3">
              <span class="info-body-header">文件数</span>
              <br />
              <span class="text-success">{{ fileNum }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="info-row" :gutter="20">
      <el-col :span="8">
        <div class="box">
          <div class="info-header">视频数</div>
          <div class="info-body clearfix">
            <span class="text-success">{{ videoNum }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="box">
          <div class="info-header">音频数</div>
          <div class="info-body clearfix">
            <span class="text-success">{{ audioNum }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="box">
          <div class="info-header">其他文件数</div>
          <div class="info-body clearfix">
            <span class="text-success">{{ otherNum }}</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup>
/**
 * SystemInfo 组件 - 系统信息页面
 * @description 展示系统磁盘容量、文件统计等信息
 * @component
 */
import { ref, onMounted } from 'vue'
import { systemInfo } from '@/apis/system'

// 响应式数据
const totalCap = ref(0)
const usedCap = ref(0)
const freeCap = ref(0)
const totalNum = ref(0)
const folderNum = ref(0)
const fileNum = ref(0)
const videoNum = ref(0)
const audioNum = ref(0)
const otherNum = ref(0)

/**
 * 格式化容量为GB单位
 * @description 将字节数转换为GB单位的字符串
 * 转换公式：GB = Bytes / 1024 / 1024 / 1024
 * @param {Number} size - 文件大小（字节）
 * @param {Number} pointLength - 小数点后保留位数，默认为2
 * @returns {String} 格式化后的容量字符串，如 "256.78"
 */
const formatToGB = (size, pointLength) => {
  if (size) {
    // 将字节转换为GB：1GB = 1024^3 Bytes
    const result = size / 1024 / 1024 / 1024
    return result.toFixed(pointLength || 2)
  }
  return '-'
}

// 生命周期钩子
onMounted(() => {
  // 获取系统信息并更新页面数据
  systemInfo()
    .then(response => {
      // 格式化磁盘容量数据（转换为GB单位）
      totalCap.value = formatToGB(response.data.totalCap, 2)
      usedCap.value = formatToGB(response.data.totalCap - response.data.usableCap, 2)
      freeCap.value = formatToGB(response.data.usableCap, 2)

      // 更新文件统计信息
      totalNum.value = response.data.totalNum
      folderNum.value = response.data.folderNum
      fileNum.value = response.data.fileNum
      videoNum.value = response.data.videoNum
      audioNum.value = response.data.audioNum

      // 计算其他文件数：总文件数 - 视频数 - 音频数
      otherNum.value = response.data.fileNum - response.data.videoNum - response.data.audioNum
    })
    .catch(() => {})
})
</script>

<style lang="scss" scoped>
.el-main {
  font-size: 16px;
  font-weight: 300;
}
.info-row {
  padding-top: 30px;
}
.box {
  border: 1px solid #dddddd;
  text-align: center;
}
.info-header {
  color: #333333;
  background-color: #f9f9f9;
  height: 30px;
  line-height: 30px;
}
.info-body {
  padding: 10px 0;
  .info-body-header {
    font-size: 14px;
  }
}
.col-3 {
  float: left;
  width: 33%;
}
.col-2 {
  float: left;
  width: 49%;
}
.text-primary {
  color: #09c !important;
  font-size: 30px;
  cursor: pointer;
}
.text-success {
  color: #090 !important;
  font-size: 30px;
  cursor: pointer;
}
.text-warn {
  color: red !important;
  font-size: 30px;
  cursor: pointer;
}
.border-right {
  border-right: 1px solid #dddddd;
}
.clearfix {
  clear: both;
}
.clearfix:after {
  content: '020';
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
.mark {
  font-size: 18px;
  padding-left: 5px;
}
</style>
