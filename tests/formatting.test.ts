import { describe, expect, it } from 'vitest'
import { formatOrderStatus } from '../src/formatting'

describe('order status formatting', () => {
  it('converts contract status values into readable badge labels', () => {
    expect(formatOrderStatus('out-for-delivery')).toBe('Out for delivery')
    expect(formatOrderStatus('confirmed')).toBe('Confirmed')
  })
})
