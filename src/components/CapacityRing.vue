<template>
  <div class="capacity-ring">
    <svg viewBox="0 0 120 120" class="ring-svg">
      <circle
        class="ring-bg"
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke-width="12"
      />
      <circle
        class="ring-progress"
        :class="progressClass"
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke-width="12"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
      />
    </svg>
    <div class="ring-content">
      <div class="ring-percent">{{ percentage }}%</div>
      <div class="ring-label">已使用</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0
  }
})

const circumference = 2 * Math.PI * 52

const dashOffset = computed(() => {
  const progress = Math.min(100, Math.max(0, props.percentage))
  return circumference * (1 - progress / 100)
})

const progressClass = computed(() => {
  if (props.percentage >= 90) return 'ring-progress--danger'
  if (props.percentage >= 75) return 'ring-progress--warning'
  return 'ring-progress--success'
})
</script>

<style lang="scss" scoped>
.capacity-ring {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  stroke: var(--color-fill-base);
}

.ring-progress {
  stroke: var(--color-success);
  transition: stroke-dashoffset 0.6s ease, stroke 0.3s ease;

  &--success {
    stroke: var(--color-success);
  }

  &--warning {
    stroke: var(--color-warning);
  }

  &--danger {
    stroke: var(--color-danger);
  }
}

.ring-content {
  text-align: center;
  z-index: 1;
}

.ring-percent {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.ring-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
