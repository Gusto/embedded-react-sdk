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
} from '@gusto/embedded-api/hooks/types'

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
 * SDK hooks interface for consumers
 *
 * This interface defines the supported hook types that can be passed to the GustoProvider.
 * Each hook type must implement the corresponding interface from @gusto/embedded-api/hooks/types.
 *
 * Only the following hook types are supported:
 * - beforeCreateRequest: Hooks executed before creating a Request object
 * - beforeRequest: Hooks executed after Request creation but before sending
 * - afterSuccess: Hooks executed after successful responses (2xx status codes)
 * - afterError: Hooks executed after error responses (4xx, 5xx) or network failures
 *
 * @example
 * ```typescript
 * const hooks: SDKHooks = {
 *   beforeRequest: [{
 *     beforeRequest: (context, request) => {
 *       request.headers.set('Authorization', 'Bearer token')
 *       return request
 *     }
 *   }]
 * }
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
