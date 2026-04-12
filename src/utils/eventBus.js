/**
 * 事件总线
 * @description 用于组件间的通信，替代 Vue 2 的全局事件总线
 * @module utils/eventBus
 */

class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * 监听事件
   * @param {String} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  /**
   * 移除事件监听
   * @param {String} event - 事件名称
   * @param {Function} [callback] - 回调函数（可选，如果不提供则移除该事件的所有监听）
   */
  off(event, callback) {
    if (!this.events[event]) return

    if (!callback) {
      delete this.events[event]
      return
    }

    const index = this.events[event].indexOf(callback)
    if (index !== -1) {
      this.events[event].splice(index, 1)
    }
  }

  /**
   * 触发事件
   * @param {String} event - 事件名称
   * @param {...any} args - 传递给回调函数的参数
   */
  emit(event, ...args) {
    if (!this.events[event]) return

    this.events[event].forEach(callback => {
      callback(...args)
    })
  }

  /**
   * 监听一次性事件
   * @param {String} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
}

const eventBus = new EventBus()

window.eventBus = eventBus

export default eventBus
