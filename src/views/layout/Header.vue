<template>
  <div class="header-container">
    <div class="header-left">
      <div class="logo-area" @click="goHome">
        <div class="logo-icon">
          <el-icon :size="28"><FolderOpened /></el-icon>
        </div>
        <span class="logo-text">个人网盘</span>
      </div>
    </div>

    <div class="header-center">
      <div class="search-box">
        <el-icon class="search-icon"><Search /></el-icon>
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索文件..."
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div class="header-right">
      <el-tooltip content="上传文件" placement="bottom">
        <div class="header-action" @click="triggerUpload">
          <el-icon :size="20"><Upload /></el-icon>
        </div>
      </el-tooltip>

      <el-tooltip content="刷新页面" placement="bottom">
        <div class="header-action" @click="refreshPage">
          <el-icon :size="20"><RefreshRight /></el-icon>
        </div>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-avatar">
          <el-avatar :size="34" :src="userAvatar">
            <el-icon :size="20"><User /></el-icon>
          </el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="theme">
              <el-icon><Brush /></el-icon>
              <span>主题配置</span>
            </el-dropdown-item>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 主题配置对话框 -->
    <el-dialog
      v-model="themeDialogVisible"
      title="主题配置"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="theme-config">
        <div class="theme-section">
          <div class="theme-section-title">预设主题</div>
          <div class="theme-preset-options">
            <div
              v-for="preset in themePresets"
              :key="preset.name"
              class="theme-preset-item"
              :style="{ '--preset-color': preset.color }"
              :class="{ active: isPresetActive(preset) }"
              :title="preset.name"
              @click="applyPreset(preset)"
            >
              <div class="preset-icon">
                <component :is="preset.icon" />
              </div>
              <span>{{ preset.name }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">显示模式</div>
          <div class="theme-mode-options">
            <div
              v-for="mode in themeModes"
              :key="mode.value"
              class="theme-mode-item"
              :class="{ active: themeStore.mode === mode.value }"
              @click="themeStore.setMode(mode.value)"
            >
              <el-icon :size="24"><component :is="mode.icon" /></el-icon>
              <span>{{ mode.label }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">主题颜色</div>
          <div class="theme-color-options">
            <div
              v-for="color in presetColors"
              :key="color.value"
              class="theme-color-item"
              :class="{ active: themeStore.primaryColor === color.value }"
              :style="{ '--color': color.color }"
              :title="color.name"
              @click="themeStore.setPrimaryColor(color.value)"
            >
              <el-icon v-if="themeStore.primaryColor === color.value" :size="16"><Check /></el-icon>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">界面布局</div>
          <div class="theme-option-row">
            <span class="option-label">紧凑模式</span>
            <el-switch :model-value="themeStore.compactMode" @change="themeStore.setCompactMode" />
          </div>
          <div class="theme-option-row">
            <span class="option-label">毛玻璃效果</span>
            <el-switch :model-value="themeStore.blurEffect" @change="themeStore.setBlurEffect" />
          </div>
          <div class="theme-option-row">
            <span class="option-label">透明背景</span>
            <el-switch
              :model-value="themeStore.transparentBg"
              @change="themeStore.setTransparentBg"
            />
          </div>
          <div class="theme-option-row">
            <span class="option-label">高对比度</span>
            <el-switch
              :model-value="themeStore.highContrast"
              @change="themeStore.setHighContrast"
            />
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">字体大小</div>
          <div class="theme-radius-options">
            <el-radio-group :model-value="themeStore.fontSize" @change="themeStore.setFontSize">
              <el-radio-button value="small">小</el-radio-button>
              <el-radio-button value="default">默认</el-radio-button>
              <el-radio-button value="large">大</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">圆角风格</div>
          <div class="theme-radius-options">
            <el-radio-group
              :model-value="themeStore.borderRadius"
              @change="themeStore.setBorderRadius"
            >
              <el-radio-button value="small">小</el-radio-button>
              <el-radio-button value="medium">中</el-radio-button>
              <el-radio-button value="large">大</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">列表密度</div>
          <div class="theme-radius-options">
            <el-radio-group
              :model-value="themeStore.listDensity"
              @change="themeStore.setListDensity"
            >
              <el-radio-button value="compact">紧凑</el-radio-button>
              <el-radio-button value="default">默认</el-radio-button>
              <el-radio-button value="comfortable">舒适</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">滚动条样式</div>
          <div class="theme-radius-options">
            <el-radio-group
              :model-value="themeStore.scrollbarStyle"
              @change="themeStore.setScrollbarStyle"
            >
              <el-radio-button value="thin">细</el-radio-button>
              <el-radio-button value="normal">正常</el-radio-button>
              <el-radio-button value="thick">粗</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">动画速度</div>
          <div class="theme-animation-options">
            <el-slider
              :model-value="animationSpeedValue"
              :min="0"
              :max="3"
              :step="1"
              :marks="animationMarks"
              :format-tooltip="formatAnimationTooltip"
              @change="handleAnimationChange"
            />
          </div>
        </div>

        <el-divider />

        <div class="theme-section">
          <div class="theme-section-title">图标与颜色</div>
          <div class="theme-option-row">
            <span class="option-label">彩色图标</span>
            <el-switch
              :model-value="themeStore.colorfulIcon"
              @change="themeStore.setColorfulIcon"
            />
          </div>
          <div class="theme-option-row">
            <span class="option-label">文件类型着色</span>
            <el-switch
              :model-value="themeStore.colorfulType"
              @change="themeStore.setColorfulType"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="themeStore.resetToDefault">重置默认</el-button>
        <el-button type="primary" @click="themeDialogVisible = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderOpened,
  Search,
  Upload,
  RefreshRight,
  User,
  Setting,
  SwitchButton,
  Brush,
  Check,
  Sunny,
  Moon,
  Monitor,
  Coffee,
  Sunset,
  Compass
} from '@element-plus/icons-vue'
import userAvatarImage from '@/assets/user.jpeg'
import { useThemeStore, PresetColors, ThemeMode } from '@/stores/theme'

defineProps({
  asideVisible: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const themeStore = useThemeStore()
const searchKeyword = ref('')
const userAvatar = ref(userAvatarImage)
const themeDialogVisible = ref(false)

/** 预设主题列表 */
const themePresets = [
  {
    name: '默认蓝',
    mode: ThemeMode.LIGHT,
    color: '#74a8f7',
    icon: Sunny
  },
  {
    name: '纯白简约',
    mode: ThemeMode.LIGHT,
    color: '#b8c9e8',
    icon: Sunny
  },
  {
    name: '深夜静谧',
    mode: ThemeMode.DARK,
    color: '#7ba4d4',
    icon: Moon
  },
  {
    name: '薄荷清晨',
    mode: ThemeMode.LIGHT,
    color: '#8ed17a',
    icon: Compass
  },
  {
    name: '暖阳午后',
    mode: ThemeMode.LIGHT,
    color: '#f0c77a',
    icon: Sunset
  },
  {
    name: '玫瑰浪漫',
    mode: ThemeMode.LIGHT,
    color: '#f09ac4',
    icon: Coffee
  },
  {
    name: '神秘紫晶',
    mode: ThemeMode.DARK,
    color: '#b87fd4',
    icon: Brush
  }
]

/** 检查预设是否当前激活 */
const isPresetActive = preset => {
  return themeStore.mode === preset.mode && themeStore.primaryColor === preset.color
}

/** 应用预设主题 */
const applyPreset = preset => {
  themeStore.setMode(preset.mode)
  themeStore.setPrimaryColor(preset.color)
}

/** 主题模式选项 */
const themeModes = [
  { label: '日间', value: ThemeMode.LIGHT, icon: Sunny },
  { label: '夜间', value: ThemeMode.DARK, icon: Moon },
  { label: '自动', value: ThemeMode.AUTO, icon: Monitor }
]

/** 预设颜色列表 */
const presetColors = PresetColors

/** 动画速度选项 */
const animationSpeedValue = computed(() => {
  const speedMap = { none: 0, fast: 1, normal: 2, slow: 3 }
  return speedMap[themeStore.animationSpeed] ?? 2
})

const animationMarks = {
  0: '关闭',
  1: '快',
  2: '正常',
  3: '慢'
}

const formatAnimationTooltip = val => {
  const tooltipMap = { 0: '关闭', 1: '快', 2: '正常', 3: '慢' }
  return tooltipMap[val]
}

const handleAnimationChange = val => {
  const speedMap = { 0: 'none', 1: 'fast', 2: 'normal', 3: 'slow' }
  themeStore.setAnimationSpeed(speedMap[val])
}

const goHome = () => {
  router.push('/')
}

const triggerUpload = () => {
  window.eventBus.emit('openUploader')
}

const refreshPage = () => {
  window.location.reload()
}

const handleSearch = () => {
  const trimmedKeyword = searchKeyword.value.trim()
  if (trimmedKeyword) {
    router.push({ path: '/search', query: { q: trimmedKeyword } })
  }
}

const handleCommand = command => {
  switch (command) {
    case 'logout':
      console.log('Logout')
      break
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'theme':
      themeDialogVisible.value = true
      break
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-xl);
  gap: var(--spacing-xl);
}

.header-left {
  flex-shrink: 0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.85;
  }
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  color: #fff;
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  letter-spacing: 0.5px;
}

.header-center {
  flex: 1;
  max-width: 480px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-within {
    background: #fff;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(65, 130, 243, 0.15);

    .search-icon,
    .search-input,
    .search-shortcut {
      color: var(--color-text-secondary);
    }

    .search-icon {
      color: var(--color-primary);
    }
  }
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.7);
  transition: color var(--transition-fast);
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 80px 0 40px;
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: #fff;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}

.search-shortcut {
  position: absolute;
  right: 12px;
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.45);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  pointer-events: none;
  font-family: inherit;
  letter-spacing: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: rgba(255, 255, 255, 0.85);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
}

.user-avatar {
  margin-left: var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast);

  &:hover {
    transform: scale(1.05);
  }

  :deep(.el-avatar) {
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
}

/* 主题配置对话框样式 */
.theme-config {
  padding: var(--spacing-md) 0;
}

.theme-section {
  padding: var(--spacing-sm) 0;
}

.theme-section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.theme-preset-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.theme-preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  min-width: 80px;
  background: var(--color-fill-base);
  border: 2px solid var(--color-border-lighter);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--preset-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  &.active {
    border-color: var(--preset-color);
    background: var(--color-primary-bg);
  }

  .preset-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--preset-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
  }

  span {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  &.active span {
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
  }
}

