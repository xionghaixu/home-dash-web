# PND 前端项目 Skills 规范

## 1. 项目概述

PND 前端项目是一个基于 Vue.js 的个人网络存储解决方案的前端部分，提供了文件管理、大文件上传、文件下载、视频播放等功能的用户界面。

## 2. 技术栈

### 当前技术栈（Vue 3） ✅

- **框架**: Vue.js 3.5.13
- **UI组件库**: Element Plus 2.9.0
- **构建工具**: Vite 6.0.0
- **HTTP客户端**: Axios 1.7.7
- **文件上传**: simple-uploader.js 0.6.0
- **状态管理**: Pinia 2.3.0
- **路由**: Vue Router 4.5.0
- **图标**: @element-plus/icons-vue 2.3.1
- **MD5**: spark-md5 3.0.2
- **Node.js**: >=20.0.0 (兼容 Node.js 24)

### 开发工具

- **代码质量**: ESLint 9.17.0 + Prettier 3.4.2
- **CSS预处理器**: Sass 1.83.0
- **代码压缩**: Terser 5.36.0
- **自动导入**: unplugin-auto-import 0.18.0 + unplugin-vue-components 0.27.0

## 3. 项目结构

```
pnd-web/
├── public/              # 静态资源
├── src/
│   ├── apis/            # API调用
│   ├── assets/          # 资源文件
│   ├── components/      # 组件
│   ├── router/          # 路由配置
│   ├── stores/          # 状态管理（Pinia）
│   ├── styles/          # 样式文件
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   ├── App.vue          # 应用入口组件
│   └── main.js          # 应用入口文件
├── .env.development     # 开发环境配置
├── .env.production      # 生产环境配置
├── vite.config.js       # Vite配置文件
├── package.json         # 项目配置和依赖
└── README.md            # 项目说明文档
```

## 4. 开发规范

### 4.1 代码规范

- **代码风格检查**: 使用 ESLint 和 Prettier 确保代码风格一致
- **命名规范**: 
  - 组件名：使用 PascalCase 命名法，如 `FileUpload`
  - 变量名：使用 camelCase 命名法，如 `fileList`
  - 常量名：使用 UPPER_SNAKE_CASE 命名法，如 `MAX_UPLOAD_SIZE`
  - 方法名：使用 camelCase 命名法，如 `handleFileUpload`
- **注释规范**: 
  - 组件注释：使用 JSDoc 格式，描述组件的功能和用途
  - 方法注释：使用 JSDoc 格式，描述方法的功能、参数和返回值
  - 代码注释：对复杂逻辑和关键代码添加注释，提高代码可读性

### 4.2 组件开发

**Vue 3 组件开发规范：**

- **优先使用 `<script setup>` 语法**
  ```vue
  <script setup>
  import { ref, computed } from 'vue'
  
  const count = ref(0)
  const doubled = computed(() => count.value * 2)
  </script>
  ```

- **组件通信**
  - 使用 `defineProps` 定义 props
  - 使用 `defineEmits` 定义事件
  - 使用 `provide/inject` 进行跨组件通信
  - 使用 Pinia 进行全局状态管理

- **生命周期钩子**
  - `onMounted` 替代 `mounted`
  - `onUnmounted` 替代 `beforeDestroy` 和 `destroyed`
  - `onBeforeMount`、`onBeforeUpdate`、`onUpdated` 等

### 4.3 状态管理

**Pinia 状态管理规范：**

- **Store 定义**
  ```javascript
  import { defineStore } from 'pinia'
  
  export const useAppStore = defineStore('app', {
    state: () => ({
      folderId: 0,
    }),
    getters: {
      currentFolderId: (state) => state.folderId,
    },
    actions: {
      setFolderId(id) {
        this.folderId = id
      },
    },
  })
  ```

- **在组件中使用**
  ```javascript
  import { useAppStore } from '@/stores/app'
  
  const store = useAppStore()
  const folderId = store.currentFolderId
  store.setFolderId(1)
  ```

### 4.4 路由管理

**Vue Router 4 规范：**

- **路由配置**
  ```javascript
  import { createRouter, createWebHistory } from 'vue-router'
  
  const routes = [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/404.vue'),
    },
  ]
  
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  ```

- **路由守卫**
  ```javascript
  router.beforeEach((to, from, next) => {
    // 权限控制
    next()
  })
  ```

### 4.5 API 调用

- **API 封装**: 统一 API 调用方式，将 API 调用封装到 `apis` 目录下
- **请求拦截器**: 使用 axios 拦截器处理请求，如添加认证信息
- **响应拦截器**: 使用 axios 拦截器处理响应，如统一处理错误
- **请求参数**: 优化请求参数，减少数据传输量
- **请求缓存**: 对于频繁请求的数据，实现请求缓存，减少网络请求次数

