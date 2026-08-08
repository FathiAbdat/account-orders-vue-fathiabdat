<script setup lang="ts">
import { ref } from 'vue'
import BrandLogo from '../components/BrandLogo.vue'
import YumIcon from '../components/YumIcon.vue'
import { yumyMascotUrl } from '../branding'
import { requestNavigation } from '../runtime'
import { userStore } from '../stores/userStore'

const form = ref()
const email = ref('fathi@example.com')
const password = ref('YumTaDum1')
const showPassword = ref(false)
const processing = ref(false)
const formError = ref<string | null>(null)

const emailRules = [
  (value: string) => !!value.trim() || 'Enter your email address.',
  (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Use a valid email such as name@example.com.',
]
const passwordRules = [
  (value: string) => !!value || 'Enter your password.',
  (value: string) => value.length >= 8 || 'Password must be at least 8 characters.',
]

async function submit() {
  formError.value = null
  const result = await form.value?.validate()
  if (!result?.valid) return
  processing.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 650))
  try {
    userStore.login(email.value.trim().toLowerCase())
    await requestNavigation('/profile')
  } catch {
    formError.value = 'We could not complete your sign-in. Please try again.'
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <section class="auth-layout page-shell" aria-labelledby="login-title">
    <div class="auth-story">
      <div class="story-brand"><BrandLogo inverse size="large" /></div>
      <span class="eyebrow"><YumIcon name="waving_hand" /> Welcome back</span>
      <h1 id="login-title">Your next good meal is waiting.</h1>
      <p>Sign in to view your saved profile and every delicious order in one place.</p>
      <img class="login-mascot" :src="yumyMascotUrl" alt="" aria-hidden="true" />
    </div>

    <v-card class="surface-card auth-card">
      <v-progress-linear v-if="processing" indeterminate color="secondary" aria-label="Signing in" />
      <v-card-text>
        <div class="auth-card-heading">
          <span class="auth-icon"><YumIcon name="person" :size="28" /></span>
          <div>
            <h2>Log in</h2>
            <p class="caption">Enter your email address and password to continue.</p>
          </div>
        </div>

        <v-alert v-if="formError" type="error" variant="tonal" class="mb-5" role="alert">
          {{ formError }}
        </v-alert>

        <v-form ref="form" novalidate @submit.prevent="submit">
          <v-text-field
            v-model="email"
            label="Email address"
            type="email"
            autocomplete="email"
            variant="outlined"
            prepend-inner-icon=""
            :rules="emailRules"
            :disabled="processing"
            validate-on="blur lazy"
          >
            <template #prepend-inner><YumIcon name="mail" :size="20" /></template>
          </v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            variant="outlined"
            :rules="passwordRules"
            :disabled="processing"
            validate-on="blur lazy"
          >
            <template #prepend-inner><YumIcon name="key" :size="20" /></template>
            <template #append-inner>
              <button
                type="button"
                class="field-icon-button"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <YumIcon :name="showPassword ? 'visibility_off' : 'visibility'" :size="20" />
              </button>
            </template>
          </v-text-field>

          <v-btn
            type="submit"
            color="secondary"
            size="large"
            block
            elevation="0"
            :loading="processing"
            :disabled="processing"
          >
            Log in
            <YumIcon name="arrow_forward" :size="20" />
          </v-btn>
        </v-form>

        <p class="auth-switch">
          New to Yum Ta Dum?
          <button type="button" @click="requestNavigation('/register')">Create an account</button>
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>

<style scoped>
.auth-layout { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(380px, .75fr); gap: 32px; align-items: stretch; }
.auth-story { position: relative; min-height: 590px; overflow: hidden; padding: clamp(32px, 6vw, 72px); border-radius: 24px; color: white; background: linear-gradient(145deg, #185e20 0%, #2e7d32 58%, #3f9144 100%); box-shadow: 0 16px 40px rgba(24,94,32,.18); }
.auth-story .eyebrow, .auth-story p { color: rgba(255,255,255,.88); }
.story-brand { display: block; width: fit-content; }
.auth-story .eyebrow { display: flex; width: fit-content; margin-top: 34px; }
.auth-story h1 { position: relative; z-index: 1; max-width: 560px; margin-top: 16px; font-size: clamp(38px, 6vw, 62px); line-height: 1.03; }
.auth-story > p { max-width: 540px; font-size: 18px; line-height: 1.65; }
.login-mascot { position: absolute; right: -110px; bottom: -88px; width: 620px; max-width: none; opacity: .2; transform: rotate(-7deg); pointer-events: none; }
.auth-card { align-self: center; overflow: hidden; }
.auth-card .v-card-text { padding: clamp(24px, 4vw, 36px); }
.auth-card-heading { display: flex; gap: 16px; margin-bottom: 28px; }
.auth-card-heading h2 { margin-bottom: 4px; }
.auth-icon { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 15px; color: #185e20; background: #e9f4e9; }
.field-icon-button { display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 10px; color: #616161; background: transparent; cursor: pointer; }
.field-icon-button:hover { background: #eeeeee; }
.auth-switch { margin: 24px 0 0; color: #616161; text-align: center; }
.auth-switch button { border: 0; color: #185e20; background: transparent; cursor: pointer; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 880px) { .auth-layout { grid-template-columns: 1fr; } .auth-story { min-height: 360px; } }
@media (max-width: 560px) { .auth-story { min-height: 380px; padding: 28px; } .auth-story h1 { font-size: 38px; } .login-mascot { right: -145px; width: 520px; } }
</style>
