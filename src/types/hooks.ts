// SDK Hook types for consumers to implement custom request/response logic
// These align with the native SDK hook interface

import type {
  BeforeCreateRequestHook,
  BeforeRequestHook,
  AfterSuccessHook,
  AfterErrorHook,
  BeforeCreateRequestContext,
  BeforeRequestContext,
  AfterSuccessContext,
  AfterErrorContext,
} from '@gusto/embedded-api-v-2025-11-15/hooks/types'

// Re-export hook types and contexts for consumer use
export type {
  BeforeCreateRequestHook,
  BeforeRequestHook,
  AfterSuccessHook,
  AfterErrorHook,
  BeforeCreateRequestContext,
  BeforeRequestContext,
  AfterSuccessContext,
  AfterErrorContext,
}

/**
 * Request interceptors for customizing HTTP requests and responses.
 *
 * @remarks
 * Pass an instance of this interface to {@link GustoProvider} via `config.hooks` to
 * inspect or modify requests and responses across the four lifecycle stages.
 * Each entry is an array of objects implementing the corresponding hook type
 * from `@gusto/embedded-api-v-2025-11-15/hooks/types`.
 *
 * | Stage | When it runs |
 * | ----- | ------------ |
 * | `beforeCreateRequest` | Before the `Request` object is constructed (URL / method changes) |
 * | `beforeRequest` | After the `Request` is created but before it is sent (headers, auth tokens) |
 * | `afterSuccess` | After a successful response (2xx) |
 * | `afterError` | After an error response (4xx, 5xx) or network failure |
 *
 * @public
 *
 * @example
 * ```tsx
 * import { GustoProvider, type SDKHooks } from '@gusto/embedded-react-sdk'
 *
 * const hooks: SDKHooks = {
 *   beforeRequest: [
 *     {
 *       beforeRequest: (context, request) => {
 *         request.headers.set('Authorization', `Bearer ${getToken()}`)
 *         return request
 *       },
 *     },
 *   ],
 * }
 *
 * <GustoProvider config={{ baseUrl: '/api/', hooks }}>
 *   <YourApp />
 * </GustoProvider>
 * ```
 */
export interface SDKHooks {
  /** Hooks executed before creating a Request object */
  beforeCreateRequest?: BeforeCreateRequestHook[]
  /** Hooks executed after Request creation but before sending */
  beforeRequest?: BeforeRequestHook[]
  /** Hooks executed after successful responses (2xx status codes) */
  afterSuccess?: AfterSuccessHook[]
  /** Hooks executed after error responses (4xx, 5xx) or network failures */
  afterError?: AfterErrorHook[]
}
