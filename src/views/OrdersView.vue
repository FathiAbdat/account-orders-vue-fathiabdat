<script setup lang="ts">
import { computed, ref } from 'vue'
import YumIcon from '../components/YumIcon.vue'
import YumyEmpty from '../components/YumyEmpty.vue'
import { formatDate, formatMoney, formatOrderStatus, statusIcon } from '../formatting'
import { requestNavigation } from '../runtime'
import { orderStore } from '../stores/orderStore'
import type { OrderStatus } from '../types'

const selectedStatus = ref<'all' | OrderStatus>('all')
const isLoading = orderStore.isLoading
const error = orderStore.error
const storageWarning = orderStore.storageWarning
const statusCounts = orderStore.statusCounts
const sortedOrders = orderStore.sortedOrders

const activeCount = computed(
  () => statusCounts.value.confirmed + statusCounts.value.preparing + statusCounts.value['out-for-delivery'],
)
const visibleOrders = computed(() =>
  selectedStatus.value === 'all'
    ? sortedOrders.value
    : sortedOrders.value.filter((order) => order.status === selectedStatus.value),
)

const filters: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'All orders' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out-for-delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]
</script>

<template>
  <section class="page-shell" aria-labelledby="orders-title">
    <header class="page-header">
      <div class="page-heading">
        <span class="eyebrow"><YumIcon name="receipt_long" /> Your food story</span>
        <h1 id="orders-title">Order history</h1>
        <p>Track active meals, revisit favorites, and view complete delivery and payment details.</p>
      </div>
      <v-btn color="secondary" size="large" elevation="0" @click="requestNavigation('/restaurants')">
        <YumIcon name="restaurant" :size="20" /> Explore meals
      </v-btn>
    </header>

    <v-alert v-if="storageWarning" type="warning" variant="tonal" role="status">
      {{ storageWarning }}
    </v-alert>
    <v-alert v-if="error" type="error" variant="tonal" role="alert">
      <template #title>Order history needs attention</template>
      {{ error }}
      <template #append>
        <v-btn color="error" variant="text" @click="orderStore.readFromStorage(false)">Try again</v-btn>
      </template>
    </v-alert>

    <template v-if="isLoading">
      <div class="stats-grid" aria-label="Loading order summary">
        <v-skeleton-loader v-for="index in 3" :key="index" type="list-item-avatar" class="surface-card" />
      </div>
      <div class="orders-grid" aria-label="Loading orders">
        <v-skeleton-loader v-for="index in 3" :key="index" type="article, actions" class="surface-card" />
      </div>
    </template>

    <template v-else>
      <div v-if="sortedOrders.length" class="stats-grid" aria-label="Order summary">
        <div class="stat-card">
          <span class="stat-icon"><YumIcon name="receipt" /></span>
          <span><strong class="stat-value">{{ sortedOrders.length }}</strong><span class="stat-label">Total orders</span></span>
        </div>
        <div class="stat-card">
          <span class="stat-icon"><YumIcon name="delivery_dining" /></span>
          <span><strong class="stat-value">{{ activeCount }}</strong><span class="stat-label">Active now</span></span>
        </div>
        <div class="stat-card">
          <span class="stat-icon"><YumIcon name="task_alt" /></span>
          <span><strong class="stat-value">{{ statusCounts.delivered }}</strong><span class="stat-label">Delivered</span></span>
        </div>
      </div>

      <YumyEmpty
        v-if="!sortedOrders.length"
        title="No orders found"
        message="You have no orders yet. Explore restaurants and your next completed order will appear here."
        action-label="Explore Meals"
        @action="requestNavigation('/restaurants')"
      />

      <template v-else>
        <div class="filter-row">
          <div>
            <h2>Recent orders</h2>
            <p class="caption">Newest orders appear first, including orders placed as a guest.</p>
          </div>
          <div class="filter-scroll" role="group" aria-label="Filter orders by status">
            <button
              v-for="filter in filters"
              :key="filter.value"
              type="button"
              class="filter-button"
              :class="[{ active: selectedStatus === filter.value }, `filter-${filter.value}`]"
              :aria-pressed="selectedStatus === filter.value"
              @click="selectedStatus = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div v-if="visibleOrders.length" class="orders-grid">
          <article v-for="order in visibleOrders" :key="order.orderId" class="order-card surface-card">
            <div class="order-card-accent" :class="`accent-${order.status}`"></div>
            <div class="order-card-top">
              <div class="restaurant-mark" aria-hidden="true">{{ order.restaurantName.charAt(0) }}</div>
              <div class="order-restaurant">
                <h3>{{ order.restaurantName }}</h3>
                <span>{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }} items</span>
              </div>
              <v-chip size="small" class="status-chip" :class="`status-${order.status}`">
                <YumIcon :name="statusIcon(order.status)" :size="16" />
                <span>{{ formatOrderStatus(order.status) }}</span>
              </v-chip>
            </div>
            <dl class="order-meta">
              <div><dt>Order ID</dt><dd>{{ order.orderId }}</dd></div>
              <div><dt>Date</dt><dd>{{ formatDate(order.createdAt) }}</dd></div>
              <div><dt>Total</dt><dd class="order-total">{{ formatMoney(order.total) }}</dd></div>
            </dl>
            <div v-if="order.userId === null" class="guest-note">
              <YumIcon name="person_off" :size="18" /> Guest Order
            </div>
            <v-btn class="details-button" color="primary" variant="tonal" block @click="requestNavigation(`/orders/${order.orderId}`)">
              <span>View order details</span>
              <YumIcon name="arrow_forward" :size="20" />
            </v-btn>
          </article>
        </div>

        <div v-else class="no-filter-results" role="status">
          <YumIcon name="filter_alt_off" :size="34" />
          <h3>No {{ selectedStatus }} orders</h3>
          <p>Choose another status to see more of your order history.</p>
          <v-btn variant="outlined" color="primary" @click="selectedStatus = 'all'">Clear filter</v-btn>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.filter-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-top: 4px; }
