import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/layout/Layout.vue'),
    redirect: '/files',
    children: [
      {
        path: 'files',
        component: () => import('@/views/file/index.vue'),
        meta: { title: '文件列表', keepAlive: true }
      },
      {
        path: 'files/:folderId',
        component: () => import('@/views/file/index.vue'),
        props: true,
        meta: { title: '文件夹', keepAlive: true }
      },
      {
        path: 'recent',
        component: () => import('@/views/recent/index.vue'),
        meta: { title: '最近上传', keepAlive: true }
      },
      {
        path: 'category',
        component: () => import('@/views/category/index.vue'),
        meta: { title: '分类浏览', keepAlive: true }
      },
      {
        path: 'category/:categoryType',
        component: () => import('@/views/category/index.vue'),
        props: true,
        meta: { title: '分类详情', keepAlive: true }
      },
      {
        path: 'transfers',
        component: () => import('@/views/transfers/index.vue'),
        meta: { title: '传输列表', keepAlive: true }
      },
      {
        path: 'profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '设置' }
      },
      {
        path: 'system',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统信息' }
      },
      {
        path: 'search',
        component: () => import('@/views/search/index.vue'),
        meta: { title: '搜索结果' }
      }
    ]
  },
  {
    path: '/video/:fileId',
    component: () => import('@/views/video/index.vue'),
    props: true,
    meta: { title: '视频播放' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export const ROUTE_NAMES = {
  FILE_ROOT: '/',
  FILE_LIST: 'files',
  FILE_FOLDER: 'files/:folderId',
  RECENT: 'recent',
  CATEGORY: 'category',
  CATEGORY_TYPE: 'category/:categoryType',
  TRANSFERS: 'transfers',
  VIDEO: 'video/:fileId',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  SEARCH: 'search'
}

export const getFileRoute = (folderId = '0') => {
  if (!folderId && folderId !== '0' && folderId !== 0) {
    return '/files'
  }
  return folderId === '0' || folderId === 0 ? '/files' : `/files/${folderId}`
}

export function getCategoryRoute(categoryType) {
  return categoryType ? `/category/${categoryType}` : '/category'
}

export function getVideoRoute(fileId) {
  return `/video/${fileId}`
}

export function getSearchRoute(keyword) {
  return keyword ? `/search?q=${encodeURIComponent(keyword)}` : '/search'
}

export default router
