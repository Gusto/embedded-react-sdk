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

// SDK hooks interface for consumers
export interface SDKHooks {
  beforeCreateRequest?: BeforeCreateRequestHook[]
  beforeRequest?: BeforeRequestHook[]
  afterSuccess?: AfterSuccessHook[]
  afterError?: AfterErrorHook[]
}