.theme-mode-options {
  display: flex;
  gap: var(--spacing-md);
}

.theme-mode-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--color-fill-base);
  border: 2px solid var(--color-border-lighter);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary-light);
    background: var(--color-primary-bg);
  }

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  span {
    font-size: var(--font-size-sm);
  }
}

.theme-color-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.theme-color-item {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color);
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all var(--transition-fast);

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }

  &.active {
    border-color: var(--color-text-primary);
    transform: scale(1.1);
  }
}

.theme-option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.option-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
}

.theme-radius-options {
  display: flex;
}

.theme-animation-options {
  padding: 0 var(--spacing-md);
}

:deep(.el-divider) {
  margin: var(--spacing-md) 0;
}

:deep(.el-dialog) {
  border-radius: var(--radius-xl);
}

:deep(.el-dialog__header) {
  padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-lighter);
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: var(--spacing-xl) var(--spacing-2xl);
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-lg) var(--spacing-2xl) var(--spacing-xl);
  border-top: 1px solid var(--color-border-lighter);
}

/* 搜索结果对话框样式 */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: var(--spacing-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-results-header {
  padding: var(--spacing-md) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-lighter);
  margin-bottom: var(--spacing-sm);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-fill-base);
  }
}

.result-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.result-actions {
  flex-shrink: 0;
}

.keyword-highlight {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-bg);
  padding: 0 2px;
  border-radius: 2px;
}
</style>
