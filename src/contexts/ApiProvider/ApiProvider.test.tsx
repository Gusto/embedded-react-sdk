import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { ApiProvider } from './ApiProvider'
import type { SDKHooks } from '@/types/hooks'

// Mock the Gusto SDK
const mockSDKHooksInstance = {
  registerBeforeCreateRequestHook: vi.fn(),
  registerBeforeRequestHook: vi.fn(),
  registerAfterSuccessHook: vi.fn(),
  registerAfterErrorHook: vi.fn(),
}

vi.mock('@gusto/embedded-api/core', () => ({
  GustoEmbeddedCore: vi.fn().mockImplementation(config => ({
    _options: { hooks: null },
    config,
  })),
}))

vi.mock('@gusto/embedded-api/hooks/hooks', () => ({
  SDKHooks: vi.fn().mockImplementation(() => mockSDKHooksInstance),
}))

vi.mock('@gusto/embedded-api/react-query/_context', () => ({
  GustoEmbeddedProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="gusto-provider">{children}</div>
  ),
}))

describe('ApiProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders without crashing', () => {
    render(
      <ApiProvider url="https://api.example.com">
        <div>Test child</div>
      </ApiProvider>,
    )
  })

  test('registers hooks with SDK when provided', async () => {
    const { GustoEmbeddedCore } = await import('@gusto/embedded-api/core')

    const mockHooks: SDKHooks = {
      beforeCreateRequest: [{ beforeCreateRequest: vi.fn() }],
      beforeRequest: [{ beforeRequest: vi.fn() }],
      afterSuccess: [{ afterSuccess: vi.fn() }],
      afterError: [{ afterError: vi.fn() }],
    }

    render(
      <ApiProvider url="https://api.example.com" hooks={mockHooks}>
        <div>Test</div>
      </ApiProvider>,
    )

    // Verify SDK was created with correct URL
    expect(GustoEmbeddedCore).toHaveBeenCalledWith({
      serverURL: 'https://api.example.com',
    })

    // Verify hooks were registered
    expect(mockSDKHooksInstance.registerBeforeCreateRequestHook).toHaveBeenCalledWith(
      mockHooks.beforeCreateRequest![0],
    )
    expect(mockSDKHooksInstance.registerBeforeRequestHook).toHaveBeenCalledWith(
      mockHooks.beforeRequest![0],
    )
    expect(mockSDKHooksInstance.registerAfterSuccessHook).toHaveBeenCalledWith(
      mockHooks.afterSuccess![0],
    )
    expect(mockSDKHooksInstance.registerAfterErrorHook).toHaveBeenCalledWith(
      mockHooks.afterError![0],
    )
  })

  test('adds headers to requests when headers provided', () => {
    const headers = { 'X-API-Key': 'test-key', Authorization: 'Bearer token' }

    render(
      <ApiProvider url="https://api.example.com" headers={headers}>
        <div>Test</div>
      </ApiProvider>,
    )

    // Verify header hook was registered
    expect(mockSDKHooksInstance.registerBeforeRequestHook).toHaveBeenCalled()

    // Get the registered hook function
    const hookCalls = mockSDKHooksInstance.registerBeforeRequestHook.mock.calls
    expect(hookCalls).toHaveLength(1)

    const headerHook = hookCalls[0]![0] as {
      beforeRequest: (context: object, request: Request) => Request
    }

    // Test that the hook adds headers correctly
    const mockRequest = new Request('https://example.com')
    const mockContext = { operationID: 'test', baseURL: 'https://example.com' }

    const modifiedRequest = headerHook.beforeRequest(mockContext, mockRequest)

    expect(modifiedRequest.headers.get('X-API-Key')).toBe('test-key')
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer token')
  })

  test('combines headers prop with custom hooks', () => {
    const headers = { 'X-API-Key': 'prop-key' }
    const customHook = {
      beforeRequest: vi.fn((context: object, request: Request) => {
        request.headers.set('X-Custom-Hook', 'hook-value')
        return request
      }),
    }

    render(
      <ApiProvider
        url="https://api.example.com"
        headers={headers}
        hooks={{ beforeRequest: [customHook] }}
      >
        <div>Test</div>
      </ApiProvider>,
    )

    // Should register 2 hooks: one for headers prop, one for custom hook
    expect(mockSDKHooksInstance.registerBeforeRequestHook).toHaveBeenCalledTimes(2)

    // Test both hooks work together
    const mockRequest = new Request('https://example.com')
    const mockContext = { operationID: 'test', baseURL: 'https://example.com' }

    // Execute both hooks (headers prop hook first, then custom hook)
    const headerHookCalls = mockSDKHooksInstance.registerBeforeRequestHook.mock.calls
    const headerHook = headerHookCalls[0]![0] as {
      beforeRequest: (context: object, request: Request) => Request
    }

    const afterHeaderHook = headerHook.beforeRequest(mockContext, mockRequest)
    const finalRequest = customHook.beforeRequest(mockContext, afterHeaderHook)

    // Both headers should be present
    expect(finalRequest.headers.get('X-API-Key')).toBe('prop-key')
    expect(finalRequest.headers.get('X-Custom-Hook')).toBe('hook-value')
  })

  test('works without hooks or headers', async () => {
    const { GustoEmbeddedCore } = await import('@gusto/embedded-api/core')

    render(
      <ApiProvider url="https://api.example.com">
        <div>Test</div>
      </ApiProvider>,
    )

    expect(GustoEmbeddedCore).toHaveBeenCalledWith({
      serverURL: 'https://api.example.com',
    })
  })
})
