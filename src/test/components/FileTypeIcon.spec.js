import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileTypeIcon from '@/components/FileTypeIcon.vue'

describe('FileTypeIcon', () => {
  describe('渲染测试', () => {
    it('应正确渲染默认图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'default' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
      expect(wrapper.find('.file-icon').classes()).toContain('default')
    })

    it('应正确渲染文件夹图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'folder' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
      expect(wrapper.find('.file-icon').classes()).toContain('folder')
    })

    it('应正确渲染图片类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'picture' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
    })

    it('应正确渲染视频类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'video' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
      expect(wrapper.find('.file-icon').classes()).toContain('video')
    })

    it('应正确渲染音频类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'audio' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
    })

    it('应正确渲染文档类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'doc' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
    })

    it('应正确渲染PDF类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'pdf' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
      expect(wrapper.find('.file-icon').classes()).toContain('pdf')
    })

    it('应正确渲染压缩文件类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'compress_file' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
    })

    it('应正确渲染代码类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'code' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
    })

    it('应正确渲染web类型图标', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'web' }
      })
      expect(wrapper.find('.file-icon').exists()).toBe(true)
    })
  })

  describe('类型映射测试', () => {
    it.each([
      ['folder', 'folder'],
      ['picture', 'picture'],
      ['video', 'video'],
      ['audio', 'audio'],
      ['doc', 'doc'],
      ['pdf', 'pdf'],
      ['compress_file', 'compress_file'],
      ['code', 'code'],
      ['web', 'web'],
      ['torrent', 'torrent']
    ])('类型 %s 应映射到对应class', (type, expectedClass) => {
      const wrapper = mount(FileTypeIcon, { props: { type } })
      expect(wrapper.find('.file-icon').classes()).toContain(expectedClass)
    })
  })

  describe('Props验证', () => {
    it('应使用默认type值', () => {
      const wrapper = mount(FileTypeIcon)
      expect(wrapper.props().type).toBe('default')
    })

    it('应接受自定义type值', () => {
      const wrapper = mount(FileTypeIcon, {
        props: { type: 'picture' }
      })
      expect(wrapper.props().type).toBe('picture')
    })
  })
})
