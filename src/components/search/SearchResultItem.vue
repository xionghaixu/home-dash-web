<template>
  <div
    :class="['result-item', `layout-${layout}`, { 'is-selected': selected }]"
    @click="$emit('click')"
  >
    <!-- 选择框 -->
    <div class="item-checkbox" @click.stop>
      <el-checkbox
        :model-value="selected"
        @change="$emit('select', $event)"
      />
    </div>

    <!-- 缩略图/图标 -->
    <div class="item-thumbnail">
      <template v-if="file.type === 'picture' && file.thumbnailUrl">
        <img :src="file.thumbnailUrl" :alt="file.fileName" loading="lazy" />
      </template>
      <template v-else-if="file.type === 'video' && file.thumbnailUrl">
        <img :src="file.thumbnailUrl" :alt="file.fileName" loading="lazy" />
        <div class="play-overlay">
          <el-icon><VideoPlay /></el-icon>
        </div>
      </template>
      <template v-else-if="file.type === 'audio'">
        <div class="audio-cover">
          <el-icon><Headset /></el-icon>
        </div>
      </template>
      <template v-else>
        <FileTypeIcon :type="file.type" :size="layout === 'grid' ? 48 : 32" />
      </template>
    </div>

    <!-- 信息区域 -->
    <div class="item-info">
      <div class="item-name" v-html="highlightedName"></div>
      <div class="item-meta">
        <span class="meta-size">{{ formatSize(file.size) }}</span>
        <span class="meta-date">{{ formatFileDate(file.updateTime) }}</span>
        <span v-if="file.favorite" class="meta-favorite">
          <el-icon><Star /></el-icon>
        </span>
        <span v-if="file.tags?.length" class="meta-tags">
          <el-tag
            v-for="tag in file.tags.slice(0, 2)"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="item-actions" @click.stop>
      <template v-if="file.type === 'video'">
        <el-button type="primary" link size="small" @click="$emit('play')">
          <el-icon><VideoPlay /></el-icon>
          播放
        </el-button>
      </template>
      <template v-else-if="file.type === 'audio'">
        <el-button type="primary" link size="small" @click="$emit('play')">
          <el-icon><Headset /></el-icon>
          播放
        </el-button>
      </template>
      <template v-else-if="file.type === 'picture'">
        <el-button type="primary" link size="small" @click="$emit('preview')">
          <el-icon><View /></el-icon>
          预览
        </el-button>
      </template>
      <template v-else-if="file.type === 'txt' || file.type === 'text'">
        <el-button type="primary" link size="small" @click="$emit('preview')">
          <el-icon><Document /></el-icon>
          预览
        </el-button>
      </template>
      <template v-else-if="file.type !== 'folder'">
        <el-button type="primary" link size="small" @click="$emit('download')">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
      </template>
      <el-button link size="small" @click="$emit('detail')">
        <el-icon><More /></el-icon>
        详情
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VideoPlay, Headset, View, Document, Download, More, Star } from '@element-plus/icons-vue'
import FileTypeIcon from '@/components/FileTypeIcon.vue'
import { formatSize } from '@/utils/index'
import { formatFileDate } from '@/utils/file'

const props = defineProps({
  file: { type: Object, required: true },
  layout: { type: String, default: 'list' },
  selected: { type: Boolean, default: false },
  keyword: { type: String, default: '' }
})

defineEmits(['click', 'select', 'preview', 'play', 'download', 'detail'])

const escapeHtml = str => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const highlightedName = computed(() => {
  if (!props.keyword || !props.file.fileName) return escapeHtml(props.file.fileName)
  const escaped = escapeHtml(props.file.fileName)
  const escapedKeyword = escapeHtml(props.keyword)
  const regex = new RegExp(`(${escapedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(regex, '<span class="keyword-highlight">$1</span>')
})
</script>

<style lang="scss" scoped>
.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }

  &.is-selected {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
  }

  // Grid layout
  &.layout-grid {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);

    .item-checkbox {
      position: absolute;
      top: var(--spacing-sm);
      left: var(--spacing-sm);
    }

    .item-thumbnail {
      width: 100%;
      height: 140px;
      margin-bottom: var(--spacing-sm);
    }

    .item-info {
      width: 100%;
    }

    .item-name {
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      justify-content: center;
      flex-wrap: wrap;
    }

    .item-actions {
      margin-top: var(--spacing-sm);
      justify-content: center;
    }
  }
}

.item-checkbox {
  flex-shrink: 0;
}

.item-thumbnail {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-fill-base);
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    color: white;
    font-size: 24px;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  &:hover .play-overlay {
    opacity: 1;
  }

  .audio-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 24px;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  :deep(.keyword-highlight) {
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
    background: var(--color-primary-bg);
    padding: 0 2px;
    border-radius: 2px;
  }
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.meta-favorite {
  color: var(--color-warning);
}

.meta-tags {
  display: flex;
  gap: var(--spacing-xs);
}

.item-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);

  .result-item:hover & {
    opacity: 1;
  }
}
</style>
