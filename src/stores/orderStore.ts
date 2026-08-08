import { computed, ref } from 'vue'
import { fallbackOrders } from '../fixtures'
import { isCompletedOrder, type CompletedOrder, type OrderStatus } from '../types'

export const ORDERS_STORAGE_KEY = 'yum-ta-dum-orders'

function normalizeStoredOrder(value: unknown) {
  if (!value || typeof value !== 'object') return value
  const order = value as Record<string, unknown>
  const paymentMethod = order.paymentMethod
  if (typeof paymentMethod !== 'string' || paymentMethod === 'cash') return value
  if (paymentMethod.endsWith('-card')) return { ...order, paymentMethod: 'saved-card' }
  if (paymentMethod.endsWith('-wallet')) return { ...order, paymentMethod: 'digital-wallet' }
  return value
}

export function createOrderStore() {
  const orders = ref<CompletedOrder[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const storageWarning = ref<string | null>(null)
  let initialized = false

  const sortedOrders = computed(() =>
    [...orders.value].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    ),
  )

  const statusCounts = computed(() =>
    orders.value.reduce<Record<OrderStatus, number>>(
      (counts, order) => {
        counts[order.status] += 1
        return counts
      },
      {
        confirmed: 0,
        preparing: 0,
        'out-for-delivery': 0,
        delivered: 0,
        cancelled: 0,
      },
    ),
  )

  function readFromStorage(seedWhenMissing = true) {
    error.value = null
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
      if (raw === null) {
        orders.value = seedWhenMissing ? structuredClone(fallbackOrders) : []
        if (seedWhenMissing) persist()
        return
      }
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) throw new Error('Stored order history is not a list.')
      const normalized = parsed.map(normalizeStoredOrder)
      const invalidIndex = normalized.findIndex((order) => !isCompletedOrder(order))
      if (invalidIndex >= 0) throw new Error(`Stored order ${invalidIndex + 1} does not match the shared contract.`)
      orders.value = normalized as CompletedOrder[]
      if (JSON.stringify(normalized) !== raw) persist()
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : 'Unable to read order history.'
      orders.value = []
    }
  }

  function initialize(options: { seedWhenMissing?: boolean; delay?: number } = {}) {
    if (initialized) return
    initialized = true
    isLoading.value = true
    readFromStorage(options.seedWhenMissing ?? true)
    window.setTimeout(() => {
      isLoading.value = false
    }, options.delay ?? 360)
  }

  function persist() {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders.value))
      storageWarning.value = null
      return true
    } catch {
      storageWarning.value = 'Orders are available for this visit, but your order history could not be updated.'
      return false
    }
  }

  function addOrder(order: unknown) {
    if (!isCompletedOrder(order)) {
      error.value = 'A completed order was received, but it did not match the shared order contract.'
      return false
    }
    const existingIndex = orders.value.findIndex((item) => item.orderId === order.orderId)
    if (existingIndex >= 0) orders.value.splice(existingIndex, 1, structuredClone(order))
    else orders.value.unshift(structuredClone(order))
    error.value = null
    persist()
    return true
  }

  function findOrder(orderId: string) {
    return orders.value.find((order) => order.orderId === orderId)
  }

  function handleStorageEvent(event: StorageEvent) {
    if (event.key === ORDERS_STORAGE_KEY) readFromStorage(false)
  }

  function resetForTests() {
    initialized = false
    orders.value = []
    isLoading.value = true
    error.value = null
    storageWarning.value = null
  }

  return {
    orders,
    sortedOrders,
    statusCounts,
    isLoading,
    error,
    storageWarning,
    initialize,
    readFromStorage,
    addOrder,
    findOrder,
    handleStorageEvent,
    resetForTests,
  }
}

export const orderStore = createOrderStore()
