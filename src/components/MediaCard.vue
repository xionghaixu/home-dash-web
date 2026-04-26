<template>
  <div class="media-card" @click="handleClick">
    <div class="media-card__cover-wrapper">
      <div v-if="cover" class="media-card__cover" :style="{ backgroundImage: `url(${cover})` }"></div>
      <div v-else class="media-card__cover media-card__cover--placeholder">
        <el-icon :size="40"><component :is="placeholderIcon" /></el-icon>
      </div>
      <div class="media-card__overlay">
        <div class="media-card__play-icon">
          <el-icon :size="20"><VideoPlay /></el-icon>
        </div>
      </div>
      <div v-if="badge" class="media-card__badge">{{ badge }}</div>
      <div v-if="duration" class="media-card__duration">{{ duration }}</div>
    </div>
    <div class="media-card__info">
      <div class="media-card__title" :title="title">{{ title }}</div>
      <div v-if="meta" class="media-card__meta">{{ meta }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VideoPlay, Picture, Headset, Document, Folder } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, required: true },
  cover: { type: String, default: '' },
  type: { type: String, default: 'video' },
  badge: { type: String, default: '' },
  duration: { type: String, default: '' },
  meta: { type: String, default: '' }
})

const emit = defineEmits(['click'])

const placeholderIcon = computed(() => {
  const map = {
    video: VideoPlay,
    image: Picture,
    audio: Headset,
    folder: Folder,
    document: Document
  }
  return map[props.type] || Document
})

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.media-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-fill-base);
  transition: all var(--transition-base);
  cursor: pointer;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow-lg);

    .media-card__cover {
      transform: scale(1.1);
    }

    .media-card__overlay {
      opacity: 1;
    }
  }

  &__cover-wrapper {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--color-fill-light);
  }

  &__cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform var(--transition-slow);

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-placeholder);
    }
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-base);
    border-radius: var(--radius-lg);
  }

  &__play-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    font-size: 20px;
    transition: transform var(--transition-fast);

    &:hover {
      transform: scale(1.1);
    }
  }

  &__info {
    padding: var(--spacing-sm) 0;
  }

  &__title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    padding: 2px 8px;
    background: var(--color-primary);
    color: #fff;
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-sm);
    z-index: 2;
  }

  &__duration {
    position: absolute;
    bottom: var(--spacing-sm);
    right: var(--spacing-sm);
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    font-size: 11px;
    border-radius: var(--radius-sm);
    z-index: 2;
  }
}
</style>
