import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ProfileView from './views/ProfileView.vue'
import OrdersView from './views/OrdersView.vue'
import OrderDetailsView from './views/OrderDetailsView.vue'

export function createAccountRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', name: 'register', component: RegisterView },
      { path: '/profile', name: 'profile', component: ProfileView },
      { path: '/orders', name: 'orders', component: OrdersView },
      { path: '/orders/:orderId', name: 'order-details', component: OrderDetailsView },
      { path: '/:pathMatch(.*)*', redirect: '/orders' },
    ],
    scrollBehavior: () => ({ top: 0 }),
  })
}
