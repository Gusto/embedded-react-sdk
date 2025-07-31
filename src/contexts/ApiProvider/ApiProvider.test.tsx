import { describe, test, expect, vi, beforeEach } from 'vitest'
import type {
  BeforeRequestHook,
  AfterSuccessHook,
  AfterErrorHook,
  SDKHooks,
  BeforeRequestContext,
  AfterSuccessContext,
  AfterErrorContext,
} from '@/types/hooks'

// Test the hook execution logic to simulate SDK behavior
const createHookExecutor = (hooks?: SDKHooks, headers?: HeadersInit) => {
  return {
    async executeRequest(request: Request | string | URL): Promise<Response> {
      let modifiedRequest = request instanceof Request ? request : new Request(request)

      // Apply default headers if provided
      if (headers) {
        const headersInstance = new Headers(headers)
        headersInstance.forEach((headerValue, headerName) => {
          if (headerValue) {
            modifiedRequest.headers.set(headerName, headerValue)
          }
        })
      }

      // Execute beforeRequest hooks (native SDK style)
      if (hooks?.beforeRequest && hooks.beforeRequest.length > 0) {
        const context: BeforeRequestContext = {
          baseURL: new URL(modifiedRequest.url).origin,
          operationID: 'test-operation',
          oAuth2Scopes: null,
          retryConfig: {
            strategy: 'backoff',
            backoff: {
              initialInterval: 500,
              maxInterval: 60000,
              exponent: 1.5,
              maxElapsedTime: 3600000,
            },
            retryConnectionErrors: true,
          },
          resolvedSecurity: null,
          options: {},
        }

        for (const hook of hooks.beforeRequest) {
          try {
            modifiedRequest = await hook.beforeRequest(context, modifiedRequest)
          } catch (error) {
            // Hook failures are silently ignored to maintain request flow
          }
        }
      }

      // Make the actual request (we'll mock this with fetch)
      let response = await fetch(modifiedRequest)

      // Execute afterSuccess/afterError hooks based on status
      if (response.ok && hooks?.afterSuccess && hooks.afterSuccess.length > 0) {
        const context: AfterSuccessContext = {
          baseURL: new URL(modifiedRequest.url).origin,
          operationID: 'test-operation',
          oAuth2Scopes: null,
          retryConfig: {
            strategy: 'backoff',
            backoff: {
              initialInterval: 500,
              maxInterval: 60000,
              exponent: 1.5,
              maxElapsedTime: 3600000,
            },
            retryConnectionErrors: true,
          },
          resolvedSecurity: null,
          options: {},
        }

        for (const hook of hooks.afterSuccess) {
          try {
            response = await hook.afterSuccess(context, response)
          } catch (error) {
            // Hook failures are silently ignored to maintain response flow
          }
        }
      } else if (!response.ok && hooks?.afterError && hooks.afterError.length > 0) {
        const context: AfterErrorContext = {
          baseURL: new URL(modifiedRequest.url).origin,
          operationID: 'test-operation',
          oAuth2Scopes: null,
          retryConfig: {
            strategy: 'backoff',
            backoff: {
              initialInterval: 500,
              maxInterval: 60000,
              exponent: 1.5,
              maxElapsedTime: 3600000,
            },
            retryConnectionErrors: true,
          },
          resolvedSecurity: null,
          options: {},
        }

        for (const hook of hooks.afterError) {
          try {
            const result = await hook.afterError(context, response, null)
            response = result.response || response
          } catch (error) {
            // Hook failures are silently ignored to maintain response flow
          }
        }
      }

      return response
    },
  }
}

