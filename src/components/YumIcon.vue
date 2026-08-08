<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    size?: number
    decorative?: boolean
  }>(),
  {
    size: 22,
    decorative: true,
  },
)
</script>

<template>
  <span
    class="material-symbols-outlined yum-icon"
    :style="{ fontSize: `${size}px` }"
    :aria-hidden="decorative ? 'true' : undefined"
  >{{ name }}</span>
</template>
