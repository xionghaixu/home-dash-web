# home-dash-web

个人媒体中心与文件管理系统的前端项目，基于 Vue 3 + Element Plus 构建。

## 功能特性

### 文件管理
- 文件列表浏览、目录导航
- 文件上传（分块上传、断点续传）
- 文件搜索、筛选、排序
- 文件预览（图片、文本、音频）

### 媒体中心
- 图片时间线浏览、大图预览
- 视频在线播放（DPlayer 播放器）
- 音频播放、播放列表管理

### 数据治理
- 回收站管理
- 重复文件/大文件/空目录清理
- 存储空间分析与可视化

### 任务中心
- 统一任务查询与管理
- 任务状态筛选、重试操作

## 快速开始

### 环境要求

- Node.js 20+
- npm 9+ 或 pnpm 8+

### 拉取代码

```bash
git clone https://github.com/xionghaixu/home-dash-web.git
cd home-dash-web
```

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:8180

### 生产构建

```bash
npm run build
```

构建产物在 `dist` 目录。

### 部署

#### 方式一：Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/home-dash-web/dist;
    index index.html;

    # Vue Router history 模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /v1/ {
        proxy_pass http://localhost:8190;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 方式二：Docker 部署

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
docker build -t home-dash-web .
docker run -p 80:80 home-dash-web
```

## 页面导航

| 模块 | 页面 | 说明 |
|------|------|------|
| 文件 | 全部文件、分类浏览 | 文件管理 |
| 媒体 | 图片、视频、音频 | 媒体浏览 |
| 治理 | 回收站、空间瘦身、存储分析 | 数据治理 |
| 任务 | 任务中心 | 任务管理 |
| 系统 | 传输列表、系统信息 | 系统功能 |

## 配置说明

### 环境变量

创建 `.env` 文件配置环境变量：

```bash
# API 基础地址
VITE_API_BASE_URL=http://localhost:8190
```

### 开发代理

开发模式下自动代理 `/v1` 请求到后端，默认后端地址 `http://localhost:8190`。

修改 `vite.config.js` 中的代理配置：

```javascript
server: {
  proxy: {
    '/v1': {
      target: 'http://localhost:8190',  // 修改为你的后端地址
      changeOrigin: true
    }
  }
}
```

## 技术栈

- Vue 3.5
- Vue Router 4
- Pinia
- Element Plus 2.9
- Vite 6
- DPlayer（视频播放器）
- simple-uploader.js（文件上传）

## 项目结构

```
home-dash-web/
├── src/
│   ├── apis/          # API 接口
│   ├── components/    # 公共组件
│   ├── views/         # 页面组件
│   ├── router/        # 路由配置
│   ├── stores/        # 状态管理
│   ├── utils/         # 工具函数
│   └── assets/        # 静态资源
├── public/
├── dist/              # 构建产物
└── package.json
```

## 相关项目

- [home-dash](https://github.com/xionghaixu/home-dash) - 后端项目

## 许可证

MIT License
