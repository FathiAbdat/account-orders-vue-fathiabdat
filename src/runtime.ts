import type { AuthChangedDetail } from './types'
import type { Router } from 'vue-router'

let hostElement: HTMLElement | null = null
let internalRouter: Router | null = null

export function configureRuntime(host: HTMLElement | null, router: Router | null) {
  hostElement = host
  internalRouter = router
}

export function dispatchComponentEvent<T>(name: string, detail: T) {
  hostElement?.dispatchEvent(
    new CustomEvent<T>(name, {
      detail,
      bubbles: true,
      composed: true,
    }),
  )
}

export async function requestNavigation(route: string) {
  if (internalRouter?.currentRoute.value.fullPath !== route) {
    await internalRouter?.push(route)
  }
  dispatchComponentEvent('navigation:requested', { route })
}

export function dispatchAuthChanged(detail: AuthChangedDetail) {
  dispatchComponentEvent<AuthChangedDetail>('auth:changed', detail)
}
