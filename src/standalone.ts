import './yum-account-orders'

const component = document.querySelector('yum-account-orders')
const toast = document.querySelector<HTMLElement>('.app-toast')
let toastTimer = 0

function showToast(message: string) {
  if (!toast) return
  toast.textContent = message
  toast.dataset.visible = 'true'
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.dataset.visible = 'false'
  }, 3200)
}

function setAccountRoute(route: string, updateHistory = true) {
  component?.setAttribute('route', route)
  document.querySelectorAll<HTMLButtonElement>('[data-route]').forEach((button) => {
    button.setAttribute('aria-current', button.dataset.route === route ? 'page' : 'false')
  })
  if (updateHistory && window.location.pathname !== route) window.history.pushState({}, '', route)
}

document.querySelectorAll<HTMLButtonElement>('[data-route]').forEach((button) => {
  button.addEventListener('click', () => setAccountRoute(button.dataset.route ?? '/orders'))
})

document.addEventListener('navigation:requested', (event) => {
  const route = (event as CustomEvent<{ route: string }>).detail?.route
  if (!route) return
  if (/^\/(?:login|register|profile|orders(?:\/[^/]+)?)$/.test(route)) setAccountRoute(route)
  else showToast(`The Yum Ta Dum Shell would navigate to ${route}`)
})

document.addEventListener('auth:changed', (event) => {
  const detail = (event as CustomEvent<{ authenticated: boolean; user: { name: string } | null }>).detail
  showToast(detail.authenticated ? `Welcome, ${detail.user?.name ?? 'food lover'}!` : 'You are now browsing as a guest.')
})

window.addEventListener('popstate', () => {
  const route = /^\/(?:login|register|profile|orders(?:\/[^/]+)?)$/.test(window.location.pathname)
    ? window.location.pathname
    : '/orders'
  setAccountRoute(route, false)
})

const initialPath = /^\/(?:login|register|profile|orders(?:\/[^/]+)?)$/.test(window.location.pathname)
  ? window.location.pathname
  : '/orders'
setAccountRoute(initialPath, false)
