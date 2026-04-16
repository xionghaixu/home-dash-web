<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人中心</h2>
      <p>管理您的个人信息和账户设置</p>
    </div>
    
    <div class="profile-content">
      <div class="profile-section">
        <h3>个人信息</h3>
        <div class="profile-info">
          <div class="info-item">
            <span class="info-label">用户名：</span>
            <span class="info-value">用户123</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱：</span>
            <span class="info-value">user@example.com</span>
          </div>
          <div class="info-item">
            <span class="info-label">注册时间：</span>
            <span class="info-value">2026-01-01</span>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>存储空间</h3>
        <div class="storage-info">
          <div class="storage-bar">
            <div class="storage-used" style="width: 30%"></div>
          </div>
          <div class="storage-text">
            <span>已使用：30GB</span>
            <span>总空间：100GB</span>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>账户安全</h3>
        <div class="security-options">
          <div class="security-item">
            <span>修改密码</span>
            <el-button type="primary" size="small">修改</el-button>
          </div>
          <div class="security-item">
            <span>绑定邮箱</span>
            <el-button type="primary" size="small">绑定</el-button>
          </div>
          <div class="security-item">
            <span>绑定手机</span>
            <el-button type="primary" size="small">绑定</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 个人中心页面逻辑
</script>

<style lang="scss" scoped>
.profile-container {
  padding: var(--spacing-2xl);
  min-height: calc(100vh - var(--header-height));
}

.profile-header {
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-section {
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

.profile-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  .info-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    min-width: 100px;
  }
  
  .info-value {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border-lighter);
  border-radius: var(--radius-full);
  overflow: hidden;
  
  .storage-used {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-base);
  }
}

.storage-text {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.security-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-lighter);
  
  &:last-child {
    border-bottom: none;
  }
  
  span {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }
}
</style>