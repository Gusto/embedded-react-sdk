import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useFieldIds } from './useFieldIds'

describe('useFieldIds', () => {
  test('should return provided IDs when they are given', () => {
    const providedInputId = 'input-id'
    const providedErrorMessageId = 'error-id'
    const providedDescriptionId = 'desc-id'
    const { result } = renderHook(() =>
      useFieldIds({
        inputId: providedInputId,
        errorMessageId: providedErrorMessageId,
        descriptionId: providedDescriptionId,
      }),
    )

    expect(result.current.inputId).toBe(providedInputId)
    expect(result.current.errorMessageId).toBe(providedErrorMessageId)
    expect(result.current.descriptionId).toBe(providedDescriptionId)
  })

  test('should generate ariaDescribedBy correctly when only description is provided', () => {
    const { result } = renderHook(() => useFieldIds({ description: 'Test description' }))

    expect(result.current.ariaDescribedBy).toBe(result.current.descriptionId)
  })

  test('should generate ariaDescribedBy correctly when only errorMessage is provided', () => {
    const { result } = renderHook(() => useFieldIds({ errorMessage: 'Test error' }))

    expect(result.current.ariaDescribedBy).toBe(result.current.errorMessageId)
  })

  test('should generate ariaDescribedBy correctly when both description and errorMessage are provided', () => {
    const { result } = renderHook(() =>
      useFieldIds({ description: 'Test description', errorMessage: 'Test error' }),
    )

    expect(result.current.ariaDescribedBy).toBe(
      `${result.current.descriptionId} ${result.current.errorMessageId}`,
    )
  })

  test('should generate ariaDescribedBy correctly when description and errorMessage are provided with specific IDs', () => {
    const descriptionId = 'custom-desc-id'
    const errorMessageId = 'custom-error-id'
    const { result } = renderHook(() =>
      useFieldIds({
        description: 'Test description',
        errorMessage: 'Test error',
        descriptionId,
        errorMessageId,
      }),
    )

    expect(result.current.ariaDescribedBy).toBe(`${descriptionId} ${errorMessageId}`)
  })

  test('should return empty ariaDescribedBy when neither description nor errorMessage is provided', () => {
    const { result } = renderHook(() => useFieldIds({}))

    expect(result.current.ariaDescribedBy).toBe('')
  })
})
