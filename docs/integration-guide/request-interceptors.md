---
title: Request Interceptors
---

Request Interceptors provide a powerful way to customize request and response handling in the Gusto Embedded React SDK. The SDK provides four distinct hook types to handle different phases of the HTTP request lifecycle. This allows you to implement authentication, logging, error handling, and other cross-cutting concerns with precision and flexibility.

## Interceptor Types

The SDK supports four types of request interceptors, each designed for specific phases of the request lifecycle:

### BeforeCreateRequest Interceptors

`BeforeCreateRequest` interceptors are executed before the SDK creates a `Request` object. This is the earliest intervention point, useful for URL modification, method changes, or base configuration setup.

```typescript
interface BeforeCreateRequestHook {
  beforeCreateRequest: (hookCtx: BeforeCreateRequestContext, input: RequestInput) => RequestInput
}
```

### BeforeRequest Interceptors

`BeforeRequest` interceptors are executed after the Request object is created but before it's sent. They're ideal for adding headers, authentication tokens, or other request modifications.

```typescript
interface BeforeRequestHook {
  beforeRequest: (hookCtx: BeforeRequestContext, request: Request) => Request | Promise<Request>
}
```

### AfterSuccess Interceptors

`AfterSuccess` interceptors are executed after receiving successful API responses (2xx status codes). They're perfect for success-specific logging, cache management, or data transformation.

```typescript
interface AfterSuccessHook {
  afterSuccess: (hookCtx: AfterSuccessContext, response: Response) => Response | Promise<Response>
}
```

### AfterError Interceptors

`AfterError` interceptors are executed after receiving error responses (4xx, 5xx) or network failures. They enable custom error handling, retry logic, and fallback responses.

```typescript
interface AfterErrorHook {
  afterError: (
    hookCtx: AfterErrorContext,
    response: Response | null,
    error: unknown,
  ) => Promise<{ response: Response | null; error: unknown }>
}
```

## Basic Usage

Pass request interceptors to the `GustoProvider` using the `hooks` prop:

```tsx
import {
  GustoProvider,
  type BeforeRequestHook,
  type AfterSuccessHook,
  type SDKHooks,
} from '@gusto/embedded-react-sdk'

const authHook: BeforeRequestHook = {
  beforeRequest: (context, request) => {
    const token = getAuthToken() // Your auth logic
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
}

const successHook: AfterSuccessHook = {
  afterSuccess: (context, response) => {
    console.log(`API call to ${context.operationID} succeeded`)
    return response
  },
}

const hooks: SDKHooks = {
  beforeRequest: [authHook],
  afterSuccess: [successHook],
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }} hooks={hooks}>
      <YourComponents />
    </GustoProvider>
  )
}
```

## Authentication Examples

### Environment Variable Authentication

For development and simple deployments, you can authenticate using environment variables:

```typescript
import type { BeforeRequestHook } from '@gusto/embedded-react-sdk'

export const envAuthHook: BeforeRequestHook = {
  beforeRequest: (context, request) => {
    const apiKey = process.env.REACT_APP_GUSTO_API_KEY
    if (apiKey) {
      request.headers.set('Authorization', `Bearer ${apiKey}`)
    }
    return request
  },
}
```

### Dynamic Token Authentication

For production applications, you'll typically want to fetch tokens dynamically:

```typescript
import type { BeforeRequestHook } from '@gusto/embedded-react-sdk'

export const dynamicAuthHook: BeforeRequestHook = {
  beforeRequest: async (context, request) => {
    try {
      // Get token from your auth system
      const token = await getAccessToken()
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`)
      }

      // Add user context headers if available
      const userId = getCurrentUserId()
      if (userId) {
        request.headers.set('X-User-ID', userId)
      }

      return request
    } catch (error) {
      console.error('Failed to add auth headers:', error)
      return request // Continue without auth rather than failing
    }
  },
}
```

### OAuth Token Refresh

Handle token refresh automatically in your hooks:

```typescript
import type { BeforeRequestHook } from '@gusto/embedded-react-sdk'

