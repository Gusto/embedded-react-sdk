import { describe, test, expect } from 'vitest'
import { apiVersionHook } from './apiVersionHook'

describe('apiVersionHook', () => {
  test('sets X-Gusto-API-Version header to 2026-02-01', () => {
    const mockRequest = new Request('https://api.example.com/v1/companies')
    const mockContext = {} as Parameters<typeof apiVersionHook.beforeRequest>[0]

    const modifiedRequest = apiVersionHook.beforeRequest(mockContext, mockRequest) as Request

    expect(modifiedRequest.headers.get('X-Gusto-API-Version')).toBe('2026-02-01')
  })

  test('overrides existing X-Gusto-API-Version header', () => {
    const mockRequest = new Request('https://api.example.com/v1/companies', {
      headers: {
        'X-Gusto-API-Version': '2024-04-01',
      },
    })
    const mockContext = {} as Parameters<typeof apiVersionHook.beforeRequest>[0]

    const modifiedRequest = apiVersionHook.beforeRequest(mockContext, mockRequest) as Request

    expect(modifiedRequest.headers.get('X-Gusto-API-Version')).toBe('2026-02-01')
  })

  test('preserves other headers', () => {
    const mockRequest = new Request('https://api.example.com/v1/companies', {
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    })
    const mockContext = {} as Parameters<typeof apiVersionHook.beforeRequest>[0]

    const modifiedRequest = apiVersionHook.beforeRequest(mockContext, mockRequest) as Request

    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer test-token')
    expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json')
    expect(modifiedRequest.headers.get('X-Gusto-API-Version')).toBe('2026-02-01')
  })

  test('returns the same request object', () => {
    const mockRequest = new Request('https://api.example.com/v1/companies')
    const mockContext = {} as Parameters<typeof apiVersionHook.beforeRequest>[0]

    const modifiedRequest = apiVersionHook.beforeRequest(mockContext, mockRequest) as Request

    expect(modifiedRequest).toBe(mockRequest)
  })
})
