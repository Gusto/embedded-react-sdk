import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { useField } from './useField'

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    mode: 'onTouched',
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('useField', () => {
  test('should set isInvalid when fieldState has an error', async () => {
    const { result } = renderHook(
      () =>
        useField({
          name: 'testField',
          isRequired: true,
        }),
      {
        wrapper: FormWrapper,
      },
    )

    expect(result.current.isInvalid).toBe(false)

    act(() => {
      result.current.onBlur()
    })

    await waitFor(() => {
      expect(result.current.isInvalid).toBe(true)
    })
  })

  test('should not return an error message if fieldState has no error', () => {
    const { result } = renderHook(
      () => useField({ name: 'testField', errorMessage: 'test error message' }),
      { wrapper: FormWrapper },
    )

    expect(result.current.errorMessage).toBeUndefined()
  })

  test('should use provided errorMessage over fieldState error message if both exist', async () => {
    const customErrorMessage = 'Props error message'
    const { result } = renderHook(
      () =>
        useField({
          name: 'testField',
          rules: {
            required: 'hook form error message',
          },
          errorMessage: customErrorMessage,
        }),
      {
        wrapper: FormWrapper,
      },
    )

    act(() => {
      result.current.onBlur()
    })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe(customErrorMessage)
    })
  })

  test('should call custom onChange handler when provided', () => {
    const customOnChange = vi.fn()
    const { result } = renderHook(
      () =>
        useField({
          name: 'testField',
          onChange: customOnChange,
        }),
      {
        wrapper: FormWrapper,
      },
    )

    act(() => {
      result.current.onChange('test value')
    })

    expect(customOnChange).toHaveBeenCalledWith('test value')
    expect(result.current.value).toBe('test value')
  })

  test('should properly transform the value', () => {
    const { result } = renderHook(
      () =>
        useField({
          name: 'testField',
          transform: (value: string) => value.split(' ').join('-'),
        }),
      {
        wrapper: FormWrapper,
      },
    )

    act(() => {
      result.current.onChange('some test value')
    })

    expect(result.current.value).toBe('some-test-value')
  })
})
