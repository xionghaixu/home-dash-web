<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2>设置</h2>
      <p>配置您的应用偏好和系统设置</p>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <h3>通用设置</h3>
        <div class="setting-item">
          <span class="setting-label">语言</span>
          <el-select v-model="language" placeholder="选择语言">
            <el-option label="简体中文" value="zh-CN"></el-option>
            <el-option label="English" value="en-US"></el-option>
          </el-select>
        </div>
        <div class="setting-item">
          <span class="setting-label">时区</span>
          <el-select v-model="timezone" placeholder="选择时区">
            <el-option label="中国标准时间 (UTC+8)" value="Asia/Shanghai"></el-option>
            <el-option label="美国东部时间 (UTC-5)" value="America/New_York"></el-option>
            <el-option label="欧洲中部时间 (UTC+1)" value="Europe/Paris"></el-option>
          </el-select>
        </div>
      </div>

      <div class="settings-section">
        <h3>上传设置</h3>
        <div class="setting-item">
          <span class="setting-label">默认上传路径</span>
          <el-input v-model="defaultUploadPath" placeholder="输入默认上传路径"></el-input>
        </div>
        <div class="setting-item">
          <span class="setting-label">最大上传文件大小</span>
          <el-input-number
            v-model="maxFileSize"
            :min="1"
            :max="1024"
            :step="1"
            suffix="GB"
          ></el-input-number>
        </div>
        <div class="setting-item">
          <span class="setting-label">自动重命名重复文件</span>
          <el-switch v-model="autoRename"></el-switch>
        </div>
      </div>

      <div class="settings-section">
        <h3>通知设置</h3>
        <div class="setting-item">
          <span class="setting-label">启用通知</span>
          <el-switch v-model="enableNotifications"></el-switch>
        </div>
        <div class="setting-item">
          <span class="setting-label">上传完成通知</span>
          <el-switch
            v-model="uploadCompleteNotification"
            :disabled="!enableNotifications"
          ></el-switch>
        </div>
        <div class="setting-item">
          <span class="setting-label">下载完成通知</span>
          <el-switch
            v-model="downloadCompleteNotification"
            :disabled="!enableNotifications"
          ></el-switch>
        </div>
      </div>

      <div class="settings-section">
        <h3>高级设置</h3>
        <div class="setting-item">
          <span class="setting-label">启用缓存</span>
          <el-switch v-model="enableCache"></el-switch>
        </div>
        <div class="setting-item">
          <span class="setting-label">缓存大小限制</span>
          <el-input-number
            v-model="cacheSize"
            :min="1"
            :max="100"
            :step="1"
            suffix="MB"
            :disabled="!enableCache"
          ></el-input-number>
        </div>
        <div class="setting-item">
          <span class="setting-label">自动清理缓存</span>
          <el-switch v-model="autoClearCache" :disabled="!enableCache"></el-switch>
        </div>
      </div>

      <div class="settings-actions">
        <el-button @click="resetSettings">重置默认</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 设置页面逻辑
const language = ref('zh-CN')
const timezone = ref('Asia/Shanghai')
const defaultUploadPath = ref('/')
const maxFileSize = ref(10)
const autoRename = ref(true)
const enableNotifications = ref(true)
const uploadCompleteNotification = ref(true)
const downloadCompleteNotification = ref(true)
const enableCache = ref(true)
const cacheSize = ref(50)
const autoClearCache = ref(true)

const saveSettings = () => {
  // 保存设置的逻辑
  console.log('保存设置')
  // 这里可以添加API调用，将设置保存到后端
}

const resetSettings = () => {
  // 重置默认设置的逻辑
  language.value = 'zh-CN'
  timezone.value = 'Asia/Shanghai'
  defaultUploadPath.value = '/'
  maxFileSize.value = 10
  autoRename.value = true
  enableNotifications.value = true
  uploadCompleteNotification.value = true
  downloadCompleteNotification.value = true
  enableCache.value = true
  cacheSize.value = 50
  autoClearCache.value = true
  console.log('重置默认设置')
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: var(--spacing-2xl);
  min-height: calc(100vh - var(--header-height));
}

.settings-header {
  margin-bottom: var(--spacing-2xl);

  h2 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.settings-section {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border-lighter);

  &:last-child {
    border-bottom: none;
  }

  .setting-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    min-width: 120px;
  }
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>
