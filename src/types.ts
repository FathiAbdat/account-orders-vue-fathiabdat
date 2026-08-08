export interface MealItem {
  id: string
  restaurantId: string
  restaurantName: string
  name: string
  description: string
  price: number
  image: string
  category: string
  quantity: number
}

export interface ShippingAddress {
  label: 'Home' | 'Work' | 'Other'
  fullName: string
  phone: string
  city: string
  area?: string
  streetAddress: string
  building?: string
  postalCode?: string
}

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'

export interface CompletedOrder {
  orderId: string
  userId: string | null
  restaurantId: string
  restaurantName: string
  items: MealItem[]
  shippingAddress: ShippingAddress
  deliveryMethod: 'asap' | 'scheduled'
  scheduledFor: string | null
  estimatedDeliveryMinutes: number | null
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  currency: 'ILS'
  paymentMethod: 'cash' | 'saved-card' | 'digital-wallet'
  status: OrderStatus
  createdAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  savedAddress: ShippingAddress
}

export interface StoredUserState {
  authenticated: boolean
  user: UserProfile
}

export interface AuthChangedDetail {
  authenticated: boolean
  user: Pick<UserProfile, 'id' | 'name' | 'email'> | null
}

export const ORDER_STATUSES: OrderStatus[] = [
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
]

export function isCompletedOrder(value: unknown): value is CompletedOrder {
  if (!value || typeof value !== 'object') return false
  const order = value as Partial<CompletedOrder>
  return (
    typeof order.orderId === 'string' &&
    (typeof order.userId === 'string' || order.userId === null) &&
    typeof order.restaurantId === 'string' &&
    typeof order.restaurantName === 'string' &&
    Array.isArray(order.items) &&
    !!order.shippingAddress &&
    (order.deliveryMethod === 'asap' || order.deliveryMethod === 'scheduled') &&
    typeof order.subtotal === 'number' &&
    typeof order.discount === 'number' &&
    typeof order.deliveryFee === 'number' &&
    typeof order.total === 'number' &&
    order.currency === 'ILS' &&
    ['cash', 'saved-card', 'digital-wallet'].includes(order.paymentMethod ?? '') &&
    ORDER_STATUSES.includes(order.status as OrderStatus) &&
    typeof order.createdAt === 'string'
  )
}