export const oauthHook: BeforeRequestHook = {
  beforeRequest: async (context, request) => {
    let token = getStoredToken()

    // Check if token is expired and refresh if needed
    if (isTokenExpired(token)) {
      try {
        token = await refreshToken()
        storeToken(token)
      } catch (error) {
        // Handle refresh failure - redirect to login, etc.
        console.error('Token refresh failed:', error)
        redirectToLogin()
        return request
      }
    }

    request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
}
```

## Advanced Use Cases

### Multiple Interceptors

You can register multiple interceptors for composition and separation of concerns:

```typescript
import type {
  BeforeRequestHook,
  AfterSuccessHook,
  AfterErrorHook,
  SDKHooks,
} from '@gusto/embedded-react-sdk'

const authHook: BeforeRequestHook = {
  beforeRequest: (context, request) => {
    // Handle authentication
    return request
  },
}

const loggingHook: BeforeRequestHook = {
  beforeRequest: (context, request) => {
    console.log(`Making request: ${context.operationID}`)
    return request
  },
}

const successMetricsHook: AfterSuccessHook = {
  afterSuccess: (context, response) => {
    // Track successful API calls
    trackApiCall(context.operationID, response.status, 'success')
    return response
  },
}

const errorMetricsHook: AfterErrorHook = {
  afterError: async (context, response, error) => {
    // Track failed API calls
    trackApiCall(context.operationID, response?.status || 0, 'error')
    return { response, error }
  },
}

const hooks: SDKHooks = {
  beforeRequest: [authHook, loggingHook],
  afterSuccess: [successMetricsHook],
  afterError: [errorMetricsHook],
}
```

### Client IP for Form Signing

Some workflows require the user's IP address for security purposes. You can add this through hooks:

```typescript
export const clientIPHook: BeforeRequestHook = async (request, context) => {
  // Get client IP from your backend
  const clientIP = await getCurrentUserIP()
  if (clientIP) {
    request.headers.set('x-gusto-client-ip', clientIP)
  }
  return request
}
```

### Error Handling and Retry Logic

Implement custom error handling and retry logic:

```typescript
import type { AfterResponseHook } from '@gusto/embedded-react-sdk'

export const errorHandlingHook: AfterResponseHook = async (response, context) => {
  if (response.status === 401) {
    // Handle unauthorized - maybe refresh token and retry
    console.warn('Unauthorized request, redirecting to login')
    redirectToLogin()
  } else if (response.status >= 500) {
    // Log server errors
    console.error('Server error:', response.status, context.request.url)
    // You could implement retry logic here
  }

  return response
}
```

## Context Objects

### BeforeRequestContext

The context object passed to `BeforeRequest` hooks contains:

```typescript
interface BeforeRequestContext {
  baseURL: string | URL // Base URL for the API
  operationID: string // Unique operation identifier
  oAuth2Scopes: string[] | null // OAuth scopes if applicable
  retryConfig: RetryConfig // Retry configuration
  resolvedSecurity: SecurityState | null // Security context
  options: SDKOptions // SDK options
}
```

### AfterSuccessContext

The context object passed to `AfterSuccess` hooks contains:

```typescript
interface AfterSuccessContext {
  baseURL: string | URL // Base URL for the API
  operationID: string // Unique operation identifier
  oAuth2Scopes: string[] | null // OAuth scopes if applicable
  retryConfig: RetryConfig // Retry configuration
  resolvedSecurity: SecurityState | null // Security context
  options: SDKOptions // SDK options
}
```

### AfterErrorContext

The context object passed to `AfterError` hooks contains:

```typescript
interface AfterErrorContext {
  baseURL: string | URL // Base URL for the API
  operationID: string // Unique operation identifier
  oAuth2Scopes: string[] | null // OAuth scopes if applicable
  retryConfig: RetryConfig // Retry configuration
  resolvedSecurity: SecurityState | null // Security context
  options: SDKOptions // SDK options
}
```

## Best Practices

### Error Resilience

Interceptors should be resilient to errors and not break the request flow. The SDK automatically catches and silently handles hook errors to prevent them from breaking API requests:

```typescript
export const resilientHook: BeforeRequestHook = async (request, context) => {
  try {
    // Your hook logic
    const token = await getToken()
    request.headers.set('Authorization', `Bearer ${token}`)
  } catch (error) {
    // Hook errors are automatically caught by the SDK
    // You can still handle errors locally if needed
    // Return original request rather than throwing
  }
  return request
}

// Hook errors won't break the request flow
export const mayFailHook: BeforeRequestHook = (request, context) => {
  // This error won't break the request
  throw new Error('Hook failed!')
  // Other hooks will still execute, request will still be made
}
```

### Performance Considerations

Keep interceptors lightweight to avoid slowing down API requests:

```typescript
// Good: Fast, synchronous when possible
export const fastAuthHook: BeforeRequestHook = (request, context) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  return request
}

// Use context data for debugging
export const debugHook: BeforeRequestHook = (request, context) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Making request to:', context.requestUrl)
  }
  return request
}

// Avoid: Unnecessary async operations
export const slowHook: BeforeRequestHook = async (request, context) => {
  await new Promise(resolve => setTimeout(resolve, 100)) // Don't do this
  return request
}
```

### Testing Interceptors

Test your interceptors independently from the SDK:

```typescript
import { envAuthHook } from './hooks/auth'

describe('envAuthHook', () => {
  it('should add authorization header when API key is present', async () => {
    process.env.REACT_APP_GUSTO_API_KEY = 'test-key'

    const request = new Request('https://api.example.com')
    const result = await envAuthHook(request, {})

    expect(result.headers.get('Authorization')).toBe('Bearer test-key')
  })

  it('should not modify request when API key is missing', async () => {
    delete process.env.REACT_APP_GUSTO_API_KEY

    const request = new Request('https://api.example.com')
    const result = await envAuthHook(request, {})

    expect(result.headers.get('Authorization')).toBeNull()
  })
})
```

## Integration with Proxy Servers

If you're using a proxy server for authentication (as recommended in the [Authentication guide](doc:authentication-1)), you can use hooks to pass additional context:

```typescript
export const proxyContextHook: BeforeRequestHook = (request, context) => {
  // Add context for your proxy server
  const userId = getCurrentUserId()
  const companyId = getCurrentCompanyId()

  if (userId) request.headers.set('X-User-ID', userId)
  if (companyId) request.headers.set('X-Company-ID', companyId)

  return request
}
```

This allows your proxy server to make authorization decisions and fetch the appropriate OAuth tokens for the API requests.
