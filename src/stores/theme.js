import { defineStore } from 'pinia'

/**
 * 主题模式枚举
 */
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

/**
 * 预设主题颜色
 */
export const PresetColors = [
  { name: '默认蓝', value: '#4182f3', color: '#4182f3' },
  { name: '极客绿', value: '#67c23a', color: '#67c23a' },
  { name: '活力橙', value: '#e6a23c', color: '#e6a23c' },
  { name: '热情红', value: '#f56c6c', color: '#f56c6c' },
  { name: '神秘紫', value: '#9c27b0', color: '#9c27b0' },
  { name: '湖水蓝', value: '#00bcd4', color: '#00bcd4' },
  { name: '玫瑰粉', value: '#e91e63', color: '#e91e63' },
  { name: '午夜蓝', value: '#3f51b5', color: '#3f51b5' }
]

/**
 * 字体大小预设
 */
export const FontSizePresets = [
  { label: '小', value: 'small', scale: 0.85 },
  { label: '默认', value: 'default', scale: 1 },
  { label: '大', value: 'large', scale: 1.15 }
]

/**
 * 列表密度预设
 */
export const ListDensityPresets = [
  { label: '紧凑', value: 'compact' },
  { label: '默认', value: 'default' },
  { label: '舒适', value: 'comfortable' }
]

/**
 * 滚动条样式预设
 */
export const ScrollbarStylePresets = [
  { label: '细', value: 'thin' },
  { label: '正常', value: 'normal' },
  { label: '粗', value: 'thick' }
]

/**
 * 主题配置 Store
 * @description 管理应用的主题配置，包括主题模式、主题颜色、字体大小等
 */
