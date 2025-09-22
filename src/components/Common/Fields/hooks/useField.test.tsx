import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import React from 'react'
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

  describe('description processing', () => {
    test('should return non-string descriptions as-is', () => {
      const jsxElement = <span>JSX element</span>
      const { result } = renderHook(
        () =>
          useField({
            name: 'testField',
            description: jsxElement,
          }),
        {
          wrapper: FormWrapper,
        },
      )

      expect(result.current.description).toBe(jsxElement)
    })

    test('should return null/undefined descriptions as-is', () => {
      const { result: resultNull } = renderHook(
        () =>
          useField({
            name: 'testField',
            description: null,
          }),
        {
          wrapper: FormWrapper,
        },
      )

      const { result: resultUndefined } = renderHook(
        () =>
          useField({
            name: 'testField',
            description: undefined,
          }),
        {
          wrapper: FormWrapper,
        },
      )

      expect(resultNull.current.description).toBeNull()
      expect(resultUndefined.current.description).toBeUndefined()
    })

    test('should process plain text strings as React elements with sanitized content', () => {
      const plainText = 'Plain text description'
      const { result } = renderHook(
        () =>
          useField({
            name: 'testField',
            description: plainText,
          }),
        {
          wrapper: FormWrapper,
        },
      )

      const element = result.current.description as React.ReactElement<{
        dangerouslySetInnerHTML: { __html: string }
      }>
      expect(React.isValidElement(element)).toBe(true)
      expect(element.props.dangerouslySetInnerHTML.__html).toBe(plainText)
    })

    test('should process HTML strings and preserve safe HTML tags', () => {
      const { result } = renderHook(
        () =>
          useField({
            name: 'testField',
            description: 'Text with <b>bold</b> and <a href="https://example.com">link</a>',
          }),
        {
          wrapper: FormWrapper,
        },
      )

      const element = result.current.description as React.ReactElement<{
        dangerouslySetInnerHTML: { __html: string }
      }>
      expect(React.isValidElement(element)).toBe(true)
      expect(element.props.dangerouslySetInnerHTML.__html).toBe(
        'Text with <b>bold</b> and <a href="https://example.com">link</a>',
      )
    })

    test('should sanitize dangerous HTML content and remove script tags', () => {
      const { result } = renderHook(
        () =>
          useField({
            name: 'testField',
            description: 'Safe text <script>alert("XSS")</script> more text',
          }),
        {
          wrapper: FormWrapper,
        },
      )

      const element = result.current.description as React.ReactElement<{
        dangerouslySetInnerHTML: { __html: string }
      }>
      expect(React.isValidElement(element)).toBe(true)
      expect(element.props.dangerouslySetInnerHTML.__html).toBe('Safe text  more text')
      expect(element.props.dangerouslySetInnerHTML.__html).not.toContain('<script>')
    })

    test('should remove unsafe attributes from allowed tags', () => {
      const { result } = renderHook(
        () =>
          useField({
            name: 'testField',
            description:
              'Text with <a href="https://example.com" onclick="alert(\'XSS\')">link</a>',
          }),
        {
          wrapper: FormWrapper,
        },
      )

      const element = result.current.description as React.ReactElement<{
        dangerouslySetInnerHTML: { __html: string }
      }>
      expect(React.isValidElement(element)).toBe(true)
      expect(element.props.dangerouslySetInnerHTML.__html).toBe(
        'Text with <a href="https://example.com">link</a>',
      )
      expect(element.props.dangerouslySetInnerHTML.__html).not.toContain('onclick')
    })

    test('should memoize description processing', () => {
      const description = 'Test description'
      const { result, rerender } = renderHook(
        () =>
          useField({
            name: 'testField',
            description,
          }),
        {
          wrapper: FormWrapper,
        },
      )

      const firstDescription = result.current.description

      // Rerender with same description
      rerender()

      const secondDescription = result.current.description

      // Should be the same object due to memoization
      expect(firstDescription).toBe(secondDescription)
    })

    test('should reprocess description when it changes', () => {
      const { result, rerender } = renderHook(
        ({ description }) =>
          useField({
            name: 'testField',
            description,
          }),
        {
          wrapper: FormWrapper,
          initialProps: { description: 'First description' },
        },
      )

      const firstDescription = result.current.description

      // Change description
      rerender({ description: 'Second description' })

      const secondDescription = result.current.description

      // Should be different objects
      expect(firstDescription).not.toBe(secondDescription)
    })
  })
})
