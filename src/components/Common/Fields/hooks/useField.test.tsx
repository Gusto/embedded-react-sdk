import { renderHook, render, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { type Control, FormProvider, useForm } from 'react-hook-form'
import React from 'react'
import { useField } from './useField'
import {
  FieldElementRegistryContext,
  useFieldElementRegistry,
  type FieldElementRegistry,
} from './fieldElementRegistry'

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

  test('should not show errorMessage from context path when there is no fieldState error', () => {
    const { result } = renderHook(
      () => useField({ name: 'testField', errorMessage: 'test error message' }),
      { wrapper: FormWrapper },
    )

    expect(result.current.isInvalid).toBe(false)
    expect(result.current.errorMessage).toBeUndefined()
  })

  test('should show errorMessage as authoritative when control is explicitly provided', () => {
    let capturedControl: ReturnType<typeof useForm>['control'] | undefined
    const ControlCapture = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm({ mode: 'onTouched' })
      capturedControl = methods.control
      return <FormProvider {...methods}>{children}</FormProvider>
    }
    const { result } = renderHook(
      () =>
        useField({
          name: 'testField',
          control: capturedControl as unknown as Control,
          errorMessage: 'sdk error',
        }),
      { wrapper: ControlCapture },
    )

    expect(result.current.isInvalid).toBe(true)
    expect(result.current.errorMessage).toBe('sdk error')
  })

  test('should not return an error message when neither fieldState nor errorMessage prop has an error', () => {
    const { result } = renderHook(() => useField({ name: 'testField' }), {
      wrapper: FormWrapper,
    })

    expect(result.current.isInvalid).toBe(false)
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

  describe('field element registry', () => {
    function TestField({ name }: { name: string }) {
      const { inputRef } = useField({ name })
      return <input data-testid={`input-${name}`} ref={inputRef} />
    }

    function RegistryFormWrapper({
      registry,
      children,
    }: {
      registry: FieldElementRegistry | null
      children: React.ReactNode
    }) {
      const methods = useForm()
      return (
        <FieldElementRegistryContext.Provider value={registry}>
          <FormProvider {...methods}>{children}</FormProvider>
        </FieldElementRegistryContext.Provider>
      )
    }

    test('registers the DOM element under the field name when a registry is in context', () => {
      const { result: registryResult } = renderHook(() => useFieldElementRegistry())
      const registry = registryResult.current

      const { getByTestId } = render(
        <RegistryFormWrapper registry={registry}>
          <TestField name="firstName" />
        </RegistryFormWrapper>,
      )

      const input = getByTestId('input-firstName')
      expect(registry.get('firstName')).toBe(input)
      expect(registry.names()).toEqual(['firstName'])
    })

    test('unregisters the field when the component unmounts', () => {
      const { result: registryResult } = renderHook(() => useFieldElementRegistry())
      const registry = registryResult.current

      const { unmount } = render(
        <RegistryFormWrapper registry={registry}>
          <TestField name="firstName" />
        </RegistryFormWrapper>,
      )

      expect(registry.get('firstName')).not.toBeNull()

      unmount()

      expect(registry.get('firstName')).toBeNull()
      expect(registry.names()).toEqual([])
    })

    test('cleans up the previous entry when the field name changes', () => {
      const { result: registryResult } = renderHook(() => useFieldElementRegistry())
      const registry = registryResult.current

      const { rerender, getByTestId } = render(
        <RegistryFormWrapper registry={registry}>
          <TestField name="firstName" />
        </RegistryFormWrapper>,
      )

      expect(registry.names()).toEqual(['firstName'])

      rerender(
        <RegistryFormWrapper registry={registry}>
          <TestField name="lastName" />
        </RegistryFormWrapper>,
      )

      const lastNameInput = getByTestId('input-lastName')
      expect(registry.get('firstName')).toBeNull()
      expect(registry.get('lastName')).toBe(lastNameInput)
      expect(registry.names()).toEqual(['lastName'])
    })

    test('is a no-op when no registry is published in context', () => {
      const FormWrapperNoRegistry = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm()
        return <FormProvider {...methods}>{children}</FormProvider>
      }

      expect(() =>
        render(
          <FormWrapperNoRegistry>
            <TestField name="firstName" />
          </FormWrapperNoRegistry>,
        ),
      ).not.toThrow()
    })
  })
})
