<template>
  <div class="file-list-container">
    <div class="operater">
      <el-button type="primary" :icon="Upload" @click="uploadFileTrigger">
        上传文件
      </el-button>
      <el-button :icon="FolderAdd" plain @click="createFolder">新增文件夹</el-button>
      <el-button-group class="extend-btn">
        <el-button
          :icon="Edit"
          v-if="selection.length === 1"
          @click="renameFile(selection[0])"
          plain
        >
          重命名
        </el-button>
        <el-button
          :icon="Download"
          v-if="canDownload()"
          @click="downloadFiles(selection)"
          plain
        >
          下载
        </el-button>
        <el-button
          :icon="Delete"
          v-if="selection.length > 0"
          plain
          @click="deleteFiles(selection)"
        >
          删除
        </el-button>
        <el-button plain v-if="selection.length > 0" @click="moveTo(selection)">移动到</el-button>
        <el-button plain v-if="selection.length > 0" @click="copyTo(selection)">复制到</el-button>
      </el-button-group>
    </div>
    <div class="navigation">
      <div class="previous-level" v-if="navigation.length > 1">
        <router-link :to="'/folder/' + navigation[navigation.length - 2].id">
          <span>返回上一级</span>
        </router-link>
        <span class="navigation-separator">|</span>
      </div>
      <div class="breadcrumb">
        <div
          class="breadcrumb-item"
          v-for="(nav, index) in navigation"
          :key="'navigation-' + index"
        >
          <router-link :to="'/folder/' + nav.id">
            <span class="breadcrumb-name">{{ nav.fileName }}</span>
          </router-link>
          <span class="navigation-separator" v-if="index !== navigation.length - 1">/</span>
        </div>
      </div>
    </div>
    <div class="file-list">
      <el-table
        :data="fileList"
        style="width: 100%"
        height="100%"
        :default-sort="{ prop: 'fileName', order: 'ascending' }"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" show-overflow-tooltip min-width="2"></el-table-column>
        <el-table-column
          prop="fileName"
          label="文件名"
          sortable
          show-overflow-tooltip
          min-width="33"
        >
          <template #default="scope">
            <div class="file-icon" :class="getFileType(scope.row.type)"></div>
            <router-link
              class="file-name"
              :to="'/folder/' + scope.row.id"
              v-if="getFileType(scope.row.type) === 'folder'"
            >
              {{ scope.row.fileName }}
            </router-link>
            <router-link
              target="_blank"
              class="file-name"
              :to="'/video/' + scope.row.id"
              v-else-if="getFileType(scope.row.type) === 'video'"
            >
              {{ scope.row.fileName }}
            </router-link>
            <router-link class="file-name" to="" v-else>{{ scope.row.fileName }}</router-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="size"
          label="大小"
          sortable
          :formatter="sizeFormatter"
          min-width="12"
        ></el-table-column>
        <el-table-column
          prop="updateTime"
          label="修改日期"
          sortable
          show-overflow-tooltip
          :formatter="dateFormatter"
          min-width="22"
        ></el-table-column>
        <el-table-column min-width="15" label="操作">
          <template #default="scope">
            <el-dropdown>
              <span>
                <el-icon><More /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="moveTo([scope.row])">移动到</el-dropdown-item>
                  <el-dropdown-item @click="copyTo([scope.row])">复制到</el-dropdown-item>
                  <el-dropdown-item @click="renameFile(scope.row)">重命名</el-dropdown-item>
                  <el-dropdown-item
                    @click="downloadFiles([scope.row])"
                    v-if="getFileType(scope.row.type) != 'folder'"
                  >
                    下载
                  </el-dropdown-item>
                  <el-dropdown-item @click="deleteFiles([scope.row])">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <FolderTreeDialog v-if="folderTreeVisible" v-bind="folderTreeProps" @return="dealReturn" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, FolderAdd, Edit, Download, Delete, More } from '@element-plus/icons-vue'
import {
  getFileList,
  createFile,
  renameFile as renameFileApi,
  deleteFiles as deleteFilesApi,
  moveOrCopyFiles,
  downloadFileUrl
} from '@/apis/file'
import { formatSize, formatDateTime } from '@/utils'
import FolderTreeDialog from '@/components/FolderTreeDialog.vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  folderId: {
    type: [String, Number],
    required: true
  }
})

const store = useAppStore()

const folderTreeVisible = ref(false)
const folderTreeProps = ref({
  type: 'move',
  title: '提示',
  sourceFiles: []
})
const fileList = ref([])
const navigation = ref([])
const selection = ref([])

const uploadFileTrigger = () => {
  window.eventBus.emit('openUploader')
}

const renderFileList = () => {
  getFileList(props.folderId)
    .then(response => {
      fileList.value = response.data
      navigation.value = response.extra
    })
    .catch(() => {})
}

const createFolder = () => {
  ElMessageBox.prompt('请输入文件夹名', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{1,100}$/,
    inputErrorMessage: '文件夹名长度必须小于100'
  })
    .then(({ value }) => {
      createFile(props.folderId, value, 'folder')
        .then(() => {
          ElMessage.success('创建成功')
          renderFileList()
        })
        .catch(error => {
          if (error.data) {
            ElMessage.error(error.data.msg)
          }
        })
    })
    .catch(() => {})
}

const renameFile = (row) => {
  ElMessageBox.prompt('请输入文件夹名', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{1,100}$/,
    inputValue: row.fileName,
    inputErrorMessage: '文件夹名长度必须小于100'
  })
    .then(({ value }) => {
      renameFileApi(row.id, value)
        .then(() => {
          ElMessage.success('文件重命名成功')
          renderFileList()
        })
        .catch(error => {
          if (error.data) {
            ElMessage.error(error.data.msg)
          }
        })
    })
    .catch(() => {})
}

