<template>
  <div
    class="data-card"
    :class="[`data-card--${type}`, { 'data-card--clickable': clickable }]"
    @click="handleClick"
  >
    <div v-if="icon" class="data-card__icon">
      <el-icon :size="22"><component :is="icon" /></el-icon>
    </div>
    <div class="data-card__content">
      <div class="data-card__label">{{ label }}</div>
      <div class="data-card__value">{{ displayValue }}</div>
      <div v-if="extra" class="data-card__extra">{{ extra }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: 0
  },
  extra: {
    type: String,
    default: ''
  },
  icon: {
    type: [String, Object],
    default: null
  },
  type: {
    type: String,
    default: 'primary',
    validator: val => ['primary', 'success', 'warning', 'danger', 'info'].includes(val)
  },
  clickable: {
    type: Boolean,
    default: false
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const displayValue = computed(() => {
  return `${props.prefix}${typeof props.value === 'number' ? props.value.toLocaleString() : props.value}${props.suffix}`
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.data-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-lighter);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &--clickable {
    cursor: pointer;

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
  }

  &__icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    flex-shrink: 0;
  }

  &--primary &__icon {
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  &--success &__icon {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  &--warning &__icon {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  &--danger &__icon {
    background: var(--color-danger-light);
    color: var(--color-danger);
  }

  &--info &__icon {
    background: var(--color-info-light);
    color: var(--color-info);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xs);
  }

  &__value {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  &__extra {
    font-size: var(--font-size-xs);
    color: var(--color-text-placeholder);
    margin-top: var(--spacing-xs);
  }
}
</style>
