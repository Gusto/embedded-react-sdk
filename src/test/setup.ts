import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { server } from './mocks/server'

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  // Remove any handlers you may have added
  // in individual tests (runtime handlers).
  server.resetHandlers()
})

afterAll(() => {
  // Disable request interception and clean up.
  server.close()
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()
