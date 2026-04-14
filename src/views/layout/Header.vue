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
        <span class="search-shortcut">Ctrl+K</span>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderOpened,
  Search,
  Upload,
  RefreshRight,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import userAvatarImage from '@/assets/user.jpeg'

defineProps({
  asideVisible: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const searchKeyword = ref('')
const userAvatar = ref(userAvatarImage)

const goHome = () => {
  router.push('/folder/0')
}

const triggerUpload = () => {
  window.eventBus.emit('openUploader')
}

const refreshPage = () => {
  window.location.reload()
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    console.log('Search:', searchKeyword.value)
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      console.log('Logout')
      break
    case 'profile':
      console.log('Profile')
      break
    case 'settings':
      console.log('Settings')
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
</style>
