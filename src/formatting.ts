import type { CompletedOrder, OrderStatus } from './types'

export function formatMoney(value: number) {
  return `₪${value.toFixed(2)}`
}

export function formatDate(value: string, includeTime = false) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}

export function statusIcon(status: OrderStatus) {
  return {
    confirmed: 'check_circle',
    preparing: 'skillet',
    'out-for-delivery': 'delivery_dining',
    delivered: 'task_alt',
    cancelled: 'cancel',
  }[status]
}

export function formatOrderStatus(status: OrderStatus) {
  return {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    'out-for-delivery': 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }[status]
}

export function paymentLabel(method: CompletedOrder['paymentMethod']) {
  return {
    cash: 'Cash on delivery',
    'saved-card': 'Saved card',
    'digital-wallet': 'Digital wallet',
  }[method]
}
