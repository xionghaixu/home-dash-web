<template>
  <div class="header-container">
    <div class="header-left">
      <button class="mobile-nav-toggle" aria-label="打开导航菜单" @click="toggleMobileNav">
        <el-icon><Fold /></el-icon>
      </button>
      <div class="logo-area" role="link" tabindex="0" @click="goHome" @keydown.enter="goHome">
        <div class="logo-icon">
          <el-icon :size="22"><FolderOpened /></el-icon>
        </div>
        <span class="logo-text">数字化中心</span>
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
          aria-label="搜索文件"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div class="header-right">
      <el-tooltip content="上传文件" placement="bottom">
        <button class="header-action" aria-label="上传文件" @click="triggerUpload">
          <el-icon :size="18"><Upload /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip content="主题设置" placement="bottom">
        <button class="header-action" aria-label="主题设置" @click="themeDialogVisible = true">
          <el-icon :size="18"><Brush /></el-icon>
        </button>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-avatar">
          <el-avatar :size="32" :src="userAvatar">
            <el-icon :size="18"><User /></el-icon>
          </el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="files">
              <el-icon><FolderOpened /></el-icon>
              全部文件
            </el-dropdown-item>
            <el-dropdown-item command="system">
              <el-icon><Setting /></el-icon>
              系统信息
            </el-dropdown-item>
            <el-dropdown-item divided command="theme">
              <el-icon><Brush /></el-icon>
              主题设置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- Theme Dialog -->
    <el-dialog
      v-model="themeDialogVisible"
      title="主题设置"
      width="420px"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="theme-config">
        <div class="theme-section">
          <div class="theme-section-title">主题模式</div>
          <div class="theme-mode-options">
            <div
              v-for="mode in themeModes"
              :key="mode.value"
              class="theme-mode-item"
              :class="{ active: themeStore.mode === mode.value }"
              tabindex="0"
              role="radio"
              :aria-checked="themeStore.mode === mode.value"
              @keydown.enter="themeStore.setMode(mode.value)"
              @click="themeStore.setMode(mode.value)"
            >
              <el-icon :size="20"><component :is="mode.icon" /></el-icon>
              <span>{{ mode.label }}</span>
            </div>
          </div>
        </div>

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
              tabindex="0"
              role="radio"
              :aria-checked="themeStore.primaryColor === color.value"
              :aria-label="color.name"
              @keydown.enter="themeStore.setPrimaryColor(color.value)"
              @click="themeStore.setPrimaryColor(color.value)"
            >
              <el-icon v-if="themeStore.primaryColor === color.value" :size="14"><Check /></el-icon>
            </div>
          </div>
        </div>

        <div class="theme-section">
          <div class="theme-section-title">界面选项</div>
          <div class="theme-option-row">
            <span class="option-label">紧凑模式</span>
            <el-switch :model-value="themeStore.compactMode" @change="themeStore.setCompactMode" />
          </div>
          <div class="theme-option-row">
            <span class="option-label">毛玻璃效果</span>
            <el-switch :model-value="themeStore.blurEffect" @change="themeStore.setBlurEffect" />
          </div>
        </div>

        <div class="theme-section">
          <div class="theme-section-title">显示设置</div>
          <div class="theme-option-row">
            <span class="option-label">字体大小</span>
            <el-radio-group
              :model-value="themeStore.fontSize"
              size="small"
              @change="themeStore.setFontSize"
            >
              <el-radio-button value="small">小</el-radio-button>
              <el-radio-button value="default">默认</el-radio-button>
              <el-radio-button value="large">大</el-radio-button>
            </el-radio-group>
          </div>
          <div class="theme-option-row">
            <span class="option-label">圆角风格</span>
            <el-radio-group
              :model-value="themeStore.borderRadius"
              size="small"
              @change="themeStore.setBorderRadius"
            >
              <el-radio-button value="small">小</el-radio-button>
              <el-radio-button value="medium">中</el-radio-button>
              <el-radio-button value="large">大</el-radio-button>
            </el-radio-group>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore, ThemeMode, PresetColors } from '@/stores/theme'
import {
  FolderOpened,
  Search,
  Upload,
  User,
  Setting,
  Brush,
  Check,
  Sunny,
  Moon,
  Monitor,
  Fold
} from '@element-plus/icons-vue'
import userAvatarImage from '@/assets/user.jpeg'

const router = useRouter()
const themeStore = useThemeStore()

const searchKeyword = ref('')
const userAvatar = ref(userAvatarImage)
const themeDialogVisible = ref(false)
const mobileNavOpen = ref(false)

const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value
  const sidebar = document.querySelector('.sidebar-container')
  if (sidebar) {
    sidebar.classList.toggle('mobile-open', mobileNavOpen.value)
  }
}

const themeModes = [
  { value: ThemeMode.LIGHT, label: '日间', icon: Sunny },
  { value: ThemeMode.DARK, label: '夜间', icon: Moon },
  { value: ThemeMode.AUTO, label: '跟随系统', icon: Monitor }
]

const presetColors = PresetColors

const goHome = () => {
  router.push('/')
}

const triggerUpload = () => {
  window.eventBus.emit('openUploader')
}

const handleSearch = () => {
  const trimmedKeyword = searchKeyword.value.trim()
  if (trimmedKeyword) {
    router.push({ path: '/search', query: { q: trimmedKeyword } })
  }
}

const handleCommand = command => {
  switch (command) {
    case 'files':
      router.push('/files')
      break
    case 'system':
      router.push('/system')
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
  justify-content: space-between;
  padding: 0 var(--spacing-2xl);
  gap: var(--spacing-xl);
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border-light);
}

.header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.8;
  }
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  color: var(--color-primary);
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: 0.5px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  background: var(--color-fill-base);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
  padding: 0 var(--spacing-md);

  &:hover {
    background: var(--color-bg-white);
    border-color: var(--color-border);
  }

  &:focus-within {
    background: var(--color-bg-white);
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);

    .search-icon {
      color: var(--color-primary);
    }
  }
}

.search-icon {
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  padding: 0 var(--spacing-sm);
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;

  &::placeholder {
    color: var(--color-text-placeholder);
  }
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
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-fill-base);
    color: var(--color-primary);
  }
}

.user-avatar {
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast);
  margin-left: var(--spacing-sm);

  &:hover {
    transform: scale(1.05);
  }

  :deep(.el-avatar) {
    border: 2px solid var(--color-border-light);
  }
}

// Theme Dialog Styles
.theme-config {
  padding: var(--spacing-md) 0;
}

.theme-section {
  padding: var(--spacing-lg) 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
}

.theme-section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
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
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-primary-bg);
    border-color: var(--color-primary-light);
  }

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
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
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color);
  border: 2px solid transparent;
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

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
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

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
}

.mobile-nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-fill-base);
    color: var(--color-primary);
  }
}

@media (max-width: 960px) {
  .mobile-nav-toggle {
    display: flex;
  }
}

@media (max-width: 640px) {
  .header-container {
    padding: 0 var(--spacing-lg);
  }

  .logo-text {
    display: none;
  }

  .header-center {
    max-width: 200px;
  }
}
</style>
