<script setup lang="ts">
import { ref } from 'vue'
import YumIcon from '../components/YumIcon.vue'
import { requestNavigation } from '../runtime'
import { userStore } from '../stores/userStore'

const form = ref()
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const processing = ref(false)
const formError = ref<string | null>(null)

const nameRules = [
  (value: string) => !!value.trim() || 'Enter your full name.',
  (value: string) => value.trim().length >= 2 || 'Name must have at least 2 characters.',
  (value: string) => /^[\p{L}][\p{L}\s.'-]*$/u.test(value.trim()) || 'Name may contain letters, spaces, apostrophes, periods, or hyphens.',
]
const emailRules = [
  (value: string) => !!value.trim() || 'Enter your email address.',
  (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Use a valid email such as name@example.com.',
]
const phoneRules = [
  (value: string) => !!value.trim() || 'Enter your phone number.',
  (value: string) => /^\+?[0-9][0-9\s-]{6,18}$/.test(value.trim()) || 'Use 7–19 digits; spaces, +, and hyphens are allowed.',
]
const passwordRules = [
  (value: string) => !!value || 'Create a password.',
  (value: string) => value.length >= 8 || 'Password must be at least 8 characters.',
  (value: string) => /[a-z]/.test(value) || 'Include at least one lowercase letter.',
  (value: string) => /[A-Z]/.test(value) || 'Include at least one uppercase letter.',
  (value: string) => /\d/.test(value) || 'Include at least one number.',
]

async function submit() {
  formError.value = null
  const result = await form.value?.validate()
  if (!result?.valid) return
  processing.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 700))
  try {
    userStore.register({ name: name.value, email: email.value, phone: phone.value })
    await requestNavigation('/profile')
  } catch {
    formError.value = 'We could not create your account. Please try again.'
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <section class="register-shell page-shell" aria-labelledby="register-title">
    <header class="page-header">
      <div class="page-heading">
        <span class="eyebrow"><YumIcon name="person_add" /> Join the table</span>
        <h1 id="register-title">Create your Yum Ta Dum account</h1>
      </div>
      <div class="register-benefit" aria-hidden="true">
        <span>🥗</span>
        <strong>Fresh starts<br />taste better.</strong>
      </div>
    </header>

    <v-card class="surface-card register-card">
      <v-progress-linear v-if="processing" indeterminate color="secondary" aria-label="Creating account" />
      <v-card-text>
        <v-alert v-if="formError" type="error" variant="tonal" class="mb-5" role="alert">
          {{ formError }}
        </v-alert>

        <v-form ref="form" novalidate @submit.prevent="submit">
          <div class="form-grid">
            <v-text-field
              v-model="name"
              label="Full name"
              autocomplete="name"
              variant="outlined"
              :rules="nameRules"
              :disabled="processing"
              validate-on="blur lazy"
            >
              <template #prepend-inner><YumIcon name="badge" :size="20" /></template>
            </v-text-field>

            <v-text-field
              v-model="email"
              label="Email address"
              type="email"
              autocomplete="email"
              variant="outlined"
              :rules="emailRules"
              :disabled="processing"
              validate-on="blur lazy"
            >
              <template #prepend-inner><YumIcon name="mail" :size="20" /></template>
            </v-text-field>

            <v-text-field
              v-model="phone"
              label="Phone number"
              type="tel"
              autocomplete="tel"
              variant="outlined"
              placeholder="+970 59 123 4567"
              :rules="phoneRules"
              :disabled="processing"
              validate-on="blur lazy"
            >
              <template #prepend-inner><YumIcon name="phone" :size="20" /></template>
            </v-text-field>

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              variant="outlined"
              :rules="passwordRules"
              :disabled="processing"
              hint="8+ characters with uppercase, lowercase, and a number"
              persistent-hint
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
          </div>

          <div class="form-footer">
            <v-btn type="submit" color="secondary" size="large" elevation="0" :loading="processing" :disabled="processing">
              Create account
              <YumIcon name="arrow_forward" :size="20" />
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <p class="login-prompt">Already have an account? <button type="button" @click="requestNavigation('/login')">Log in</button></p>
  </section>
</template>

<style scoped>
.register-benefit { display: flex; align-items: center; gap: 14px; min-width: 250px; padding: 18px 22px; border-radius: 16px; color: white; background: #185e20; box-shadow: 0 12px 28px rgba(24,94,32,.16); }
.register-benefit span { font-size: 42px; }
.register-benefit strong { font-size: 17px; line-height: 1.35; }
.register-card { overflow: hidden; }
.register-card .v-card-text { padding: clamp(24px, 4vw, 40px); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 22px; }
.field-icon-button { display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 10px; color: #616161; background: transparent; cursor: pointer; }
.field-icon-button:hover { background: #eeeeee; }
.form-footer { display: flex; align-items: center; justify-content: flex-end; gap: 24px; margin-top: 18px; padding-top: 24px; border-top: 1px solid #e0e0e0; }
.login-prompt { margin: 0; color: #616161; text-align: center; }
.login-prompt button { border: 0; color: #185e20; background: transparent; cursor: pointer; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 760px) { .register-benefit { display: none; } .form-grid { grid-template-columns: 1fr; } .form-footer { align-items: stretch; flex-direction: column; } }
</style>
