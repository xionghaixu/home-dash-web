<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="not-found-illustration">
        <svg viewBox="0 0 200 200" class="illustration-svg">
          <circle cx="100" cy="100" r="80" fill="var(--color-fill-base)" />
          <text x="100" y="120" text-anchor="middle" class="error-code">404</text>
        </svg>
      </div>
      <h1 class="not-found-title">页面不存在</h1>
      <p class="not-found-description">抱歉，您访问的页面可能已删除或暂时无法访问。</p>
      <div class="not-found-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/folder/0')
}

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg-page);
  padding: var(--spacing-2xl);
}

.not-found-content {
  text-align: center;
  animation: fadeInUp 0.5s ease;
}

.not-found-illustration {
  margin-bottom: var(--spacing-2xl);
}

.illustration-svg {
  width: 180px;
  height: 180px;
}

.error-code {
  font-size: 48px;
  font-weight: var(--font-weight-bold);
  fill: var(--color-text-secondary);
}

.not-found-title {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.not-found-description {
  margin: 0 0 var(--spacing-2xl);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  max-width: 320px;
}

.not-found-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}
</style>
