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
    ></el-tree>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('return', { type: 'cancel' })">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
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

export default {
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
      }
    }
  },
  methods: {
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
     * 提交选择
     * @description 触发return事件，返回选中的文件夹ID
     */
    submit() {
      this.$emit('return', {
        type: 'submit',
        value: this.$refs.tree.getCheckedKeys()
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
