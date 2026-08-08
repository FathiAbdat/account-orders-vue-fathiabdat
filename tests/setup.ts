import { beforeEach, afterEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.replaceChildren()
})