const deleteFiles = (arr) => {
  const ids = arr.map(f => f.id)
  ElMessageBox.confirm('确定删除文件?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteFilesApi(ids)
        .then(() => {
          ElMessage.success('文件删除成功')
          renderFileList()
        })
        .catch(() => {
          ElMessage.error('文件删除失败')
          renderFileList()
        })
    })
    .catch(() => {})
}

const moveTo = (arr) => {
  folderTreeProps.value = {
    type: 'move',
    title: '移动到',
    sourceFiles: arr
  }
  nextTick(() => {
    folderTreeVisible.value = true
  })
}

const copyTo = (arr) => {
  folderTreeProps.value = {
    type: 'copy',
    title: '复制到',
    sourceFiles: arr
  }
  nextTick(() => {
    folderTreeVisible.value = true
  })
}

const dealReturn = (val) => {
  if (val.type === 'cancel') {
    folderTreeVisible.value = false
    return
  } else {
    const arr = val.value
    const sourceIds = folderTreeProps.value.sourceFiles.map(f => f.id)

    const operate = (sourceIds, targetIds, type, successCallback) => {
      moveOrCopyFiles(sourceIds, targetIds, type)
        .then(() => {
          successCallback()
          folderTreeVisible.value = false
          renderFileList()
        })
        .catch(() => {})
    }

    if (folderTreeProps.value.type === 'move') {
      if (arr.length !== 1) {
        ElMessage.error('必须选择一个目标文件夹')
      } else {
        operate(sourceIds, arr, 'move', () => {
          ElMessage.success('移动文件成功')
        })
      }
    } else if (folderTreeProps.value.type === 'copy') {
      if (arr.length !== 1) {
        ElMessage.error('请选择文件夹')
      } else {
        operate(sourceIds, arr, 'copy', () => {
          ElMessage.success('复制文件成功')
        })
      }
    }
  }
}

const handleSelectionChange = (val) => {
  selection.value = val
}

const handleSortChange = ({ prop, order }) => {
  if (prop && order) {
    getFileList(props.folderId, {
      sortBy: prop,
      sortOrder: order === 'ascending' ? 'asc' : 'desc'
    })
      .then(response => {
        fileList.value = response.data
      })
      .catch(() => {})
  }
}

const canDownload = () => {
  let hasFolder = false
  for (let i = 0; i < selection.value.length; i++) {
    if (selection.value[i].type === 'folder') {
      hasFolder = true
      break
    }
  }
  return !hasFolder && selection.value.length > 0
}

const downloadFiles = (arr = []) => {
  if (arr.length === 0) return

  const download = (url) => {
    const tag = document.createElement('a')
    tag.setAttribute('href', url)
    tag.click()
  }

  let index = 0
  download(downloadFileUrl(arr[index].id))
  index++

  const interval = setInterval(() => {
    if (index < arr.length) {
      download(downloadFileUrl(arr[index].id))
      index++
    } else {
      clearInterval(interval)
    }
  }, 2000)
}

const FILE_TYPE_ICONS = new Set([
  'default',
  'folder',
  'pdf',
  'compress_file',
  'web',
  'video',
  'audio',
  'picture',
  'doc',
  'txt',
  'torrent',
  'ppt',
  'code'
])

const getFileType = (originType) => {
  return FILE_TYPE_ICONS.has(originType) ? originType : 'default'
}

const sizeFormatter = (row) => {
  const size = formatSize(row.size, 2)
  if (row.type === 'folder' || size === undefined) {
    return '-'
  }
  return size
}

const dateFormatter = (row) => {
  return formatDateTime(row.updateTime)
}

watch(() => props.folderId, () => {
  store.setFolderId(props.folderId)
  renderFileList()
})

onMounted(() => {
  renderFileList()
  window.eventBus.on('flushFileList', query => {
    renderFileList()
  })
})

onUnmounted(() => {
  window.eventBus.off('flushFileList')
})
</script>

<style lang="scss" scoped>
.file-list-container {
  height: 100%;
  position: relative;
  a {
    color: #000;
    text-decoration: none;
    &:visited {
      color: #000;
    }
    &:hover {
      color: #3794ff;
    }
  }
  .extend-btn {
    margin-left: 30px;
  }
  .navigation {
    font-size: 14px;
    font-weight: 450;
    margin: 10px 0px;
    .previous-level {
      cursor: pointer;
      display: inline-block;
      span:first-child:hover {
        color: #3794ff;
      }
    }
    .breadcrumb,
    .breadcrumb-item {
      display: inline-block;
      .breadcrumb-name {
        cursor: pointer;
        &:hover {
          color: #3794ff;
        }
      }
    }
    .navigation-separator {
      padding: 0 5px;
    }
  }
  .file-list {
    width: 100%;
    position: absolute;
    top: 70px;
    left: 0;
    bottom: 0;
  }
}
.el-icon {
  cursor: pointer;
  font-size: 18px;
  &:hover {
    color: #3794ff;
  }
}
.file-icon {
  display: inline-block;
  background-image: url(../../assets/file_icons.png);
  background-repeat: no-repeat;
  width: 26px;
  height: 23px;
}
.file-name {
  display: inline-block;
  padding-left: 8px;
  text-decoration: none;
  color: #000;
  cursor: pointer;
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
  background-position: -596px 0px;
}
.web {
  background-position: -594px -1458px;
}
.code {
  background-position: -596px -1424px;
}
</style>
