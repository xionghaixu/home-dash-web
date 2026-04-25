// Mock Element Plus to prevent CSS imports
import { defineComponent, h } from 'vue'

const ElIcon = defineComponent({
  name: 'ElIcon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon' }, slots.default?.())
  }
})

const elementPlus = {
  ElIcon
}

export default elementPlus