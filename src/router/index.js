import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/layout/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', keepAlive: true }
      },
      {
        path: 'files',
        component: () => import('@/views/file/index.vue'),
        meta: { title: '全部文件', keepAlive: true }
      },
      {
        path: 'files/:folderId',
        component: () => import('@/views/file/index.vue'),
        props: true,
        meta: { title: '文件夹', keepAlive: true }
      },
      {
        path: 'recent',
        redirect: '/files',
        meta: { title: '全部文件', keepAlive: true }
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
        path: 'system',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统信息' }
      },
      {
        path: 'search',
        component: () => import('@/views/search/index.vue'),
        meta: { title: '搜索结果' }
      },
      {
        path: 'media/images',
        component: () => import('@/views/media/images/index.vue'),
        meta: { title: '图片', keepAlive: true }
      },
      {
        path: 'media/videos',
        component: () => import('@/views/media/videos/index.vue'),
        meta: { title: '视频', keepAlive: true }
      },
      {
        path: 'media/audio',
        component: () => import('@/views/media/audio/index.vue'),
        meta: { title: '音频', keepAlive: true }
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
    path: '/media/videos/:id/play',
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
  CATEGORY: 'category',
  CATEGORY_TYPE: 'category/:categoryType',
  TRANSFERS: 'transfers',
  VIDEO: 'video/:fileId',
  SYSTEM: 'system',
  SEARCH: 'search',
  MEDIA_IMAGES: 'media/images',
  MEDIA_VIDEOS: 'media/videos',
  MEDIA_AUDIO: 'media/audio'
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
