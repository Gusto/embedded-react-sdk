// SDK Hook types for consumers to implement custom request/response logic
// These align with Speakeasy's native hook interface

import type {
  BeforeCreateRequestHook as SpeakeasyBeforeCreateRequestHook,
  BeforeRequestHook as SpeakeasyBeforeRequestHook,
  AfterSuccessHook as SpeakeasyAfterSuccessHook,
  AfterErrorHook as SpeakeasyAfterErrorHook,
  BeforeCreateRequestContext,
  BeforeRequestContext,
  AfterSuccessContext,
  AfterErrorContext,
} from '@gusto/embedded-api/hooks/types'

// Re-export Speakeasy types for consumer use
export type {
  BeforeCreateRequestContext,
  BeforeRequestContext,
  AfterSuccessContext,
  AfterErrorContext,
}

// Re-export Speakeasy hook interfaces
export type BeforeCreateRequestHook = SpeakeasyBeforeCreateRequestHook
export type BeforeRequestHook = SpeakeasyBeforeRequestHook
export type AfterSuccessHook = SpeakeasyAfterSuccessHook
export type AfterErrorHook = SpeakeasyAfterErrorHook

// SDK hooks interface for consumers
export interface SDKHooks {
  beforeCreateRequest?: BeforeCreateRequestHook[]
  beforeRequest?: BeforeRequestHook[]
  afterSuccess?: AfterSuccessHook[]
  afterError?: AfterErrorHook[]
}
