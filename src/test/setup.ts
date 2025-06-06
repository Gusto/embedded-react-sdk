import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { server } from './mocks/server'
import {
  runAxe as _runAxe,
  expectNoAxeViolations as _expectNoAxeViolations,
  runAxeAndLog as _runAxeAndLog,
  runAxeOnRender as _runAxeOnRender,
  expectNoAxeViolationsOnRender as _expectNoAxeViolationsOnRender,
  runAxeAndLogOnRender as _runAxeAndLogOnRender,
} from './accessibility'
import './globals.d.ts'

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

expect.extend(toHaveNoViolations)

// Make accessibility testing utilities globally available
globalThis.runAxe = _runAxe
globalThis.expectNoAxeViolations = _expectNoAxeViolations
globalThis.runAxeAndLog = _runAxeAndLog
globalThis.runAxeOnRender = _runAxeOnRender
globalThis.expectNoAxeViolationsOnRender = _expectNoAxeViolationsOnRender
globalThis.runAxeAndLogOnRender = _runAxeAndLogOnRender
