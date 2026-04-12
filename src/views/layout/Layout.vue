<template>
  <el-container class="app-container">
    <el-header height="50px">
      <Header></Header>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <Aside></Aside>
      </el-aside>
      <el-main>
        <div class="main-container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
/**
 * Layout 组件 - 应用主布局组件
 * @description 定义应用的整体布局结构，包含头部、侧边栏和主内容区域
 * @component
 */
import Header from '@/views/layout/Header.vue'
import Aside from '@/views/layout/Aside.vue'
</script>

<style lang="scss" scoped>
@import '@/styles/layout.scss';
</style>
