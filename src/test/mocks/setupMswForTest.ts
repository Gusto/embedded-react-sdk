import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './server'
import { handlers } from './handlers'

let serverStarted = false
let testsUsingMsw = 0

/**
 * Sets up MSW server for individual test files that need API mocking.
 * Call this function at the top level of test files that use setupApiTestMocks() or server.use().
 *
 * This replaces the global MSW setup for better performance - only tests that actually
 * need API mocking will pay the MSW startup cost.
 */
export const setupMswForTest = () => {
  beforeAll(() => {
    if (!serverStarted) {
      server.listen()
      serverStarted = true
    }
    testsUsingMsw++
  })

  afterEach(() => {
    // Remove only runtime handlers added in individual tests, but preserve base handlers
    server.resetHandlers(...handlers)
  })

  afterAll(() => {
    testsUsingMsw--
    // Only close server when no more tests are using it
    if (testsUsingMsw === 0 && serverStarted) {
      server.close()
      serverStarted = false
    }
  })
}
