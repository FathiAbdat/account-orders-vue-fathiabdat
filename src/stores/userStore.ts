import { computed, ref } from 'vue'
import { fallbackUser } from '../fixtures'
import { dispatchAuthChanged } from '../runtime'
import type { ShippingAddress, StoredUserState, UserProfile } from '../types'

export const USER_STORAGE_KEY = 'yum-ta-dum-user'

function defaultAddress(name: string, phone: string): ShippingAddress {
  return {
    label: 'Home',
    fullName: name,
    phone,
    city: 'Ramallah',
    streetAddress: 'Add your saved street address',
  }
}

export function createUserStore() {
  const state = ref<StoredUserState>(structuredClone(fallbackUser))
  const storageWarning = ref<string | null>(null)
  const initialized = ref(false)
  const authenticated = computed(() => state.value.authenticated)
  const user = computed(() => state.value.user)

  function initialize() {
    if (initialized.value) return
    initialized.value = true
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredUserState
        if (!parsed.user?.id || !parsed.user?.email) throw new Error('Invalid stored user profile')
        if (parsed.user.email === fallbackUser.user.email && parsed.user.id !== fallbackUser.user.id) {
          parsed.user.id = fallbackUser.user.id
        }
        state.value = parsed
        persist()
      } else {
        persist()
      }
    } catch {
      storageWarning.value = 'Your saved profile could not be read. Default profile details are shown instead.'
      state.value = structuredClone(fallbackUser)
    }
  }

  function persist() {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.value))
      storageWarning.value = null
    } catch {
      storageWarning.value = 'Profile changes are active for this visit but could not be saved.'
    }
  }

  function emitAuth() {
    dispatchAuthChanged({
      authenticated: state.value.authenticated,
      user: state.value.authenticated
        ? {
            id: state.value.user.id,
            name: state.value.user.name,
            email: state.value.user.email,
          }
        : null,
    })
  }

  function login(email: string) {
    const knownUser = state.value.user
    const derivedName = email
      .split('@')[0]
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    state.value = {
      authenticated: true,
      user: {
        ...knownUser,
        name: knownUser.email === email ? knownUser.name : derivedName,
        email,
      },
    }
    persist()
    emitAuth()
  }

  function register(input: { name: string; email: string; phone: string }) {
    const user: UserProfile = {
      id: `usr-${crypto.randomUUID?.() ?? Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      savedAddress: defaultAddress(input.name.trim(), input.phone.trim()),
    }
    state.value = { authenticated: true, user }
    persist()
    emitAuth()
  }

  function logout() {
    state.value.authenticated = false
    persist()
    emitAuth()
  }

  return {
    state,
    user,
    authenticated,
    storageWarning,
    initialize,
    login,
    register,
    logout,
  }
}

export const userStore = createUserStore()
