import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataCard from '@/components/DataCard.vue'

describe('DataCard', () => {
  describe('渲染测试', () => {
    it('应正确渲染标签', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试标签', value: 100 }
      })
      expect(wrapper.find('.data-card__label').text()).toBe('测试标签')
    })

    it('应正确渲染数值', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 1000 }
      })
      expect(wrapper.find('.data-card__value').text()).toBe('1,000')
    })

    it('应正确渲染额外信息', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, extra: '额外信息' }
      })
      expect(wrapper.find('.data-card__extra').text()).toBe('额外信息')
    })

    it('应正确处理空额外信息', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, extra: '' }
      })
      expect(wrapper.find('.data-card__extra').exists()).toBe(false)
    })

    it('不应渲染图标当icon未提供', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100 }
      })
      expect(wrapper.find('.data-card__icon').exists()).toBe(false)
    })
  })

  describe('类型变体测试', () => {
    it.each(['primary', 'success', 'warning', 'danger', 'info'])(
      '应正确应用%s类型样式',
      (type) => {
        const wrapper = mount(DataCard, {
          props: { label: '测试', value: 100, type }
        })
        expect(wrapper.find('.data-card').classes()).toContain(`data-card--${type}`)
      }
    )
  })

  describe('可点击状态测试', () => {
    it('默认不可点击', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100 }
      })
      expect(wrapper.find('.data-card').classes()).not.toContain('data-card--clickable')
    })

    it('当clickable为true时应添加点击样式', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, clickable: true }
      })
      expect(wrapper.find('.data-card').classes()).toContain('data-card--clickable')
    })

    it('点击时应触发click事件', async () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, clickable: true }
      })
      await wrapper.find('.data-card').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('不可点击状态不应触发click事件', async () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, clickable: false }
      })
      await wrapper.find('.data-card').trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('数值格式化测试', () => {
    it('应正确格式化千位分隔符', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 1234567 }
      })
      expect(wrapper.find('.data-card__value').text()).toBe('1,234,567')
    })

    it('应正确添加前缀', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, prefix: '$' }
      })
      expect(wrapper.find('.data-card__value').text()).toBe('$100')
    })

    it('应正确添加后缀', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100, suffix: '%' }
      })
      expect(wrapper.find('.data-card__value').text()).toBe('100%')
    })

    it('应正确处理字符串数值', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 'abc' }
      })
      expect(wrapper.find('.data-card__value').text()).toBe('abc')
    })
  })

  describe('Props验证', () => {
    it('label是必需属性', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(DataCard, { props: { value: 100 } })
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })

    it('value应有默认值', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试' }
      })
      expect(wrapper.props().value).toBe(0)
    })

    it('type应有默认值', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100 }
      })
      expect(wrapper.props().type).toBe('primary')
    })

    it('clickable应有默认值', () => {
      const wrapper = mount(DataCard, {
        props: { label: '测试', value: 100 }
      })
      expect(wrapper.props().clickable).toBe(false)
    })
  })
})
