import { defineStore } from 'pinia'

/**
 * 应用状态管理
 * @description 管理应用的全局状态，包括当前文件夹ID等
 */
export const useAppStore = defineStore('app', {
  /**
   * 状态
   * @returns {Object} 状态对象
   */
  state: () => ({
    folderId: '0',
    transferCount: 0
  }),

  /**
   * 计算属性
   */
  getters: {
    /**
     * 获取当前文件夹ID
     * @param {Object} state - 状态对象
     * @returns {String} 当前文件夹ID
     */
    currentFolderId: state => state.folderId
  },

  /**
   * 操作方法
   */
  actions: {
    setFolderId(id) {
      if (id === undefined || id === null) {
        return
      }
      this.folderId = String(id)
    },
    setTransferCount(count) {
      this.transferCount = count
    },
    incrementTransferCount() {
      this.transferCount++
    },
    decrementTransferCount() {
      if (this.transferCount > 0) {
        this.transferCount--
      }
    }
  }
})
