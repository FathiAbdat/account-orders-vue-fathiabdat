
# Yum Ta Dum — Account & Orders

A standalone Vue 3 + Vuetify 3 microfrontend owned by **Fathi Abdat**. The package self-registers the custom element `<yum-account-orders>` and implements account access, profile presentation, order history, and complete order details using persistent client-side storage.
## Demo video

[▶️ Watch the project demo on Google Drive](https://drive.google.com/file/d/1Yrdof2J5fM9Y2siDRRZ-5b0qdrjqSZ3y/view?usp=sharing)

## Included routes

| Route | Screen |
| --- | --- |
| `/login` | Validated account login |
| `/register` | Validated account registration |
| `/profile` | Contact details and saved-address presentation |
| `/orders` | Filterable order history, including guest orders |
| `/orders/:orderId` | Meals, address, delivery choice, payment method, and totals |

The Web Component uses an internal memory router so it does not take ownership of the host Shell's router. Set its `route` attribute when the Shell changes routes.

## Run locally

```bash
npm install
npm run dev
```

The standalone application provides a lightweight Shell, route controls, initial data, and visual feedback for emitted navigation and authentication events.

The approved Yumy mascot artwork from the project SRS is bundled at `public/brand/yumy.png` and reused by the standalone wordmark, embedded header, login artwork, and order empty state.

## Build and test

```bash
npm test
npm run build
```

The production build creates:

- `dist/` — standalone application
- `dist/component/yum-account-orders.js` — embeddable ES module

## Shell integration

Load the component bundle once, then render the custom element:

```html
<script type="module" src="https://your-host.example/component/yum-account-orders.js"></script>
<yum-account-orders route="/orders"></yum-account-orders>
```

Add the boolean `standalone` attribute when the host Shell provides the primary navigation. It suppresses the component's contextual account navigation so the Shell remains the single top navigation bar.

Update the `route` attribute from the Shell, or call the element API:

```js
const account = document.querySelector('yum-account-orders')
account.navigate('/orders/YTD-84291')
```

### Produced events

Both events use `{ bubbles: true, composed: true }`.

```js
document.addEventListener('navigation:requested', (event) => {
  shellRouter.push(event.detail.route)
})

document.addEventListener('auth:changed', (event) => {
  // { authenticated, user: { id, name, email } | null }
  updateShellAccountState(event.detail)
})
```

### Consumed event

The component listens for `order:completed` on both itself and `window`. Received orders are contract-validated, de-duplicated by `orderId`, persisted, and reflected in the history immediately.

```js
window.dispatchEvent(new CustomEvent('order:completed', {
  detail: { order: completedOrder },
  bubbles: true,
  composed: true,
}))
```

### LocalStorage

- `yum-ta-dum-orders` — `CompletedOrder[]`
- `yum-ta-dum-user` — authentication and profile state

When a key is missing, the standalone experience seeds a small contract-valid data set. Store `[]` in `yum-ta-dum-orders` to display the Yumy empty state.

## Accessibility and responsive behavior

The module includes visible labels and error guidance, keyboard-accessible controls, orange focus rings, 44px minimum control heights, reduced-motion support, semantic status text, and layouts for mobile, tablet, and desktop. All visual dependencies (Roboto and Material Symbols Outlined) are bundled with the component.

