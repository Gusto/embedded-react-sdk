import type React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HTTPClient } from '@gusto/embedded-api/lib/http'
import { ApiProvider } from './ApiProvider'

// Mock the embedded API modules
vi.mock('@gusto/embedded-api/react-query/_context', () => ({
  GustoEmbeddedProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="gusto-embedded-provider">{children}</div>
  ),
}))

vi.mock('@gusto/embedded-api/core', () => ({
  GustoEmbeddedCore: vi.fn(),
}))

vi.mock('@gusto/embedded-api/lib/http', () => ({
  HTTPClient: vi.fn(),
}))

describe('ApiProvider', () => {
  const mockHTTPClient = new HTTPClient({
    fetcher: vi.fn(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use custom HTTP client when provided', async () => {
    const { GustoEmbeddedCore } = await import('@gusto/embedded-api/core')

    render(
      <ApiProvider url="https://api.example.com" httpClient={mockHTTPClient}>
        <div>Test</div>
      </ApiProvider>,
    )

    expect(GustoEmbeddedCore).toHaveBeenCalledWith({
      serverURL: 'https://api.example.com',
      httpClient: mockHTTPClient,
    })
  })

  it('should create default HTTP client with headers when no custom client provided', async () => {
    const { GustoEmbeddedCore } = await import('@gusto/embedded-api/core')
    const { HTTPClient } = await import('@gusto/embedded-api/lib/http')

    const headers = { Authorization: 'Bearer token' }

    render(
      <ApiProvider url="https://api.example.com" headers={headers}>
        <div>Test</div>
      </ApiProvider>,
    )

    expect(HTTPClient).toHaveBeenCalled()
    expect(GustoEmbeddedCore).toHaveBeenCalledWith({
      serverURL: 'https://api.example.com',
      httpClient: expect.any(HTTPClient),
    })
  })

  it('should use custom HTTP client when provided (without headers)', async () => {
    const { GustoEmbeddedCore } = await import('@gusto/embedded-api/core')
    const { HTTPClient } = await import('@gusto/embedded-api/lib/http')

    render(
      <ApiProvider url="https://api.example.com" httpClient={mockHTTPClient}>
        <div>Test</div>
      </ApiProvider>,
    )

    // Should use custom HTTP client, not create a new one
    expect(HTTPClient).not.toHaveBeenCalled()
    expect(GustoEmbeddedCore).toHaveBeenCalledWith({
      serverURL: 'https://api.example.com',
      httpClient: mockHTTPClient,
    })
  })

  // Test that our discriminated union works correctly
  it('should accept either headers or httpClient but not both', () => {
    // These should work:
    expect(() => {
      render(
        <ApiProvider url="https://api.example.com" headers={{ Authorization: 'Bearer token' }}>
          <div>Test</div>
        </ApiProvider>,
      )
    }).not.toThrow()

    expect(() => {
      render(
        <ApiProvider url="https://api.example.com" httpClient={mockHTTPClient}>
          <div>Test</div>
        </ApiProvider>,
      )
    }).not.toThrow()
  })
})
