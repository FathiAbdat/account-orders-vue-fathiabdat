<script setup lang="ts">
import { computed } from 'vue'
import YumIcon from '../components/YumIcon.vue'
import { requestNavigation } from '../runtime'
import { userStore } from '../stores/userStore'

const profile = userStore.user
const authenticated = userStore.authenticated
const warning = userStore.storageWarning
const initials = computed(() =>
  profile.value.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join(''),
)

async function signOut() {
  userStore.logout()
  await requestNavigation('/login')
}
</script>

<template>
  <section class="page-shell" aria-labelledby="profile-title">
    <header class="page-header">
      <div class="page-heading">
        <span class="eyebrow"><YumIcon name="person" /> Your account</span>
        <h1 id="profile-title">Profile</h1>
        <p>Manage your contact details and saved delivery address.</p>
      </div>
      <v-btn color="primary" variant="outlined" @click="requestNavigation('/orders')">
        <YumIcon name="receipt_long" :size="20" /> View orders
      </v-btn>
    </header>

    <v-alert v-if="warning" type="warning" variant="tonal" role="status">
      {{ warning }}
    </v-alert>

    <v-alert v-if="!authenticated" type="info" variant="tonal" role="status">
      <template #title>You are browsing as a guest</template>
      Log in to continue managing your account, saved addresses, and orders.
      <template #append>
        <v-btn color="primary" variant="text" @click="requestNavigation('/login')">Log in</v-btn>
      </template>
    </v-alert>

    <div class="profile-grid">
      <v-card class="surface-card identity-card">
        <v-card-text>
          <div class="profile-avatar" aria-hidden="true">{{ initials }}</div>
          <h2>{{ profile.name }}</h2>
          <p class="muted">Member ID · {{ profile.id }}</p>
          <div class="identity-actions">
            <v-btn v-if="authenticated" color="error" variant="text" @click="signOut">
              <YumIcon name="logout" :size="20" /> Log out
            </v-btn>
            <v-btn v-else color="secondary" elevation="0" @click="requestNavigation('/register')">
              Create account
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <div class="profile-content">
        <v-card class="surface-card">
          <v-card-text>
            <div class="card-heading-row">
              <div>
                <span class="section-icon"><YumIcon name="contact_page" /></span>
                <h2>Contact details</h2>
              </div>
            </div>
            <dl class="detail-list">
              <div>
                <dt><YumIcon name="badge" :size="20" /> Name</dt>
                <dd>{{ profile.name }}</dd>
              </div>
              <div>
                <dt><YumIcon name="mail" :size="20" /> Email</dt>
                <dd>{{ profile.email }}</dd>
              </div>
              <div>
                <dt><YumIcon name="phone" :size="20" /> Phone</dt>
                <dd>{{ profile.phone }}</dd>
              </div>
            </dl>
          </v-card-text>
        </v-card>

        <v-card class="surface-card address-card">
          <v-card-text>
            <div class="card-heading-row">
              <div>
                <span class="section-icon address"><YumIcon name="home_pin" /></span>
                <h2>Saved address</h2>
              </div>
              <v-chip color="primary" variant="tonal" size="small">
                {{ profile.savedAddress.label }}
              </v-chip>
            </div>
            <address>
              <strong>{{ profile.savedAddress.fullName }}</strong>
              <span>{{ profile.savedAddress.streetAddress }}<template v-if="profile.savedAddress.building">, {{ profile.savedAddress.building }}</template></span>
              <span>{{ profile.savedAddress.area ? `${profile.savedAddress.area}, ` : '' }}{{ profile.savedAddress.city }}<template v-if="profile.savedAddress.postalCode"> · {{ profile.savedAddress.postalCode }}</template></span>
              <span>{{ profile.savedAddress.phone }}</span>
            </address>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-grid { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 24px; align-items: start; }
.identity-card { text-align: center; }
.identity-card .v-card-text { display: grid; justify-items: center; padding: 36px 24px; }
.profile-avatar { display: grid; width: 92px; height: 92px; margin-bottom: 16px; place-items: center; border: 7px solid #e4f1e4; border-radius: 30px; color: #fff; background: linear-gradient(145deg, #2e7d32, #185e20); box-shadow: 0 14px 28px rgba(46,125,50,.2); font-size: 30px; font-weight: 800; }
.identity-card h2 { margin: 0 0 2px; font-weight: 800; }
.identity-actions { width: 100%; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
.profile-content { display: grid; gap: 24px; }
.card-heading-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 22px; }
.card-heading-row > div { display: flex; align-items: center; gap: 12px; }
.card-heading-row h2 { margin: 0; font-size: 21px; font-weight: 800; }
.section-icon { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 14px; color: #185e20; background: #e9f4e9; }
.section-icon.address { color: #a24b00; background: #fff0df; }
.detail-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; }
.detail-list > div { min-width: 0; padding: 0 20px; border-right: 1px solid #e0e0e0; }
.detail-list > div:first-child { padding-left: 0; }
.detail-list > div:last-child { padding-right: 0; border-right: 0; }
.detail-list dt { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; color: #666; font-size: 13px; font-weight: 700; }
.detail-list dd { overflow-wrap: anywhere; margin: 0; font-size: 16px; font-weight: 800; }
address { display: grid; gap: 8px; padding: 22px; border: 1px solid #d6e5d5; border-radius: 16px; background: #f5faf4; font-style: normal; line-height: 1.5; }
address strong { color: #185e20; font-size: 17px; }
address span { color: #474747; }
@media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } .identity-card .v-card-text { grid-template-columns: auto 1fr auto; justify-items: start; gap: 0 20px; text-align: left; } .profile-avatar { grid-row: span 3; margin: 0; } .identity-actions { width: auto; margin: 0; padding: 0; border: 0; } }
@media (max-width: 680px) { .identity-card .v-card-text { display: grid; grid-template-columns: 1fr; justify-items: center; text-align: center; } .profile-avatar { grid-row: auto; margin-bottom: 14px; } .identity-actions { width: 100%; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0e0e0; } .detail-list { grid-template-columns: 1fr; gap: 16px; } .detail-list > div { padding: 0 0 16px; border-right: 0; border-bottom: 1px solid #e0e0e0; } .detail-list > div:last-child { padding-bottom: 0; border-bottom: 0; } }
</style>
