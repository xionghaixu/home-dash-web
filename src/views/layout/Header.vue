<template>
  <div class="header-container">
    <el-icon v-if="asideVisible" class="icon"><Fold /></el-icon>
    <router-link to="/"><span class="name">个人网盘</span></router-link>
    <el-avatar :size="30" :src="userAvatar"></el-avatar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Fold } from '@element-plus/icons-vue'

const props = defineProps({
  asideVisible: {
    type: Boolean,
    default: true
  }
})

import userAvatarImage from '@/assets/user.jpeg'

const userAvatar = computed(() => userAvatarImage)
</script>

<style lang="scss" scoped>
.header-container {
  width: 96%;
  margin: 0 auto;
  color: #fff;
  height: 100%;
  display: flex;
  align-items: center;
  .icon {
    font-size: 30px;
    cursor: pointer;
  }
  .name {
    padding-left: 6px;
    color: #fff;
    text-decoration: none;
    &:hover {
      color: #a0d4ff;
    }
  }
  .el-avatar {
    margin-left: auto;
    cursor: pointer;
  }
  a {
    color: #fff;
    text-decoration: none;
    &:hover {
      color: #a0d4ff;
    }
  }
}
</style>
