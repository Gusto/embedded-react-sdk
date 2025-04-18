import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ComponentsContextType } from '../ComponentAdapter/ComponentsProvider'
import { useGustoProvider } from './useGustoProvider'
import { SDKI18next } from './SDKI18next'

// Mock the SDKI18next instance
vi.mock('./SDKI18next', () => ({
  SDKI18next: {
    addResourceBundle: vi.fn(),
    changeLanguage: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('useGustoProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the correct values', () => {
    const mockTextInput = vi.fn()
    const props = {
      config: { baseUrl: 'https://test.api.com' },
      lng: 'es',
      locale: 'es-ES',
      currency: 'EUR',
      theme: { colors: {} },
      components: { TextInput: mockTextInput } as Partial<ComponentsContextType>,
    }

    const { result } = renderHook(() => useGustoProvider(props))

    expect(result.current).toEqual({
      config: props.config,
      lng: props.lng,
      locale: props.locale,
      currency: props.currency,
      theme: props.theme,
      components: props.components,
    })
  })

  it('uses default values when not provided', () => {
    const props = {
      config: { baseUrl: 'https://test.api.com' },
    }

    const { result } = renderHook(() => useGustoProvider(props))

    expect(result.current).toEqual({
      config: props.config,
      lng: 'en',
      locale: 'en-US',
      currency: 'USD',
      theme: undefined,
      components: undefined,
    })
  })

  it('calls addResourceBundle when dictionary is provided', () => {
    const props = {
      config: { baseUrl: 'https://test.api.com' },
      // Use an empty object that will be processed by TypeScript as any type
      dictionary: { en: { common: {} } },
    }

    renderHook(() => useGustoProvider(props))

    // Just check that the function was called, without checking specifics
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SDKI18next.addResourceBundle).toHaveBeenCalled()
  })

  it('calls changeLanguage when lng is provided', async () => {
    const props = {
      config: { baseUrl: 'https://test.api.com' },
      lng: 'fr',
    }

    renderHook(() => useGustoProvider(props))

    await vi.waitFor(() => {
      // Just verify the function was called without checking parameters
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(SDKI18next.changeLanguage).toHaveBeenCalled()
    })
  })
})
