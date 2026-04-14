<template>
  <div class="page-header" :class="{ 'page-header--bordered': bordered }">
    <div class="page-header__left">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  bordered: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);

  &--bordered {
    border: 1px solid var(--color-border-lighter);
  }

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: var(--font-line-height-tight);
  }

  &__subtitle {
    margin: var(--spacing-sm) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    flex-shrink: 0;
    align-items: center;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    padding: var(--spacing-xl);

    &__actions {
      margin-top: var(--spacing-md);
      justify-content: flex-start;
    }
  }
}
</style>
