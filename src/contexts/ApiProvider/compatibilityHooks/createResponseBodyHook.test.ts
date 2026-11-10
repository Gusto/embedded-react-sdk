import { describe, test, expect, vi } from 'vitest'
import { createResponseBodyHook, type ResponseBodyRemapper } from './createResponseBodyHook'

const TARGET = 'get-v1-companies-company_id-pay_schedules'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<ReturnType<typeof createResponseBodyHook>['afterSuccess']>[0]

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json',
      'content-length': '999',
      'x-request-id': 'req-1',
    },
  })

describe('createResponseBodyHook', () => {
  test('passes untargeted operations through without reading the body', async () => {
    const remapBody = vi.fn<ResponseBodyRemapper>(() => ({ changed: true }))
    const hook = createResponseBodyHook([TARGET], remapBody)
    const response = jsonResponse({ uuid: 'ps-1' })

    const result = await hook.afterSuccess(context('get-v1-employees'), response)

    expect(result).toBe(response)
    expect(remapBody).not.toHaveBeenCalled()
  })

  test('passes a non-JSON body through without calling the remapper', async () => {
    const remapBody = vi.fn<ResponseBodyRemapper>(() => ({ changed: true }))
    const hook = createResponseBodyHook([TARGET], remapBody)
    const response = new Response('<html>gateway error</html>', { status: 200 })

    const result = await hook.afterSuccess(context(TARGET), response)

    expect(result).toBe(response)
    expect(remapBody).not.toHaveBeenCalled()
  })

  test('returns the original response when the remapper reports no changes', async () => {
    const hook = createResponseBodyHook([TARGET], () => undefined)
    const response = jsonResponse({ uuid: 'ps-1' })

    const result = await hook.afterSuccess(context(TARGET), response)

    expect(result).toBe(response)
  })

  test('leaves the original body readable by the SDK after the hook reads it', async () => {
    const hook = createResponseBodyHook([TARGET], () => undefined)
    const response = jsonResponse({ uuid: 'ps-1' })

    await hook.afterSuccess(context(TARGET), response)

    expect(await response.json()).toEqual({ uuid: 'ps-1' })
  })

  test('serializes the remapped body and drops the stale content-length', async () => {
    const hook = createResponseBodyHook([TARGET], () => ({ uuid: 'ps-1', patched: true }))
    const response = jsonResponse({ uuid: 'ps-1' })

    const result = await hook.afterSuccess(context(TARGET), response)

    expect(result).not.toBe(response)
    expect(await result.json()).toEqual({ uuid: 'ps-1', patched: true })
    expect(result.headers.get('content-length')).toBeNull()
  })

  test('preserves status, statusText, and unrelated headers on a remapped response', async () => {
    const hook = createResponseBodyHook([TARGET], () => ({ patched: true }))
    const response = jsonResponse({ uuid: 'ps-1' })

    const result = await hook.afterSuccess(context(TARGET), response)

    expect(result.status).toBe(200)
    expect(result.statusText).toBe('OK')
    expect(result.headers.get('x-request-id')).toBe('req-1')
    expect(result.headers.get('content-type')).toBe('application/json')
  })

  test('passes the operation that produced the body to the remapper', async () => {
    const second = 'post-v1-companies-company_id-pay_schedules'
    const remapBody = vi.fn<ResponseBodyRemapper>(() => undefined)
    const hook = createResponseBodyHook([TARGET, second], remapBody)

    await hook.afterSuccess(context(second), jsonResponse({ uuid: 'ps-1' }))

    expect(remapBody).toHaveBeenCalledWith({ uuid: 'ps-1' }, second)
  })
})
