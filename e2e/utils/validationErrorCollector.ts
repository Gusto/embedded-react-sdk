import type { ConsoleMessage, Page } from '@playwright/test'

/**
 * Substrings that identify a `@gusto/embedded-api` response-shape validation
 * failure when they appear in browser console output or an uncaught page
 * error.
 *
 * - `SDKValidationError`: the wrapper class the embedded API throws whenever a
 *   server response fails its Zod schema. This is the path that fires when the
 *   backend ships a shape that disagrees with the published schema.
 * - `ZodError`: the underlying Zod class. The embedded API explicitly wraps
 *   these so they shouldn't escape in normal operation, but we keep this as a
 *   belt-and-suspenders check in case our own code (or a future SDK version)
 *   lets a raw ZodError through.
 *
 * Note: matching `SDKValidationError.message` content alone wouldn't work —
 * its message is just `${rawMessage}: ${cause}` where the cause's `toString()`
 * is JSON of the issues array. The class name is what surfaces reliably in
 * `err.name`, `err.stack`, and React's error-boundary `console.error` output.
 */
export const VALIDATION_ERROR_PATTERNS = ['SDKValidationError', 'ZodError'] as const

export type ValidationErrorPattern = (typeof VALIDATION_ERROR_PATTERNS)[number]

export interface ValidationError {
  source: 'console' | 'pageerror'
  pattern: ValidationErrorPattern
  text: string
}

export interface ValidationErrorCollector {
  getErrors: () => readonly ValidationError[]
  format: () => string
}

/** Narrow Playwright surface the collector needs. Eases unit testing. */
export type WatchablePage = Pick<Page, 'on'>

/**
 * Watch a Playwright page for `@gusto/embedded-api` response-shape validation
 * failures surfaced in the browser console or as uncaught page errors. Returns
 * a collector exposing the accumulated errors and a formatted dump suitable
 * for attaching to a Playwright HTML report.
 *
 * Listeners are attached for the lifetime of the page; Playwright disposes
 * pages between tests, so there's no explicit teardown.
 */
export function createValidationErrorCollector(page: WatchablePage): ValidationErrorCollector {
  const errors: ValidationError[] = []

  const record = (source: ValidationError['source'], text: string) => {
    const pattern = VALIDATION_ERROR_PATTERNS.find(p => text.includes(p))
    if (pattern) {
      errors.push({ source, pattern, text })
    }
  }

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return
    record('console', msg.text())
  })

  page.on('pageerror', (err: Error) => {
    record('pageerror', err.stack ?? `${err.name}: ${err.message}`)
  })

  return {
    getErrors: () => errors,
    format: () =>
      errors
        .map(({ source, pattern, text }) => `[${source}] (${pattern}) ${text}`)
        .join('\n\n---\n\n'),
  }
}
