<script setup lang="ts">
import YumIcon from './YumIcon.vue'
import { yumyMascotUrl } from '../branding'

defineProps<{
  title: string
  message: string
  actionLabel: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <section class="empty-state" role="status">
    <div class="yumy-asset">
      <img :src="yumyMascotUrl" alt="Yumy, the Yum Ta Dum mascot" />
      <span>Yumy</span>
    </div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <v-btn color="secondary" size="large" elevation="0" @click="$emit('action')">
      <YumIcon name="restaurant" :size="20" />
      {{ actionLabel }}
    </v-btn>
  </section>
</template>