describe('Request Interceptors', () => {
  let capturedRequests: Request[] = []

  beforeEach(() => {
    capturedRequests = []

    // Mock global fetch to capture requests
    global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      capturedRequests.push(request.clone())
      return Promise.resolve(new Response('Test response', { status: 200 }))
    }) as typeof fetch
  })

  test('should execute BeforeRequest hooks and inject headers', async () => {
    const beforeRequestFn = vi.fn((context: BeforeRequestContext, request: Request) => {
      request.headers.set('Authorization', 'Bearer test-token')
      request.headers.set('X-Custom-Header', 'test-value')
      return request
    })

    const authHook: BeforeRequestHook = {
      beforeRequest: beforeRequestFn,
    }

    const hooks: SDKHooks = {
      beforeRequest: [authHook],
    }

    const executor = createHookExecutor(hooks)
    await executor.executeRequest('https://api.example.com/test-endpoint')

    // Verify the hook was called
    expect(beforeRequestFn).toHaveBeenCalledOnce()
    expect(beforeRequestFn).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.example.com',
        operationID: 'test-operation',
      }),
      expect.any(Request),
    )

    // Verify headers were added to the request
    const capturedRequest = capturedRequests[0]
    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer test-token')
    expect(capturedRequest?.headers.get('X-Custom-Header')).toBe('test-value')
  })

  test('should execute multiple BeforeRequest hooks in order', async () => {
    const firstFn = vi.fn((context: BeforeRequestContext, request: Request) => {
      request.headers.set('X-First-Hook', 'executed')
      return request
    })

    const secondFn = vi.fn((context: BeforeRequestContext, request: Request) => {
      request.headers.set('X-Second-Hook', 'executed')
      return request
    })

    const firstHook: BeforeRequestHook = { beforeRequest: firstFn }
    const secondHook: BeforeRequestHook = { beforeRequest: secondFn }

    const hooks: SDKHooks = {
      beforeRequest: [firstHook, secondHook],
    }

    const executor = createHookExecutor(hooks)
    await executor.executeRequest('https://api.example.com/test-endpoint')

    // Verify both hooks were executed
    expect(firstFn).toHaveBeenCalledOnce()
    expect(secondFn).toHaveBeenCalledOnce()

    // Verify both headers were set
    const capturedRequest = capturedRequests[0]
    expect(capturedRequest?.headers.get('X-First-Hook')).toBe('executed')
    expect(capturedRequest?.headers.get('X-Second-Hook')).toBe('executed')
  })

  test('should execute AfterSuccess hooks', async () => {
    let capturedContext: AfterSuccessContext | undefined

    const afterSuccessFn = vi.fn((context: AfterSuccessContext, response: Response) => {
      capturedContext = context
      expect(context.baseURL).toBe('https://api.example.com')
      expect(context.operationID).toBe('test-operation')
      return response
    })

    const responseHook: AfterSuccessHook = {
      afterSuccess: afterSuccessFn,
    }

    const hooks: SDKHooks = {
      afterSuccess: [responseHook],
    }

    const executor = createHookExecutor(hooks)
    const response = await executor.executeRequest('https://api.example.com/test-endpoint')

    // Verify the hook was called
    expect(afterSuccessFn).toHaveBeenCalledOnce()
    expect(response.status).toBe(200)
    expect(capturedContext?.baseURL).toBe('https://api.example.com')
    expect(capturedContext?.operationID).toBe('test-operation')
  })

  test('should pass context with operation details', async () => {
    const beforeRequestFn = vi.fn((context: BeforeRequestContext, request: Request) => {
      expect(context.baseURL).toBe('https://api.example.com')
      expect(context.operationID).toBe('test-operation')
      expect(context.oAuth2Scopes).toBeNull()
      return request
    })

    const authHook: BeforeRequestHook = {
      beforeRequest: beforeRequestFn,
    }

    const hooks: SDKHooks = {
      beforeRequest: [authHook],
    }

    const headers = {
      'X-API-Key': 'test-key',
      'X-Version': '1.0',
    }

    const executor = createHookExecutor(hooks, headers)
    await executor.executeRequest('https://api.example.com/test-endpoint')

    expect(beforeRequestFn).toHaveBeenCalledOnce()
  })

  test('should handle hook errors gracefully without breaking requests', async () => {
    const failingFn = vi.fn(() => {
      throw new Error('Hook failed!')
    })

    const workingFn = vi.fn((context: BeforeRequestContext, request: Request) => {
      request.headers.set('X-Working-Hook', 'success')
      return request
    })

    const failingHook: BeforeRequestHook = { beforeRequest: failingFn }
    const workingHook: BeforeRequestHook = { beforeRequest: workingFn }

    const hooks: SDKHooks = {
      beforeRequest: [failingHook, workingHook],
    }

    const executor = createHookExecutor(hooks)
    await executor.executeRequest('https://api.example.com/test-endpoint')

    // Verify both hooks were called
    expect(failingFn).toHaveBeenCalledOnce()
    expect(workingFn).toHaveBeenCalledOnce()

    // Verify the working hook still executed
    const capturedRequest = capturedRequests[0]
    expect(capturedRequest?.headers.get('X-Working-Hook')).toBe('success')
  })

  test('should handle async hooks correctly', async () => {
    const asyncFn = vi.fn(async (context: BeforeRequestContext, request: Request) => {
      // Simulate async operation (e.g., token refresh)
      await new Promise(resolve => setTimeout(resolve, 10))
      request.headers.set('Authorization', 'Bearer async-token')
      return request
    })

    const asyncHook: BeforeRequestHook = { beforeRequest: asyncFn }

    const hooks: SDKHooks = {
      beforeRequest: [asyncHook],
    }

    const executor = createHookExecutor(hooks)
    await executor.executeRequest('https://api.example.com/test-endpoint')

    expect(asyncFn).toHaveBeenCalledOnce()

    // Verify the async header was set
    const capturedRequest = capturedRequests[0]
    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer async-token')
  })

  test('should work without hooks provided', async () => {
    const executor = createHookExecutor()
    const response = await executor.executeRequest('https://api.example.com/test-endpoint')

    expect(response.status).toBe(200)
    expect(capturedRequests).toHaveLength(1)
  })

  test('should apply default headers from config even without hooks', async () => {
    const headers = {
      'X-Default-Header': 'default-value',
    }

    const executor = createHookExecutor(undefined, headers)
    await executor.executeRequest('https://api.example.com/test-endpoint')

    const capturedRequest = capturedRequests[0]
    expect(capturedRequest?.headers.get('X-Default-Header')).toBe('default-value')
  })

  test('should handle AfterError hooks for failed requests', async () => {
    // Mock fetch to return a 500 error
    global.fetch = vi.fn(() => {
      return Promise.resolve(new Response('Server Error', { status: 500 }))
    }) as typeof fetch

    let capturedContext: AfterErrorContext | undefined

    const afterErrorFn = vi.fn(
      (context: AfterErrorContext, response: Response | null, error: unknown) => {
        capturedContext = context
        return { response, error }
      },
    )

    const errorHook: AfterErrorHook = { afterError: afterErrorFn }

    const hooks: SDKHooks = {
      afterError: [errorHook],
    }

    const executor = createHookExecutor(hooks)
    const response = await executor.executeRequest('https://api.example.com/test-endpoint')

    expect(afterErrorFn).toHaveBeenCalledOnce()
    expect(response.status).toBe(500)
    expect(capturedContext?.baseURL).toBe('https://api.example.com')
    expect(capturedContext?.operationID).toBe('test-operation')
  })
})