### 4.5.1 API 接口规范

**接口基础信息：**
- API版本：`/v1`
- 后端端口：`8190`
- 前端开发服务器端口：`8180`
- 代理路径：`/v1` → `http://localhost:8190`

**文件管理接口：**

| 接口名称 | 请求方法 | 请求路径 | 说明 |
|---------|---------|---------|------|
| 获取文件列表 | GET | `/v1/file/list` | 获取文件列表，参数：folderId |
| 创建文件/文件夹 | POST | `/v1/file/create` | 创建文件或文件夹 |
| 重命名文件 | PUT | `/v1/file/rename` | 重命名文件 |
| 删除文件 | DELETE | `/v1/file/delete` | 删除文件 |
| 移动/复制文件 | PUT | `/v1/file/move` | 移动或复制文件 |
| 获取文件下载链接 | GET | `/v1/file/download` | 获取文件下载地址 |

**资源管理接口：**

| 接口名称 | 请求方法 | 请求路径 | 说明 |
|---------|---------|---------|------|
| 获取资源列表 | GET | `/v1/resource/list` | 获取资源列表 |
| 获取资源URL | GET | `/v1/resource/url` | 获取资源访问URL |
| 获取视频播放地址 | GET | `/v1/resource/video` | 获取视频播放地址 |

**系统接口：**

| 接口名称 | 请求方法 | 请求路径 | 说明 |
|---------|---------|---------|------|
| 获取系统信息 | GET | `/v1/system/info` | 获取系统信息 |
| 获取存储信息 | GET | `/v1/system/storage` | 获取存储信息 |

**响应格式：**
```javascript
{
  code: 0,      // 状态码，0表示成功
  message: '',  // 消息
  data: {}      // 数据
}
```

### 4.6 样式管理

- **样式组织**: 按组件和功能组织样式文件
- **样式命名**: 使用 BEM 或其他命名规范，如 `.component__element--modifier`
- **样式复用**: 提取公共样式到 `styles` 目录下，提高样式复用率
- **响应式设计**: 实现响应式设计，适配不同设备的屏幕尺寸

### 4.7 构建配置

**Vite 配置规范：**

- **路径别名**: 配置 `@` 指向 `src` 目录
- **代理配置**: 配置开发服务器代理
- **构建优化**: 配置代码分割、压缩等优化选项
- **插件配置**: 配置 Vue、Element Plus 等插件

## 6. Vue 3 迁移注意事项

### 6.1 破坏性变更

- **移除过滤器**: 使用计算属性或方法替代
- **移除 `$on`、`$off`、`$once`**: 使用外部库或自定义实现
- **移除 `$children`**: 使用 `ref` 或 `provide/inject`
- **移除内联模板**: 使用常规模板
- **v-model 变化**: 组件 v-model 默认 prop 名从 `value` 改为 `modelValue`
- **自定义指令变化**: 钩子函数名称变化

### 6.2 推荐实践

- **渐进式迁移**: 先支持 Vue 3 语法，再逐步迁移到 Composition API
- **保留 Options API**: 降低迁移风险，可以混用两种写法
- **使用迁移构建**: Vue 3 提供了 `@vue/compat` 用于渐进式迁移
- **测试覆盖**: 确保迁移后功能正常

## 7. 注意事项

1. **禁止增加新的 MD 文件**：为了保持项目文档的简洁性和一致性，禁止在项目中增加新的 Markdown 文件。

2. **每次运行必须读取本 Skills 规范**：在进行任何开发或优化工作之前，必须先读取本 Skills 规范，确保所有工作都符合项目的规范和要求。

3. **代码编辑自动化**：代码编辑应避免手动确认，全程自动完成，确保开发过程的高效性和一致性。

4. **代码可维护性**：保持代码的可维护性和可读性，遵循代码规范和最佳实践。

5. **功能稳定性**：确保功能的稳定性和可靠性，避免引入不稳定的功能和依赖。

6. **用户体验**：优化用户体验，提高系统的响应速度和交互体验。

7. **性能优化**：关注前端性能，优化资源加载、渲染性能和网络请求。

8. **兼容性**：确保代码与指定的 Vue.js 版本和浏览器兼容。

9. **安全性**：关注前端安全性，避免引入安全漏洞，如 XSS 攻击、CSRF 攻击等。

10. **代码审查**：定期进行代码审查，确保代码质量和可维护性。

11. **文档更新**：当项目结构或功能发生变化时，及时更新相关文档，确保文档与代码保持一致。

12. **Node.js 版本**：确保所有依赖支持 Node.js 24，测试构建和运行时兼容性。
