import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import {
  useStringifyGenericFieldValue,
  useStringifyGenericFieldValueArray,
} from './useStringifyGenericFieldValue'
import type { ConvertValueToString } from './useStringifyGenericFieldValue'

interface TestOption<TValue> {
  label: string
  value: TValue
}

interface ComplexValue {
  id: number
  name: string
}

describe('useStringifyGenericFieldValue', () => {
  test('should convert option values to strings and handle selection', () => {
    const options = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
      { label: 'Option 3', value: 3 },
    ]
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      useStringifyGenericFieldValue<number, TestOption<number>>({
        options,
        value: 2,
        onChange,
      }),
    )

    expect(result.current.options).toEqual([
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ])
    expect(result.current.value).toBe('2')

    act(() => {
      result.current.onChange('1')
    })
    expect(onChange).toHaveBeenCalledWith(1)
  })

  test('should handle undefined values', () => {
    const options = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
    ]
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      useStringifyGenericFieldValue<number, TestOption<number>>({
        options,
        value: undefined,
        onChange,
      }),
    )

    expect(result.current.value).toBeUndefined()
  })

  test('should use custom convertValueToString function', () => {
    const options = [
      { label: 'Option 1', value: { id: 1, name: 'One' } },
      { label: 'Option 2', value: { id: 2, name: 'Two' } },
    ]
    const onChange = vi.fn()
    const convertValueToString: ConvertValueToString<ComplexValue> = value =>
      `${value.id}-${value.name}`

    const { result } = renderHook(() =>
      useStringifyGenericFieldValue<ComplexValue, TestOption<ComplexValue>>({
        options,
        value: { id: 1, name: 'One' },
        onChange,
        convertValueToString,
      }),
    )

    expect(result.current.value).toBe('1-One')

    act(() => {
      result.current.onChange('2-Two')
    })

    expect(onChange).toHaveBeenCalledWith({ id: 2, name: 'Two' })
  })
})

describe('useStringifyGenericFieldValueArray', () => {
  test('should handle array values and convert them to strings', () => {
    const options = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
      { label: 'Option 3', value: 3 },
    ]
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      useStringifyGenericFieldValueArray<number, TestOption<number>>({
        options,
        value: [1, 3],
        onChange,
      }),
    )

    expect(result.current.options).toEqual([
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ])
    expect(result.current.value).toEqual(['1', '3'])

    act(() => {
      result.current.onChange(['1', '2'])
    })
    expect(onChange).toHaveBeenCalledWith([1, 2])
  })

  test('should handle undefined array values', () => {
    const options = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
    ]
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      useStringifyGenericFieldValueArray<number, TestOption<number>>({
        options,
        value: undefined,
        onChange,
      }),
    )

    expect(result.current.value).toBeUndefined()
  })

  test('should use custom convertValueToString function with arrays', () => {
    const options = [
      { label: 'Option 1', value: { id: 1, name: 'One' } },
      { label: 'Option 2', value: { id: 2, name: 'Two' } },
      { label: 'Option 3', value: { id: 3, name: 'Three' } },
    ]
    const onChange = vi.fn()
    const convertValueToString: ConvertValueToString<ComplexValue> = value =>
      `${value.id}-${value.name}`

    const { result } = renderHook(() =>
      useStringifyGenericFieldValueArray<ComplexValue, TestOption<ComplexValue>>({
        options,
        value: [
          { id: 1, name: 'One' },
          { id: 3, name: 'Three' },
        ],
        onChange,
        convertValueToString,
      }),
    )

    expect(result.current.value).toEqual(['1-One', '3-Three'])

    act(() => {
      result.current.onChange(['1-One', '2-Two'])
    })

    expect(onChange).toHaveBeenCalledWith([
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' },
    ])
  })

  test('should filter out invalid values when converting back from strings', () => {
    const options = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
    ]
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      useStringifyGenericFieldValueArray<number, TestOption<number>>({
        options,
        value: [1],
        onChange,
      }),
    )

    act(() => {
      result.current.onChange(['1', '3'])
    })

    expect(onChange).toHaveBeenCalledWith([1])
  })
})
