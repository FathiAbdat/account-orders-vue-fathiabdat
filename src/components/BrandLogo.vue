<script setup lang="ts">
import { yumyMascotUrl } from '../branding'

withDefaults(
  defineProps<{
    inverse?: boolean
    showTagline?: boolean
    size?: 'compact' | 'default' | 'large'
  }>(),
  {
    inverse: false,
    showTagline: true,
    size: 'default',
  },
)
</script>

<template>
  <div
    class="brand-logo"
    :class="[`brand-logo--${size}`, { 'brand-logo--inverse': inverse }]"
    aria-label="Yum Ta Dum"
  >
    <span class="brand-logo__mascot" aria-hidden="true">
      <img :src="yumyMascotUrl" alt="" />
    </span>
    <span class="brand-logo__copy">
      <strong>Yum Ta Dum</strong>
      <small v-if="showTagline">Good food. Good mood.</small>
    </span>
  </div>
</template>

<style scoped>
.brand-logo { display: inline-flex; min-width: 0; align-items: center; gap: 8px; color: #185e20; white-space: nowrap; }
.brand-logo__mascot { position: relative; display: block; width: 56px; height: 56px; overflow: hidden; flex: 0 0 auto; }
.brand-logo__mascot img { position: absolute; top: -3px; left: -35px; width: 120px; max-width: none; height: auto; }
.brand-logo__copy { display: grid; gap: 1px; min-width: 0; }
.brand-logo__copy strong { color: inherit; font-size: 20px; font-weight: 900; letter-spacing: -.03em; line-height: 1.1; }
.brand-logo__copy small { color: #616161; font-size: 10px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.brand-logo--compact { gap: 5px; }
.brand-logo--compact .brand-logo__mascot { width: 46px; height: 46px; }
.brand-logo--compact .brand-logo__mascot img { top: -2px; left: -29px; width: 100px; }
.brand-logo--compact .brand-logo__copy strong { font-size: 17px; }
.brand-logo--large { gap: 10px; }
.brand-logo--large .brand-logo__mascot { width: 84px; height: 84px; }
.brand-logo--large .brand-logo__mascot img { top: -5px; left: -53px; width: 182px; }
.brand-logo--large .brand-logo__copy strong { font-size: 28px; }
.brand-logo--large .brand-logo__copy small { font-size: 11px; }
.brand-logo--inverse { color: #fff; }
.brand-logo--inverse .brand-logo__copy small { color: rgba(255,255,255,.78); }
</style>
