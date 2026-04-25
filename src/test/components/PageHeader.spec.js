import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from '@/components/PageHeader.vue'

describe('PageHeader', () => {
  describe('渲染测试', () => {
    it('应正确渲染标题', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试标题' }
      })
      expect(wrapper.find('.page-header__title').text()).toBe('测试标题')
    })

    it('应正确渲染副标题', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '主标题', subtitle: '副标题内容' }
      })
      expect(wrapper.find('.page-header__subtitle').text()).toBe('副标题内容')
    })

    it('不应渲染副标题当未提供', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '主标题' }
      })
      expect(wrapper.find('.page-header__subtitle').exists()).toBe(false)
    })

    it('应包含page-header类名', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' }
      })
      expect(wrapper.find('.page-header').exists()).toBe(true)
    })
  })

  describe('边框样式测试', () => {
    it('默认应添加边框样式', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' }
      })
      expect(wrapper.find('.page-header').classes()).toContain('page-header--bordered')
    })

    it('bordered为false时应移除边框样式', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试', bordered: false }
      })
      expect(wrapper.find('.page-header').classes()).not.toContain('page-header--bordered')
    })

    it('bordered为true时应添加边框样式', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试', bordered: true }
      })
      expect(wrapper.find('.page-header').classes()).toContain('page-header--bordered')
    })
  })

  describe('插槽测试', () => {
    it('应正确渲染actions插槽', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' },
        slots: {
          actions: '<button>操作按钮</button>'
        }
      })
      expect(wrapper.find('.page-header__actions button').exists()).toBe(true)
      expect(wrapper.find('.page-header__actions button').text()).toBe('操作按钮')
    })

    it('当actions插槽为空时不应渲染actions区域', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' }
      })
      expect(wrapper.find('.page-header__actions').exists()).toBe(false)
    })

    it('应支持多个操作按钮', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' },
        slots: {
          actions: '<button>按钮1</button><button>按钮2</button>'
        }
      })
      expect(wrapper.findAll('.page-header__actions button')).toHaveLength(2)
    })
  })

  describe('Props验证', () => {
    it('title是必需属性', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(PageHeader)
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })

    it('subtitle应有默认值', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' }
      })
      expect(wrapper.props().subtitle).toBe('')
    })

    it('bordered应有默认值', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' }
      })
      expect(wrapper.props().bordered).toBe(true)
    })
  })

  describe('布局结构测试', () => {
    it('应包含左侧区域', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试' }
      })
      expect(wrapper.find('.page-header__left').exists()).toBe(true)
    })

    it('标题应在左侧区域内', () => {
      const wrapper = mount(PageHeader, {
        props: { title: '测试标题' }
      })
      const leftArea = wrapper.find('.page-header__left')
      expect(leftArea.find('.page-header__title').text()).toBe('测试标题')
    })
  })
})
