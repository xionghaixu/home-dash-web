# home-dash-web 前端开发规范

## 1. 文档定位

本文件是 `home-dash-web` 的规范入口，负责：

- 工程结构与代码约定
- 组件、路由、状态管理规范
- API 调用与错误处理规范
- 文档去重与维护规则

说明：`README.md` 只放项目介绍和运行方式；`OPTIMIZATION_SUGGESTIONS.md` 只放阶段规划。

## 2. 项目基线

- Vue 3.5.13 + Vite 6.0.0 + Element Plus 2.9.0
- Vue Router 4.5.0 + Pinia 2.3.0
- Axios 1.7.7
- Node.js >= 20
- 当前阶段：阶段一至阶段三已完全完成，阶段四至六为规划中

## 3. 当前结构（按现状）

```text
home-dash-web/
├── src/
│   ├── apis/
│   ├── components/
│   ├── router/
│   ├── stores/
│   ├── styles/
│   ├── utils/
│   └── views/
└── package.json
```

## 4. 代码规范

- 缩进统一 2 空格（沿用当前 Vue 工程风格）
- 组件名使用 PascalCase
- 变量/方法使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 统一使用 ESLint + Prettier

## 5. 组件规范

- 优先使用 `<script setup>`
- 组件通信优先级：`props/emits` -> `provide/inject` -> `Pinia`
- 复杂页面按“容器组件 + 展示组件”拆分
- 可复用交互优先沉淀为 `components/` 下通用组件

## 6. 路由规范

- 路由统一在 `src/router/index.js` 维护
- 阶段一主交付路由：`/files`、`/recent`、`/category`、`/transfers`、`/system`、`/video/:fileId`
- 预埋路由（后续阶段交付）：`/search`、`/profile`、`/settings`
- 必须保留 `404` 兜底路由

## 7. 状态管理规范

- 全局状态统一使用 Pinia
- 页面私有状态优先使用 `ref/reactive`
- Store 必须按领域拆分，禁止巨型单 Store

## 8. API 调用规范

- API 统一封装在 `src/apis/`
- 开发环境通过 Vite 代理转发 `/v1` 到后端
- 响应结构按后端 `ResponseDto` 解析
- 错误处理统一接入 `utils/errorHandler.js`

### 8.1 后端接口前缀

- API 前缀：`/v1`
- 常用能力：文件管理、资源分块、系统信息

## 9. 交互与样式规范

- 页面必须提供加载态、空态、错误态
- 批量操作必须有禁用态与结果反馈
- 样式变量统一使用 `styles/variables.scss` 中设计令牌
- 主题能力由 `stores/theme.js` 统一管理

## 10. 文档治理与去重规则

- `README.md`：定位与运行说明
- `SKILLS_SPEC.md`：工程规范，不写阶段路线
- `OPTIMIZATION_SUGGESTIONS.md`：阶段路线，不写编码细则
- 不在多个文档重复维护同一规则

## 11. 强制约束

- 禁止直接在组件里硬编码后端地址
- 禁止在 UI 层吞掉异常而不反馈
- 禁止引入重型依赖替代已有成熟能力
- 功能或路由发生变化时，必须同步更新对应文档
