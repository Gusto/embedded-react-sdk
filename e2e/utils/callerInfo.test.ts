import { describe, it, expect } from 'vitest'
import { getCallerLabel } from './callerInfo'

// getCallerLabel is designed to be called from inside a helper like
// waitForLoadingComplete, one frame below the function whose caller we
// actually want to identify -- these stand-ins simulate that shape rather
// than calling getCallerLabel directly from the "caller" under test.

// Correct usage: capture synchronously, before any await of your own.
function syncCapture(): string {
  return getCallerLabel()
}

// Incorrect usage: capture after your own await. Pinned by a test below --
// see getCallerLabel's doc comment for why this loses caller identity even
// when the caller itself is a named function.
async function asyncCaptureAfterOwnAwait(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 0))
  return getCallerLabel()
}

function namedSyncCaller(): string {
  return syncCapture()
}

async function namedAsyncCallerNoAwaitBefore(): Promise<string> {
  return syncCapture()
}

async function namedAsyncCallerWithPriorAwait(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 0))
  return syncCapture()
}

async function namedAsyncCallerOfBadMiddleman(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 0))
  return asyncCaptureAfterOwnAwait()
}

describe('getCallerLabel', () => {
  it('returns the name and location of a named synchronous caller', () => {
    const label = namedSyncCaller()
    expect(label).toMatch(/^namedSyncCaller \(callerInfo\.test\.ts:\d+\)$/)
  })

  it('resolves the caller when captured synchronously, with no prior await in the caller', async () => {
    const label = await namedAsyncCallerNoAwaitBefore()
    expect(label).toMatch(/^namedAsyncCallerNoAwaitBefore \(callerInfo\.test\.ts:\d+\)$/)
  })

  it('resolves the caller when captured synchronously, even if the caller itself awaited first', async () => {
    const label = await namedAsyncCallerWithPriorAwait()
    expect(label).toMatch(/^namedAsyncCallerWithPriorAwait \(callerInfo\.test\.ts:\d+\)$/)
  })

  it('loses the caller identity if getCallerLabel is captured after its own await, even for a named caller', async () => {
    const label = await namedAsyncCallerOfBadMiddleman()
    expect(label).toMatch(/^<anonymous> \(callerInfo\.test\.ts:\d+\)$/)
  })

  it('falls back to <anonymous> plus file:line for an unnamed caller', async () => {
    const label = await (async () => syncCapture())()
    expect(label).toMatch(/^<anonymous> \(callerInfo\.test\.ts:\d+\)$/)
  })
})
