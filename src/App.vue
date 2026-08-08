<script setup lang="ts">
import BrandLogo from './components/BrandLogo.vue'
import { requestNavigation } from './runtime'

withDefaults(defineProps<{ standalone?: boolean }>(), {
  standalone: false,
})

</script>

<template>
  <v-app theme="yumTheme" class="yum-app">
    <a class="skip-link" href="#yum-main">Skip to account content</a>
    <header v-if="!standalone" class="module-header">
      <BrandLogo :show-tagline="false" />
      <nav class="module-nav" aria-label="Account navigation">
        <v-btn variant="text" @click="requestNavigation('/orders')">Orders</v-btn>
        <v-btn variant="text" @click="requestNavigation('/profile')">Profile</v-btn>
        <v-btn variant="text" @click="requestNavigation('/login')">Login</v-btn>
        <v-btn variant="text" @click="requestNavigation('/register')">Register</v-btn>
      </nav>
    </header>

    <v-main id="yum-main" class="module-main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </v-main>
  </v-app>
</template>
