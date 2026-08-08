import { describe, expect, it, vi } from 'vitest'
import { fallbackOrders } from '../src/fixtures'
import { createOrderStore, ORDERS_STORAGE_KEY } from '../src/stores/orderStore'

describe('order store', () => {
  it('seeds contract-valid standalone fixtures when storage is empty', () => {
    vi.useFakeTimers()
    const store = createOrderStore()
    store.initialize({ delay: 0 })
    vi.runAllTimers()

    expect(store.isLoading.value).toBe(false)
    expect(store.orders.value).toHaveLength(fallbackOrders.length)
    expect(JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? '[]')).toHaveLength(fallbackOrders.length)
  })

  it('persists a completed guest order and de-duplicates by orderId', () => {
    vi.useFakeTimers()
    localStorage.setItem(ORDERS_STORAGE_KEY, '[]')
    const store = createOrderStore()
    store.initialize({ delay: 0 })
    vi.runAllTimers()

    const guestOrder = structuredClone(fallbackOrders[1])
    guestOrder.orderId = 'YTD-TEST-GUEST'
    guestOrder.userId = null
    guestOrder.status = 'confirmed'

    expect(store.addOrder(guestOrder)).toBe(true)
    expect(store.addOrder({ ...guestOrder, status: 'preparing' })).toBe(true)
    expect(store.orders.value).toHaveLength(1)
    expect(store.orders.value[0].status).toBe('preparing')
    expect(JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? '[]')[0].userId).toBeNull()
  })

  it('rejects an order with a non-contract status', () => {
    const store = createOrderStore()
    const invalidOrder = { ...structuredClone(fallbackOrders[0]), status: 'refunded' }

    expect(store.addOrder(invalidOrder)).toBe(false)
    expect(store.error.value).toContain('shared order contract')
  })

  it('reports malformed persisted data without crashing', () => {
    localStorage.setItem(ORDERS_STORAGE_KEY, '{bad-json')
    const store = createOrderStore()

    store.readFromStorage(false)

    expect(store.orders.value).toEqual([])
    expect(store.error.value).toBeTruthy()
  })
})
