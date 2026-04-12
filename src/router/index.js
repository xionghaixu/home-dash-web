import { createRouter, createWebHistory } from 'vue-router'

/**
 * 路由配置
 * @description 定义应用的路由规则，包括文件列表、系统信息、视频播放等页面
 */
const routes = [
  {
    path: '',
    redirect: '/folder/0',
    component: () => import('@/views/layout/Layout.vue'),
    children: [
      {
        path: 'folder/:folderId',
        component: () => import('@/views/file/index.vue'),
        props: true,
        meta: { title: '文件列表' }
      },
      {
        path: '/system',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统信息' }
      }
    ]
  },
  {
    path: '/video/:fileId',
    component: () => import('@/views/video/index.vue'),
    props: true,
    meta: { title: '播放视频' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]

/**
 * 创建路由实例
 * @description 使用Vue Router 4的createRouter语法创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 路由守卫
 * @description 在路由切换时修改页面标题
 */
router.beforeEach((to, _, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
