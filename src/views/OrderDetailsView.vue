<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import YumIcon from '../components/YumIcon.vue'
import { formatDate, formatMoney, formatOrderStatus, paymentLabel, statusIcon } from '../formatting'
import { requestNavigation } from '../runtime'
import { orderStore } from '../stores/orderStore'
import type { OrderStatus } from '../types'

const route = useRoute()
const isLoading = orderStore.isLoading
const orderId = computed(() => String(route.params.orderId ?? ''))
const order = computed(() => orderStore.findOrder(orderId.value))

const progressSteps: Array<{ status: Exclude<OrderStatus, 'cancelled'>; label: string; icon: string }> = [
  { status: 'confirmed', label: 'Confirmed', icon: 'check_circle' },
  { status: 'preparing', label: 'Preparing', icon: 'skillet' },
  { status: 'out-for-delivery', label: 'On the way', icon: 'delivery_dining' },
  { status: 'delivered', label: 'Delivered', icon: 'home' },
]

const currentStep = computed(() => {
  if (!order.value || order.value.status === 'cancelled') return -1
  return progressSteps.findIndex((step) => step.status === order.value?.status)
})

function mealEmoji(category: string) {
  const normalized = category.toLowerCase()
  if (normalized.includes('dessert')) return '🍰'
  if (normalized.includes('salad')) return '🥗'
  if (normalized.includes('grill')) return '🍢'
  if (normalized.includes('rice')) return '🍲'
  return '🥙'
}
</script>

<template>
  <section class="page-shell" :aria-labelledby="order ? 'order-title' : 'missing-order-title'">
    <template v-if="isLoading">
      <v-skeleton-loader type="heading, paragraph" class="surface-card" />
      <div class="detail-grid">
        <v-skeleton-loader type="article, article" class="surface-card" />
        <v-skeleton-loader type="article" class="surface-card" />
      </div>
    </template>

    <template v-else-if="order">
      <header class="order-detail-header">
        <button type="button" class="back-button" @click="requestNavigation('/orders')">
          <YumIcon name="arrow_back" :size="20" /> Back to orders
        </button>
        <div class="detail-title-row">
          <div class="page-heading">
            <span class="eyebrow"><YumIcon name="receipt_long" /> {{ order.restaurantName }}</span>
            <h1 id="order-title">Order {{ order.orderId }}</h1>
            <p>Placed {{ formatDate(order.createdAt, true) }}</p>
          </div>
          <v-chip size="large" class="status-chip" :class="`status-${order.status}`">
            <YumIcon :name="statusIcon(order.status)" :size="19" />
            <span>{{ formatOrderStatus(order.status) }}</span>
          </v-chip>
        </div>
      </header>

      <v-alert v-if="order.status === 'cancelled'" type="error" variant="tonal" role="status">
        <template #title>This order was cancelled</template>
        The order remains in your order history for reference.
      </v-alert>

      <section v-else class="progress-card surface-card" aria-label="Order progress">
        <div
          v-for="(step, index) in progressSteps"
          :key="step.status"
          class="progress-step"
          :class="{ complete: index <= currentStep, current: index === currentStep }"
        >
          <span class="progress-dot"><YumIcon :name="step.icon" :size="20" /></span>
          <span><strong>{{ step.label }}</strong><small>{{ index < currentStep ? 'Completed' : index === currentStep ? 'Current status' : 'Next' }}</small></span>
        </div>
      </section>

      <div class="detail-grid">
        <div class="detail-main">
          <v-card class="surface-card">
            <v-card-text>
              <div class="section-heading">
                <div>
                  <span class="section-icon"><YumIcon name="restaurant_menu" /></span>
                  <h2>Your meals</h2>
                </div>
                <span class="item-count">{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }} items</span>
              </div>
              <ul class="meal-list">
                <li v-for="item in order.items" :key="item.id">
                  <div class="meal-visual" aria-hidden="true">{{ mealEmoji(item.category) }}</div>
                  <div class="meal-copy">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.description }}</p>
                    <span>{{ item.category }}</span>
                  </div>
                  <div class="meal-price">
                    <span>{{ item.quantity }} × {{ formatMoney(item.price) }}</span>
                    <strong>{{ formatMoney(item.price * item.quantity) }}</strong>
                  </div>
                </li>
              </ul>
            </v-card-text>
          </v-card>

          <div class="info-grid">
            <v-card class="surface-card">
              <v-card-text>
                <div class="info-heading">
                  <span><YumIcon name="location_on" /></span>
                  <div><small>Delivery address</small><h3>{{ order.shippingAddress.label }}</h3></div>
                </div>
                <address>
                  <strong>{{ order.shippingAddress.fullName }}</strong>
                  <span>{{ order.shippingAddress.streetAddress }}</span>
                  <span v-if="order.shippingAddress.building">{{ order.shippingAddress.building }}</span>
                  <span>{{ order.shippingAddress.area ? `${order.shippingAddress.area}, ` : '' }}{{ order.shippingAddress.city }}</span>
                  <span>{{ order.shippingAddress.phone }}</span>
                </address>
              </v-card-text>
            </v-card>

            <v-card class="surface-card">
              <v-card-text>
                <div class="info-heading">
                  <span class="orange"><YumIcon name="schedule" /></span>
                  <div><small>Delivery choice</small><h3>{{ order.deliveryMethod === 'asap' ? 'ASAP' : 'Scheduled' }}</h3></div>
                </div>
                <div class="delivery-value">
                  <template v-if="order.deliveryMethod === 'asap'">
                    <strong>{{ order.estimatedDeliveryMinutes ?? 30 }} minutes</strong>
                    <span>Estimated delivery window</span>
                  </template>
                  <template v-else>
                    <strong>{{ order.scheduledFor ? formatDate(order.scheduledFor, true) : 'Time unavailable' }}</strong>
                    <span>Scheduled delivery</span>
                  </template>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <aside class="order-summary" aria-label="Order totals and payment">
          <v-card class="surface-card summary-card">
            <v-card-text>
              <div class="summary-heading">
                <span class="section-icon orange"><YumIcon name="payments" /></span>
                <div><span>Payment method</span><strong>{{ paymentLabel(order.paymentMethod) }}</strong></div>
              </div>
              <div class="payment-note"><YumIcon name="verified_user" :size="17" /> Payment recorded</div>
              <div class="totals" aria-label="Totals breakdown">
                <div><span>Subtotal</span><strong>{{ formatMoney(order.subtotal) }}</strong></div>
                <div><span>Discount</span><strong class="discount">−{{ formatMoney(order.discount) }}</strong></div>
                <div><span>Delivery fee</span><strong>{{ order.deliveryFee === 0 ? 'Free' : formatMoney(order.deliveryFee) }}</strong></div>
                <div class="grand-total"><span>Total</span><strong>{{ formatMoney(order.total) }}</strong></div>
              </div>
              <div v-if="order.userId === null" class="guest-order-note">
                <YumIcon name="person_off" />
                <span><strong>Guest order</strong>This order is available without logging in.</span>
              </div>
              <v-btn color="secondary" block elevation="0" @click="requestNavigation('/restaurants')">
                Order something new <YumIcon name="restaurant" :size="20" />
              </v-btn>
            </v-card-text>
          </v-card>
        </aside>
      </div>
    </template>

    <div v-else class="missing-order" role="alert">
      <span class="missing-icon"><YumIcon name="receipt_long" :size="42" /></span>
      <h1 id="missing-order-title">We couldn’t find that order</h1>
      <p>The order may have been removed, or the link may be incorrect.</p>
      <v-btn color="primary" size="large" @click="requestNavigation('/orders')">
        <YumIcon name="arrow_back" :size="20" /> Return to order history
      </v-btn>
    </div>
  </section>
