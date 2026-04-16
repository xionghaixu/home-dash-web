<template>
  <el-dialog :title="title" v-model="dialogVisible" width="40%">
    <el-tree
      :props="props"
      :load="loadNode"
      node-key="id"
      lazy
      ref="tree"
      check-strictly
      show-checkbox
      @check="handleNodeCheck"
    ></el-tree>
    <div v-if="conflictFiles.length > 0" class="conflict-warning">
      <el-alert type="warning" :closable="false" show-icon>
        <template #title>
          检测到目标目录存在以下同名文件：
        </template>
      </el-alert>
      <ul class="conflict-list">
        <li v-for="file in conflictFiles" :key="file.id" class="conflict-item">
          <el-icon><Warning /></el-icon>
          <span class="conflict-name">{{ file.fileName }}</span>
          <span class="conflict-size">({{ formatSize(file.size) }})</span>
        </li>
      </ul>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('return', { type: 'cancel' })">取 消</el-button>
        <el-button type="primary" :disabled="selectedKeys.length === 0" @click="submit">
          确 定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
/**
 * FolderTreeDialog 组件 - 文件夹选择对话框组件
 * @description 提供文件夹树形选择功能，用于文件移动和复制操作时选择目标文件夹
 * @component
 * @example
 * <folder-tree-dialog
 *   title="移动到"
 *   :sourceFiles="selectedFiles"
 *   @return="handleReturn"
 * ></folder-tree-dialog>
 */
import { getFileList } from '@/apis/file'
import { Warning } from '@element-plus/icons-vue'
import { formatSize } from '@/utils'

export default {
  name: 'FolderTreeDialog',
  components: { Warning },
  props: {
    title: {
      type: String,
      default: '提示'
    },
    sourceFiles: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      dialogVisible: true,
      props: {
        label: 'fileName'
      },
      selectedKeys: [],
      conflictFiles: []
    }
  },
  methods: {
    formatSize,
    /**
     * 加载树节点
     * @description 懒加载文件夹树节点，只显示文件夹类型
     * 实现逻辑：
     * 1. 根节点显示"全部文件"
     * 2. 子节点从服务器加载，过滤出文件夹类型
     * 3. 排除源文件，避免移动到自身或子文件夹
     * @param {Object} node - 树节点对象
     * @param {Number} node.level - 节点层级（0为根节点）
     * @param {Object} node.data - 节点数据
     * @param {Function} resolve - 解析函数，用于返回子节点数据
     */
    loadNode(node, resolve) {
      // 根节点：显示"全部文件"作为顶级节点
      if (node.level === 0) {
        return resolve([{ fileName: '全部文件', id: 0 }])
      }

      // 子节点：从服务器加载文件夹列表
      getFileList(node.data.id)
        .then(response => {
          // 过滤出文件夹类型，并排除源文件（避免移动到自身）
          const r = response.data.filter(
            f => f.type === 'folder' && !this.contains(this.sourceFiles, f)
          )
          resolve(r)
        })
        .catch(() => {})
    },
    /**
     * 处理节点选择
     * @description 当选择目标文件夹时，检测是否有同名文件
     */
    handleNodeCheck(data, checked) {
      this.selectedKeys = checked.checkedKeys.filter(id => id !== 0)
      if (this.selectedKeys.length === 1) {
        this.checkConflict(this.selectedKeys[0])
      } else {
        this.conflictFiles = []
      }
    },
    /**
     * 检测同名冲突
     * @description 获取目标文件夹的文件列表，检查是否有与源文件同名的文件
     */
    checkConflict(targetFolderId) {
      const sourceNames = this.sourceFiles.map(f => f.fileName)
      if (sourceNames.length === 0) {
        this.conflictFiles = []
        return
      }

      getFileList(targetFolderId)
        .then(response => {
          this.conflictFiles = response.data.filter(
            f => sourceNames.includes(f.fileName) && !this.contains(this.sourceFiles, f)
          )
        })
        .catch(() => {
          this.conflictFiles = []
        })
    },
    /**
     * 提交选择
     * @description 触发return事件，返回选中的文件夹ID和冲突文件信息
     */
    submit() {
      if (this.selectedKeys.length === 0) {
        return
      }
      this.$emit('return', {
        type: 'submit',
        value: this.selectedKeys,
        conflicts: this.conflictFiles
      })
    },
    /**
     * 检查源文件是否包含目标文件
     * @description 判断目标文件是否在源文件列表中，避免移动到自身
     * 使用场景：移动文件夹时，不能将文件夹移动到自身或其子文件夹中
     * @param {Array} sourceFiles - 源文件数组
     * @param {Object} targetFile - 目标文件对象
     * @returns {Boolean} 是否包含目标文件（true表示包含，应排除）
     */
    contains(sourceFiles, targetFile) {
      for (let i = 0; i < sourceFiles.length; i++) {
        if (sourceFiles[i].id === targetFile.id) {
          return true
        }
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.conflict-warning {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-warning-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-warning);

  :deep(.el-alert) {
    background: transparent;
    padding: 0;

    .el-alert__title {
      font-weight: var(--font-weight-medium);
    }
  }
}

.conflict-list {
  list-style: none;
  margin: var(--spacing-md) 0 0;
  padding: 0;
}

.conflict-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  color: var(--color-warning-dark);

  .el-icon {
    color: var(--color-warning);
  }
}

.conflict-name {
  font-weight: var(--font-weight-medium);
}

.conflict-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
