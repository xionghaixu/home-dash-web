# home-dash-web

## 项目简介

`home-dash-web` 是 HomeDash 的前端工程，基于 Vue 3 + Vite + Element Plus + Pinia，提供文件工作台、上传交互、系统信息和视频播放等界面能力。

## 当前状态（阶段一至阶段三）

- 阶段定位：已完成核心文件工作台、预览与检索整理、家庭媒体中心（已完全完成）
- 当前主导航能力：文件列表、最近上传、分类浏览、传输列表、系统信息、媒体分类浏览、全局搜索
- 标准交付页面：
  - 文件域：`files`、`recent`、`category`、`transfers`、`system`、`search`、`404`
  - 媒体域：`media/images`、`media/videos`、`media/audio`、`video`
- 核心交互：
  - 基础：上传、新建、重命名、删除、移动、复制、下载
  - 探索：列表排序、目录跳转、面包屑导航、动态闪烁高亮定位
  - 媒体：图片画廊预览、音频自动播放与队列、视频内嵌播放及状态追踪

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
