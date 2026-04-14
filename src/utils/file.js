import { formatDateTime, formatSize } from './index'

export const CATEGORY_OPTIONS = [
  { key: 'picture', label: '图片', description: '按图片文件快速浏览' },
  { key: 'video', label: '视频', description: '按视频文件快速浏览' },
  { key: 'audio', label: '音频', description: '按音频文件快速浏览' },
  { key: 'document', label: '文档', description: '按文档类文件快速浏览' },
  { key: 'compress', label: '压缩包', description: '按压缩文件快速浏览' },
  { key: 'other', label: '其他文件', description: '按其他文件快速浏览' }
]

const FILE_TYPE_LABELS = {
  folder: '文件夹',
  picture: '图片',
  video: '视频',
  audio: '音频',
  pdf: 'PDF 文档',
  doc: '文档',
  document: '文档',
  txt: '文本',
  ppt: '演示文稿',
  web: '网页文件',
  code: '代码文件',
  compress: '压缩包',
  compress_file: '压缩包',
  other: '其他文件'
}

const FILE_TYPE_ICONS = new Set([
  'default',
  'folder',
  'pdf',
  'compress_file',
  'web',
  'video',
  'audio',
  'picture',
  'doc',
  'txt',
  'torrent',
  'ppt',
  'code'
])

export const getFileIconType = (type) => {
  return FILE_TYPE_ICONS.has(type) ? type : 'default'
}

export const getFileTypeLabel = (type) => {
  return FILE_TYPE_LABELS[type] || '其他文件'
}

export const isFolderFile = (file) => file?.type === 'folder'

export const isVideoFile = (file) => file?.type === 'video'

export const formatFileSize = (file, pointLength = 2) => {
  if (!file || isFolderFile(file) || file.size === null || file.size === undefined) {
    return '-'
  }
  return formatSize(file.size, pointLength)
}

export const formatFileDate = (value) => {
  if (!value) {
    return '-'
  }
  return formatDateTime(value)
}

export const resolveErrorMessage = (error, fallback = '请求失败，请稍后重试') => {
  return error?.data?.msg || error?.msg || error?.message || fallback
}