export const useThemeStore = defineStore('theme', {
  /**
   * 状态
   */
  state: () => ({
    /** 主题模式: light(日间) / dark(夜间) / auto(跟随系统) */
    mode: ThemeMode.LIGHT,
    /** 主题颜色 */
    primaryColor: '#4182f3',
    /** 字体大小: small / default / large */
    fontSize: 'default',
    /** 紧凑模式 */
    compactMode: false,
    /** 圆角风格: small / medium / large */
    borderRadius: 'medium',
    /** 动画速度: none / fast / normal / slow */
    animationSpeed: 'normal',
    /** 侧边栏是否折叠 */
    sidebarCollapsed: false,
    /** 毛玻璃效果 */
    blurEffect: false,
    /** 高对比度模式 */
    highContrast: false,
    /** 列表密度: compact / default / comfortable */
    listDensity: 'default',
    /** 滚动条样式: thin / normal / thick */
    scrollbarStyle: 'normal',
    /** 透明背景效果 */
    transparentBg: false,
    /** 彩色图标模式 */
    colorfulIcon: true,
    /** 扩展色彩模式(为不同类型文件使用不同颜色) */
    colorfulType: true
  }),

  /**
   * 计算属性
   */
  getters: {
    /** 是否为夜间模式 */
    isDark: state => {
      if (state.mode === ThemeMode.AUTO) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.mode === ThemeMode.DARK
    },

    /** 是否为日间模式 */
    isLight: state => {
      if (state.mode === ThemeMode.AUTO) {
        return !window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.mode === ThemeMode.LIGHT
    },

    /** 获取当前主题配置对象 */
    themeConfig: state => ({
      mode: state.mode,
      primaryColor: state.primaryColor,
      fontSize: state.fontSize,
      compactMode: state.compactMode,
      borderRadius: state.borderRadius,
      animationSpeed: state.animationSpeed,
      sidebarCollapsed: state.sidebarCollapsed,
      blurEffect: state.blurEffect,
      highContrast: state.highContrast,
      listDensity: state.listDensity,
      scrollbarStyle: state.scrollbarStyle,
      transparentBg: state.transparentBg,
      colorfulIcon: state.colorfulIcon,
      colorfulType: state.colorfulType
    })
  },

  /**
   * 操作方法
   */
  actions: {
    /**
     * 设置主题模式
     * @param {string} mode - 主题模式
     */
    setMode(mode) {
      if (Object.values(ThemeMode).includes(mode)) {
        this.mode = mode
        this.applyTheme()
        this.persistSettings()
      }
    },

    /**
     * 切换日/夜模式
     */
    toggleMode() {
      if (this.mode === ThemeMode.LIGHT) {
        this.setMode(ThemeMode.DARK)
      } else if (this.mode === ThemeMode.DARK) {
        this.setMode(ThemeMode.LIGHT)
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.setMode(isDark ? ThemeMode.LIGHT : ThemeMode.DARK)
      }
    },

    /**
     * 设置主题颜色
     * @param {string} color - 主题颜色值
     */
    setPrimaryColor(color) {
      this.primaryColor = color
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 设置字体大小
     * @param {string} size - 字体大小预设
     */
    setFontSize(size) {
      if (['small', 'default', 'large'].includes(size)) {
        this.fontSize = size
        this.applyTheme()
        this.persistSettings()
      }
    },

    /**
     * 设置紧凑模式
     * @param {boolean} enabled - 是否启用
     */
    setCompactMode(enabled) {
      this.compactMode = enabled
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 设置圆角风格
     * @param {string} radius - 圆角风格
     */
    setBorderRadius(radius) {
      if (['small', 'medium', 'large'].includes(radius)) {
        this.borderRadius = radius
        this.applyTheme()
        this.persistSettings()
      }
    },

    /**
     * 设置动画速度
     * @param {string} speed - 动画速度
     */
    setAnimationSpeed(speed) {
      if (['none', 'fast', 'normal', 'slow'].includes(speed)) {
        this.animationSpeed = speed
        this.applyTheme()
        this.persistSettings()
      }
    },

    /**
     * 设置侧边栏折叠状态
     * @param {boolean} collapsed - 是否折叠
     */
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed
      this.persistSettings()
    },

    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      this.persistSettings()
    },

    /**
     * 设置毛玻璃效果
     * @param {boolean} enabled - 是否启用
     */
    setBlurEffect(enabled) {
      this.blurEffect = enabled
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 设置高对比度模式
     * @param {boolean} enabled - 是否启用
     */
    setHighContrast(enabled) {
      this.highContrast = enabled
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 设置列表密度
     * @param {string} density - 列表密度
     */
    setListDensity(density) {
      if (['compact', 'default', 'comfortable'].includes(density)) {
        this.listDensity = density
        this.applyTheme()
        this.persistSettings()
      }
    },

    /**
     * 设置滚动条样式
     * @param {string} style - 滚动条样式
     */
    setScrollbarStyle(style) {
      if (['thin', 'normal', 'thick'].includes(style)) {
        this.scrollbarStyle = style
        this.applyTheme()
        this.persistSettings()
      }
    },

    /**
     * 设置透明背景效果
     * @param {boolean} enabled - 是否启用
     */
    setTransparentBg(enabled) {
      this.transparentBg = enabled
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 设置彩色图标模式
     * @param {boolean} enabled - 是否启用
     */
    setColorfulIcon(enabled) {
      this.colorfulIcon = enabled
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 设置彩色类型模式
     * @param {boolean} enabled - 是否启用
     */
    setColorfulType(enabled) {
      this.colorfulType = enabled
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 重置主题配置为默认值
     */
    resetToDefault() {
      this.mode = ThemeMode.LIGHT
      this.primaryColor = '#4182f3'
      this.fontSize = 'default'
      this.compactMode = false
      this.borderRadius = 'medium'
      this.animationSpeed = 'normal'
      this.blurEffect = false
      this.highContrast = false
      this.listDensity = 'default'
      this.scrollbarStyle = 'normal'
      this.transparentBg = false
      this.colorfulIcon = true
      this.colorfulType = true
      this.applyTheme()
      this.persistSettings()
    },

    /**
     * 应用主题配置到 DOM
     */
    applyTheme() {
      const root = document.documentElement

      // 应用主题模式
      if (
        this.mode === ThemeMode.DARK ||
        (this.mode === ThemeMode.AUTO && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      // 应用主题颜色
      root.style.setProperty('--color-primary', this.primaryColor)

      // 计算主色的浅色和深色变体
      const primaryLight = this.adjustColor(this.primaryColor, 0.2)
      const primaryDark = this.adjustColor(this.primaryColor, -0.2)
      const primaryBg = this.hexToRgba(this.primaryColor, 0.08)
      const primaryHover = this.hexToRgba(this.primaryColor, 0.12)

      root.style.setProperty('--color-primary-light', primaryLight)
      root.style.setProperty('--color-primary-dark', primaryDark)
      root.style.setProperty('--color-primary-bg', primaryBg)
      root.style.setProperty('--color-primary-hover', primaryHover)

      // 应用圆角
      const radiusMap = { small: '4px', medium: '8px', large: '12px' }
      const baseRadius = radiusMap[this.borderRadius] || '8px'
      root.style.setProperty('--radius-sm', `calc(${baseRadius} * 0.5)`)
      root.style.setProperty('--radius-md', baseRadius)
      root.style.setProperty('--radius-lg', `calc(${baseRadius} * 1.5)`)
      root.style.setProperty('--radius-xl', `calc(${baseRadius} * 2)`)

      // 应用字体大小
      const fontScaleMap = { small: 0.85, default: 1, large: 1.15 }
      const fontScale = fontScaleMap[this.fontSize] || 1
      root.style.setProperty('--font-size-scale', fontScale)

      // 应用紧凑模式
      if (this.compactMode) {
        root.classList.add('compact')
      } else {
        root.classList.remove('compact')
      }

      // 应用动画速度
      const speedMap = { none: '0s', fast: '0.1s', normal: '0.2s', slow: '0.3s' }
      root.style.setProperty('--transition-fast', speedMap[this.animationSpeed] || '0.15s')
      root.style.setProperty(
        '--transition-base',
        `calc(${speedMap[this.animationSpeed] || '0.2s'} * 1.3)`
      )
      root.style.setProperty(
        '--transition-slow',
        `calc(${speedMap[this.animationSpeed] || '0.2s'} * 1.5)`
      )

      // 应用高对比度模式
      if (this.highContrast) {
        root.classList.add('high-contrast')
      } else {
        root.classList.remove('high-contrast')
      }

      // 应用毛玻璃效果
      if (this.blurEffect) {
        root.classList.add('blur-effect')
      } else {
        root.classList.remove('blur-effect')
      }

      // 应用列表密度
      root.setAttribute('data-list-density', this.listDensity)

      // 应用滚动条样式
      root.setAttribute('data-scrollbar-style', this.scrollbarStyle)

      // 应用透明背景
      if (this.transparentBg) {
        root.classList.add('transparent-bg')
      } else {
        root.classList.remove('transparent-bg')
      }

      // 应用彩色图标
      if (this.colorfulIcon) {
        root.classList.add('colorful-icon')
      } else {
        root.classList.remove('colorful-icon')
      }

      // 应用彩色类型
      if (this.colorfulType) {
        root.classList.add('colorful-type')
      } else {
        root.classList.remove('colorful-type')
      }
    },

    /**
     * 调整颜色亮度
     * @param {string} hex - 十六进制颜色值
     * @param {number} amount - 调整比例 (-1 到 1)
     * @returns {string} 调整后的颜色值
     */
    adjustColor(hex, amount) {
      const num = parseInt(hex.replace('#', ''), 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * amount)))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(255 * amount)))
      const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(255 * amount)))
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    },

    /**
     * 将十六进制颜色转换为 RGBA
     * @param {string} hex - 十六进制颜色值
     * @param {number} alpha - 透明度
     * @returns {string} RGBA 颜色值
     */
    hexToRgba(hex, alpha) {
      const num = parseInt(hex.replace('#', ''), 16)
      const r = (num >> 16) & 0xff
      const g = (num >> 8) & 0xff
      const b = num & 0xff
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },

    /**
     * 从本地存储加载配置
     */
    loadFromStorage() {
      try {
        const saved = localStorage.getItem('theme-settings')
        if (saved) {
          const settings = JSON.parse(saved)
          if (settings.mode) this.mode = settings.mode
          if (settings.primaryColor) this.primaryColor = settings.primaryColor
          if (settings.fontSize) this.fontSize = settings.fontSize
          if (typeof settings.compactMode === 'boolean') this.compactMode = settings.compactMode
          if (settings.borderRadius) this.borderRadius = settings.borderRadius
          if (settings.animationSpeed) this.animationSpeed = settings.animationSpeed
          if (typeof settings.sidebarCollapsed === 'boolean') {
            this.sidebarCollapsed = settings.sidebarCollapsed
          }
          if (typeof settings.blurEffect === 'boolean') this.blurEffect = settings.blurEffect
          if (typeof settings.highContrast === 'boolean') this.highContrast = settings.highContrast
          if (settings.listDensity) this.listDensity = settings.listDensity
          if (settings.scrollbarStyle) this.scrollbarStyle = settings.scrollbarStyle
          if (typeof settings.transparentBg === 'boolean') {
            this.transparentBg = settings.transparentBg
          }
          if (typeof settings.colorfulIcon === 'boolean') this.colorfulIcon = settings.colorfulIcon
          if (typeof settings.colorfulType === 'boolean') this.colorfulType = settings.colorfulType
        }
      } catch (e) {
        console.warn('Failed to load theme settings from storage:', e)
      }

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode === ThemeMode.AUTO) {
          this.applyTheme()
        }
      })
    },

    /**
     * 保存配置到本地存储
     */
    persistSettings() {
      try {
        const settings = {
          mode: this.mode,
          primaryColor: this.primaryColor,
          fontSize: this.fontSize,
          compactMode: this.compactMode,
          borderRadius: this.borderRadius,
          animationSpeed: this.animationSpeed,
          sidebarCollapsed: this.sidebarCollapsed,
          blurEffect: this.blurEffect,
          highContrast: this.highContrast,
          listDensity: this.listDensity,
          scrollbarStyle: this.scrollbarStyle,
          transparentBg: this.transparentBg,
          colorfulIcon: this.colorfulIcon,
          colorfulType: this.colorfulType
        }
        localStorage.setItem('theme-settings', JSON.stringify(settings))
      } catch (e) {
        console.warn('Failed to persist theme settings:', e)
      }
    },

    /**
     * 初始化主题
     */
    init() {
      this.loadFromStorage()
      this.applyTheme()
    }
  }
})
