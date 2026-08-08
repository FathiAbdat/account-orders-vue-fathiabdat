import { describe, expect, it } from 'vitest'
import { configureRuntime, dispatchAuthChanged, requestNavigation } from '../src/runtime'

describe('custom event contract', () => {
  it('dispatches navigation:requested with bubbles and composed enabled', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    configureRuntime(host, null)

    let received: CustomEvent<{ route: string }> | undefined
    document.addEventListener(
      'navigation:requested',
      (event) => {
        received = event as CustomEvent<{ route: string }>
      },
      { once: true },
    )

    await requestNavigation('/restaurants')

    expect(received?.detail).toEqual({ route: '/restaurants' })
    expect(received?.bubbles).toBe(true)
    expect(received?.composed).toBe(true)
    configureRuntime(null, null)
  })

  it('dispatches the exact auth:changed payload shape', () => {
    const host = document.createElement('div')
    configureRuntime(host, null)
    let received: CustomEvent | undefined
    host.addEventListener('auth:changed', (event) => {
      received = event as CustomEvent
    })

    dispatchAuthChanged({
      authenticated: true,
      user: { id: 'usr-1', name: 'Fathi Abdat', email: 'fathi@example.com' },
    })

    expect(received?.detail).toEqual({
      authenticated: true,
      user: { id: 'usr-1', name: 'Fathi Abdat', email: 'fathi@example.com' },
    })
    expect(received?.bubbles).toBe(true)
    expect(received?.composed).toBe(true)
    configureRuntime(null, null)
  })
})
