import { createApp, type App as VueApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import appStyles from './styles.css?inline'
import { createAccountRouter } from './router'
import { configureRuntime } from './runtime'
import { orderStore } from './stores/orderStore'
import { userStore } from './stores/userStore'
import type { CompletedOrder } from './types'

const fontDirectory = new URL(/* @vite-ignore */ __YUM_FONT_PATH__, import.meta.url)
const fontStyles = `
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 400;
    src: url('${new URL('roboto-400.woff2', fontDirectory).href}') format('woff2');
  }
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 500;
    src: url('${new URL('roboto-500.woff2', fontDirectory).href}') format('woff2');
  }
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-display: swap;
    font-weight: 700;
    src: url('${new URL('roboto-700.woff2', fontDirectory).href}') format('woff2');
  }
  @font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    font-display: block;
    font-weight: 100 700;
    src: url('${new URL('material-symbols-outlined.woff2', fontDirectory).href}') format('woff2');
  }
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'liga';
  }
`
const ALL_STYLES = [fontStyles, appStyles].join('\n')
const accountRoute = /^\/(?:login|register|profile|orders(?:\/[^/?#]+)?)\/?$/
const MATERIAL_SYMBOLS_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'

function initialRoute(element: HTMLElement) {
  const attributeRoute = element.getAttribute('route')
  if (attributeRoute && accountRoute.test(attributeRoute)) return attributeRoute
  if (accountRoute.test(window.location.pathname)) return window.location.pathname
  return '/orders'
}

export class YumAccountOrdersElement extends HTMLElement {
  static get observedAttributes() {
    return ['route']
  }

  private vueApp: VueApp | null = null
  private router: ReturnType<typeof createAccountRouter> | null = null
  private mountPoint: HTMLDivElement | null = null
  private styleObserver: MutationObserver | null = null

  private readonly onCompletedOrder = (event: Event) => {
    const detail = (event as CustomEvent<{ order?: CompletedOrder }>).detail
    if (detail?.order) orderStore.addOrder(detail.order)
  }

  private readonly onStorage = (event: StorageEvent) => {
    orderStore.handleStorageEvent(event)
  }

  private syncRuntimeStyles(shadow: ShadowRoot) {
    document.querySelectorAll<HTMLStyleElement>('style[data-vite-dev-id]').forEach((source) => {
      const id = source.dataset.viteDevId ?? ''
      if (!id) return
      let clone = Array.from(shadow.querySelectorAll<HTMLStyleElement>('style[data-yum-runtime-style]')).find(
        (candidate) => candidate.dataset.yumRuntimeStyle === id,
      )
      if (!clone) {
        clone = document.createElement('style')
        clone.dataset.yumRuntimeStyle = id
        shadow.prepend(clone)
      }
      if (clone.textContent !== source.textContent) clone.textContent = source.textContent
    })
  }

  connectedCallback() {
    if (this.vueApp) return
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = ALL_STYLES
    const materialSymbolsStyles = document.createElement('link')
    materialSymbolsStyles.rel = 'stylesheet'
    materialSymbolsStyles.href = MATERIAL_SYMBOLS_STYLESHEET
    this.mountPoint = document.createElement('div')
    this.mountPoint.className = 'yum-account-orders-root'
    if (import.meta.env.DEV) {
      shadow.replaceChildren(materialSymbolsStyles, style, this.mountPoint)
      this.syncRuntimeStyles(shadow)
      this.styleObserver = new MutationObserver(() => this.syncRuntimeStyles(shadow))
      this.styleObserver.observe(document.head, { childList: true, subtree: true, characterData: true })
    } else {
      const componentStyles = document.createElement('link')
      componentStyles.rel = 'stylesheet'
      componentStyles.href = new URL(/* @vite-ignore */ './yum-account-orders.css', import.meta.url).href
      shadow.replaceChildren(materialSymbolsStyles, componentStyles, style, this.mountPoint)
    }

    this.router = createAccountRouter()
    configureRuntime(this, this.router)
    userStore.initialize()
    orderStore.initialize()

    const vuetify = createVuetify({
      components,
      directives,
      defaults: {
        VBtn: { rounded: 'lg' },
        VCard: { rounded: 'xl' },
        VTextField: { color: 'primary' },
      },
      theme: {
        defaultTheme: 'yumTheme',
        themes: {
          yumTheme: {
            dark: false,
            colors: {
              primary: '#2E7D32',
              'primary-darken-1': '#185E20',
              secondary: '#F57C00',
              'secondary-darken-1': '#E65100',
              background: '#F7F8F5',
              surface: '#FFFFFF',
              error: '#D32F2F',
              success: '#2E7D32',
              warning: '#ED6C02',
            },
          },
        },
      },
    })

    const app = createApp(App, { standalone: this.hasAttribute('standalone') })
    app.use(this.router)
    app.use(vuetify)
    this.vueApp = app

    this.addEventListener('order:completed', this.onCompletedOrder)
    window.addEventListener('order:completed', this.onCompletedOrder)
    window.addEventListener('storage', this.onStorage)

    void this.router.push(initialRoute(this)).then(() => {
      if (this.vueApp && this.mountPoint) this.vueApp.mount(this.mountPoint)
    })
  }

  disconnectedCallback() {
    this.removeEventListener('order:completed', this.onCompletedOrder)
    window.removeEventListener('order:completed', this.onCompletedOrder)
    window.removeEventListener('storage', this.onStorage)
    this.styleObserver?.disconnect()
    this.styleObserver = null
    this.vueApp?.unmount()
    this.vueApp = null
    this.router = null
    this.mountPoint = null
    configureRuntime(null, null)
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name !== 'route' || oldValue === newValue || !newValue || !accountRoute.test(newValue)) return
    if (this.router && this.router.currentRoute.value.fullPath !== newValue) {
      void this.router.replace(newValue)
    }
  }

  navigate(route: string) {
    if (!accountRoute.test(route)) throw new Error(`Unsupported Account & Orders route: ${route}`)
    this.setAttribute('route', route)
  }
}

if (!customElements.get('yum-account-orders')) {
  customElements.define('yum-account-orders', YumAccountOrdersElement)
}

declare global {
  interface HTMLElementTagNameMap {
    'yum-account-orders': YumAccountOrdersElement
  }
}