.filter-row h2 { margin-bottom: 4px; }
.filter-scroll { display: flex; max-width: 66%; gap: 8px; overflow-x: auto; padding: 5px; scrollbar-width: thin; }
.filter-button { min-height: 40px; padding: 0 14px; border: 1px solid #d5d5d5; border-radius: 999px; color: #555; background: #fff; cursor: pointer; font-size: 13px; font-weight: 800; white-space: nowrap; transition: all .2s ease; }
.filter-button:hover { transform: translateY(-1px); border-color: currentColor; box-shadow: 0 5px 12px rgba(0,0,0,.07); }
.filter-button.active { border-color: currentColor; box-shadow: 0 0 0 2px currentColor inset, 0 5px 12px rgba(0,0,0,.07); }
.filter-confirmed { border-color: #c8e6c9; color: #2e7d32; background: #e8f5e9; }
.filter-preparing { border-color: #ffe0b2; color: #8a4b00; background: #fff3e0; }
.filter-out-for-delivery { border-color: #bbdefb; color: #1976d2; background: #e3f2fd; }
.filter-delivered { border-color: #c8e6c9; color: #2e7d32; background: #e8f5e9; }
.filter-cancelled { border-color: #ffcdd2; color: #d32f2f; background: #ffebee; }
.orders-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
.order-card { position: relative; display: flex; min-width: 0; overflow: hidden; flex-direction: column; gap: 20px; padding: 24px; transition: all .2s ease; }
.order-card:hover { transform: translateY(-5px) scale(1.01); border-color: rgba(46,125,50,.22) !important; box-shadow: 0 14px 34px rgba(0,0,0,.10) !important; }
.order-card-accent { position: absolute; inset: 0 auto 0 0; width: 5px; background: #2e7d32; }
.accent-preparing { background: #ed6c02; }.accent-out-for-delivery { background: #0277bd; }.accent-delivered { background: #2e7d32; }.accent-cancelled { background: #d32f2f; }
.order-card-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; }
.restaurant-mark { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 14px; color: #fff; background: linear-gradient(145deg, #f57c00, #e65100); font-size: 20px; font-weight: 900; }
.order-restaurant { min-width: 0; }
.order-restaurant h3 { overflow: hidden; margin: 0 0 2px; text-overflow: ellipsis; font-weight: 800; white-space: nowrap; }
.order-restaurant span { color: #666; font-size: 13px; }
.order-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 0; padding: 16px 0; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; }
.order-meta div:last-child { grid-column: 1 / -1; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 12px; border-top: 1px dashed #dedede; }
.order-meta dt { margin-bottom: 4px; color: #666; font-size: 12px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; }
.order-meta dd { margin: 0; font-size: 14px; font-weight: 800; }
.order-meta div:first-child dd { letter-spacing: .02em; }
.order-meta .order-total { color: #185e20; font-size: 24px; font-weight: 900; }
.guest-note { display: flex; align-items: center; gap: 7px; margin-top: -6px; color: #666; font-size: 12px; }
.details-button :deep(.v-btn__content) { display: flex; align-items: center; justify-content: center; gap: 8px; }
.details-button .yum-icon { margin-left: 1px; }
.no-filter-results { display: grid; min-height: 280px; place-items: center; align-content: center; padding: 30px; border: 1px dashed #cfcfcf; border-radius: 16px; color: #616161; background: #fff; text-align: center; }
.no-filter-results h3 { margin: 12px 0 4px; color: #1f1f1f; }.no-filter-results p { margin-bottom: 18px; }
@media (max-width: 1040px) { .orders-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .filter-row { align-items: stretch; flex-direction: column; } .filter-scroll { max-width: 100%; } }
@media (max-width: 660px) { .orders-grid { grid-template-columns: 1fr; } .order-card { padding: 20px; } .order-card-top { grid-template-columns: auto minmax(0, 1fr); } .order-card-top .v-chip { grid-column: 1 / -1; justify-self: start; } }
</style>
