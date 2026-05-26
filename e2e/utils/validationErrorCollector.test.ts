import { describe, it, expect } from 'vitest'
import { SDKValidationError } from '@gusto/embedded-api-v-2025-11-15/models/errors/sdkvalidationerror'
import { z } from 'zod/v3'
import {
  createValidationErrorCollector,
  VALIDATION_ERROR_PATTERNS,
  type WatchablePage,
} from './validationErrorCollector'

type Handler = (...args: unknown[]) => void

function createFakePage() {
  const handlers = new Map<string, Handler[]>()
  const page: WatchablePage = {
    on: ((event: string, handler: Handler) => {
      const list = handlers.get(event) ?? []
      list.push(handler)
      handlers.set(event, list)
      return page as never
    }) as WatchablePage['on'],
  }
  const emit = (event: string, ...args: unknown[]) => {
    for (const handler of handlers.get(event) ?? []) handler(...args)
  }
  const emitConsole = (type: string, text: string) =>
    emit('console', { type: () => type, text: () => text })
  const emitPageError = (err: Error) => emit('pageerror', err)
  return { page, emitConsole, emitPageError }
}

/**
 * Produce a real SDKValidationError exactly the way `@gusto/embedded-api`
 * produces them: a Zod schema that rejects, wrapped by the SDK's internal
 * `parse` helper. If the SDK ever changes how it wraps Zod failures, this
 * test breaks — which is the signal we want.
 */
function makeRealSdkValidationError(): SDKValidationError {
  const schema = z.object({ uuid: z.string() })
  try {
    schema.parse({ uuid: 123 })
    throw new Error('schema should have rejected')
  } catch (cause) {
    return new SDKValidationError('Response validation failed', cause, { uuid: 123 })
  }
}

describe('VALIDATION_ERROR_PATTERNS', () => {
  it('matches the class name of a real SDKValidationError', () => {
    const err = makeRealSdkValidationError()
    expect(err.name).toBe('SDKValidationError')
    expect(VALIDATION_ERROR_PATTERNS).toContain('SDKValidationError')
  })

  it('matches the class name of a real ZodError', () => {
    let zodErr: unknown
    try {
      z.string().parse(123)
    } catch (e) {
      zodErr = e
    }
    expect(zodErr).toBeInstanceOf(z.ZodError)
    expect((zodErr as z.ZodError).name).toBe('ZodError')
    expect(VALIDATION_ERROR_PATTERNS).toContain('ZodError')
  })
})

describe('createValidationErrorCollector', () => {
  it('captures a real SDKValidationError surfaced as a pageerror', () => {
    const { page, emitPageError } = createFakePage()
    const collector = createValidationErrorCollector(page)

    emitPageError(makeRealSdkValidationError())

    expect(collector.getErrors()).toMatchObject([
      { source: 'pageerror', pattern: 'SDKValidationError' },
    ])
  })

  it("captures an SDKValidationError surfaced via React's error boundary as console.error", () => {
    const { page, emitConsole } = createFakePage()
    const collector = createValidationErrorCollector(page)

    const err = makeRealSdkValidationError()
    emitConsole('error', err.stack ?? '')

    expect(collector.getErrors()).toMatchObject([
      { source: 'console', pattern: 'SDKValidationError' },
    ])
  })

  it('captures a raw ZodError if one escapes the SDK wrapper', () => {
    const { page, emitPageError } = createFakePage()
    const collector = createValidationErrorCollector(page)

    try {
      z.object({ uuid: z.string() }).parse({ uuid: 123 })
    } catch (e) {
      emitPageError(e as Error)
    }

    expect(collector.getErrors()).toMatchObject([{ source: 'pageerror', pattern: 'ZodError' }])
  })

  it('ignores console messages that are not errors or warnings', () => {
    const { page, emitConsole } = createFakePage()
    const collector = createValidationErrorCollector(page)

    emitConsole('log', 'SDKValidationError: noise from a debug log')
    emitConsole('info', 'ZodError: also noise')

    expect(collector.getErrors()).toEqual([])
  })

  it('ignores console errors that do not contain a validation-error marker', () => {
    const { page, emitConsole } = createFakePage()
    const collector = createValidationErrorCollector(page)

    emitConsole('error', 'TypeError: cannot read properties of undefined')
    emitConsole('error', '404 Not Found')

    expect(collector.getErrors()).toEqual([])
  })

  it('collects multiple errors across both sources in order', () => {
    const { page, emitConsole, emitPageError } = createFakePage()
    const collector = createValidationErrorCollector(page)

    emitPageError(makeRealSdkValidationError())
    emitConsole('error', 'irrelevant')
    emitConsole('warning', 'ZodError: from a console.warn somewhere')

    expect(collector.getErrors()).toMatchObject([
      { source: 'pageerror', pattern: 'SDKValidationError' },
      { source: 'console', pattern: 'ZodError' },
    ])
  })

  it('format() produces a human-readable multi-error dump', () => {
    const { page, emitConsole, emitPageError } = createFakePage()
    const collector = createValidationErrorCollector(page)

    emitPageError(Object.assign(new Error('boom'), { name: 'SDKValidationError' }))
    emitConsole('error', 'ZodError: second one')

    const formatted = collector.format()
    expect(formatted).toContain('[pageerror] (SDKValidationError)')
    expect(formatted).toContain('[console] (ZodError)')
    expect(formatted).toContain('---')
  })
})