</template>

<style scoped>
.order-detail-header { display: grid; gap: 18px; }
.back-button { display: inline-flex; width: fit-content; min-height: 42px; align-items: center; gap: 7px; padding: 0 10px 0 4px; border: 0; border-radius: 10px; color: #185e20; background: transparent; cursor: pointer; font-weight: 800; }
.back-button:hover { background: #e9f4e9; }
.detail-title-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
.progress-card { display: grid; grid-template-columns: repeat(4, 1fr); padding: 22px 24px; }
.progress-step { position: relative; display: flex; align-items: center; gap: 11px; color: #858585; }
.progress-step::after { position: absolute; top: 20px; right: 12px; left: 52px; height: 3px; border-radius: 999px; background: #e0e0e0; content: ''; }
.progress-step:last-child::after { display: none; }
.progress-step.complete { color: #185e20; }
.progress-step.complete::after { background: #77b87a; }
.progress-dot { position: relative; z-index: 1; display: grid; width: 40px; height: 40px; flex: 0 0 auto; place-items: center; border: 2px solid #d2d2d2; border-radius: 50%; background: #fff; }
.progress-step.complete .progress-dot { border-color: #2e7d32; color: #fff; background: #2e7d32; }
.progress-step.current .progress-dot { box-shadow: 0 0 0 6px #e2f1e3; }
.progress-step strong, .progress-step small { display: block; }.progress-step strong { font-size: 14px; }.progress-step small { margin-top: 2px; font-size: 11px; }
.detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 24px; align-items: start; }
.detail-main { display: grid; gap: 24px; min-width: 0; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.section-heading > div { display: flex; align-items: center; gap: 12px; }
.section-heading h2 { margin: 0; }
.section-icon { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 14px; color: #185e20; background: #e9f4e9; }
.section-icon.orange { color: #a24b00; background: #fff0df; }
.item-count { padding: 6px 10px; border-radius: 999px; color: #616161; background: #f1f1f1; font-size: 12px; font-weight: 800; }
.meal-list { margin: 0; padding: 0; list-style: none; }
.meal-list li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 18px 0; border-bottom: 1px solid #e0e0e0; }
.meal-list li:last-child { padding-bottom: 0; border-bottom: 0; }
.meal-visual { display: grid; width: 64px; height: 64px; place-items: center; border-radius: 16px; background: linear-gradient(145deg, #fff3e0, #f3e3c8); font-size: 32px; }
.meal-copy h3 { margin: 0 0 3px; font-size: 17px; }.meal-copy p { margin: 0 0 5px; color: #616161; font-size: 13px; line-height: 1.35; }.meal-copy span { color: #185e20; font-size: 12px; font-weight: 700; }
.meal-price { display: grid; justify-items: end; gap: 5px; }.meal-price span { color: #616161; font-size: 12px; }.meal-price strong { color: #185e20; font-size: 16px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.info-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.info-heading > span { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; color: #185e20; background: #e9f4e9; }.info-heading > span.orange { color: #a24b00; background: #fff0df; }
.info-heading small, .info-heading h3 { display: block; }.info-heading small { color: #616161; }.info-heading h3 { margin: 1px 0 0; font-size: 18px; }
address { display: grid; gap: 5px; font-style: normal; line-height: 1.4; } address strong { color: #185e20; } address span { color: #555; font-size: 14px; }
.delivery-value { display: grid; gap: 4px; padding: 16px; border-radius: 14px; background: #fff8ef; }.delivery-value strong { font-size: 16px; }.delivery-value span { color: #616161; font-size: 13px; }
.order-summary { position: sticky; top: 20px; }
.summary-card .v-card-text { padding: 24px; }
.summary-heading { display: flex; align-items: center; gap: 12px; }.summary-heading > div { display: grid; gap: 2px; }.summary-heading span { color: #616161; font-size: 12px; }.summary-heading strong { font-size: 16px; }
.payment-note { display: inline-flex; align-items: center; gap: 6px; margin: 16px 0 22px 56px; padding: 5px 9px; border-radius: 999px; color: #185e20; background: #e8f5e9; font-size: 11px; font-weight: 800; }
.totals { display: grid; gap: 14px; padding: 20px 0; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; }
.totals > div { display: flex; justify-content: space-between; gap: 16px; }.totals span { color: #616161; }.totals strong { font-size: 14px; }.totals .discount { color: #2e7d32; }
.totals .grand-total { align-items: flex-end; margin-top: 2px; padding-top: 16px; border-top: 1px dashed #d2d2d2; }.totals .grand-total span { color: #1f1f1f; font-size: 17px; font-weight: 800; }.totals .grand-total strong { color: #185e20; font-size: 27px; }
.guest-order-note { display: flex; gap: 10px; margin: 20px 0; padding: 13px; border-radius: 12px; color: #4e4e4e; background: #f3f3f3; }.guest-order-note span { display: grid; font-size: 12px; line-height: 1.4; }.guest-order-note strong { color: #1f1f1f; font-size: 13px; }
.summary-card .v-btn { margin-top: 20px; }
.missing-order { display: grid; min-height: 520px; place-items: center; align-content: center; padding: 40px; border: 1px dashed #c7c7c7; border-radius: 16px; background: #fff; text-align: center; }.missing-icon { display: grid; width: 82px; height: 82px; place-items: center; border-radius: 24px; color: #185e20; background: #e9f4e9; }.missing-order h1 { margin: 24px 0 8px; }.missing-order p { max-width: 500px; margin-bottom: 24px; color: #616161; }
@media (max-width: 930px) { .detail-grid { grid-template-columns: 1fr; } .order-summary { position: static; } .progress-step span:last-child { display: none; } }
@media (max-width: 680px) { .detail-title-row { align-items: flex-start; flex-direction: column; } .progress-card { padding: 16px; } .progress-step { justify-content: center; }.progress-step::after { right: 4px; left: calc(50% + 25px); }.info-grid { grid-template-columns: 1fr; } .meal-list li { grid-template-columns: auto minmax(0, 1fr); }.meal-price { grid-column: 2; justify-items: start; grid-auto-flow: column; align-items: center; } }
</style>
