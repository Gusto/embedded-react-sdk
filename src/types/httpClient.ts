import type { HTTPClient } from '@gusto/embedded-api/lib/http'

/**
 * Type alias for custom HTTP clients that customers can provide
 * Must implement the same interface as the default HTTPClient
 */
export type CustomHTTPClient = HTTPClient

/**
 * Configuration options for HTTP client setup
 *
 * This is a discriminated union that ensures type safety:
 * - Either provide `headers` for the default HTTP client
 * - Or provide `httpClient` for a custom implementation
 * - But never both (mutually exclusive)
 */
export type HTTPClientConfig =
  | {
      headers?: HeadersInit
      httpClient?: never
    }
  | {
      headers?: never
      httpClient: CustomHTTPClient
    }

/**
 * Configuration for API providers that need a base URL
 *
 * Extends HTTPClientConfig to include the API endpoint URL
 */
export type APIConfig = HTTPClientConfig & {
  baseUrl: string
}

/**
 * Props for the ApiProvider component
 *
 * Extends HTTPClientConfig to include:
 * - url: The API endpoint URL
 * - children: React components to wrap
 */
export type ApiProviderProps = HTTPClientConfig & {
  url: string
  children: React.ReactNode
}
