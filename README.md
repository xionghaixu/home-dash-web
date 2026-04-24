# home-dash-web

## 项目简介

`home-dash-web` 是 HomeDash 的前端工程，基于 Vue 3 + Vite + Element Plus + Pinia，提供文件工作台、上传交互、系统信息和视频播放等界面能力。

## 当前状态（阶段一）

- 阶段定位：核心文件工作台（已完全完成）
- 当前主导航能力：文件列表、最近上传、分类浏览、传输列表、系统信息
- 阶段一标准交付页面：
  - `files`、`recent`、`category`、`transfers`、`system`、`video`、`404`
- 阶段一标准交互：
  - 上传、新建、重命名、删除、移动、复制、下载
  - 列表排序、面包屑导航、分类摘要、最近上传、传输任务展示

## 技术栈

- Vue 3.5.13
- Vue Router 4.5.0
- Pinia 2.3.0
- Element Plus 2.9.0
- Vite 6.0.0
- Axios 1.7.7
- Node.js >= 20

## 快速开始

```bash
npm install
npm run dev
npm run build
npm run preview
```
