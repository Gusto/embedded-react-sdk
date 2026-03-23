import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode, useEffect } from 'react'
import { FormFieldsMetadataProvider } from './FormFieldsMetadataProvider'
import { useFieldErrorMessage } from './useFieldErrorMessage'
import type { SDKError } from '@/types/sdkError'

type TestFormValues = { street1: string; zip: string }
type TestFieldName = keyof TestFormValues

function createWrapper({
  error = null,
  formErrors = {},
}: {
  error?: SDKError | null
  formErrors?: Partial<Record<TestFieldName, { message: string }>>
}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const formMethods = useForm<TestFormValues>({
      defaultValues: { street1: '', zip: '' },
    })

    useEffect(() => {
      for (const [field, err] of Object.entries(formErrors)) {
        formMethods.setError(field as TestFieldName, err)
      }
    }, [formMethods, formErrors])

    return (
      <FormFieldsMetadataProvider metadata={{}} error={error}>
        <FormProvider {...formMethods}>{children}</FormProvider>
      </FormFieldsMetadataProvider>
    )
  }
}

describe('useFieldErrorMessage', () => {
  it('returns partner validation message when RHF error code matches', async () => {
    const wrapper = createWrapper({
      formErrors: { street1: { message: 'REQUIRED' } },
    })

    const { result } = renderHook(
      () => useFieldErrorMessage('street1', { REQUIRED: 'Street address is required' }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current).toBe('Street address is required')
    })
  })

  it('returns undefined when no error exists', () => {
    const wrapper = createWrapper({})

    const { result } = renderHook(
      () => useFieldErrorMessage('street1', { REQUIRED: 'Street address is required' }),
      { wrapper },
    )

    expect(result.current).toBeUndefined()
  })

  it('falls back to API field error when no validation message matches', () => {
    const sdkError: SDKError = {
      category: 'api_error',
      message: '1 field has issues',
      httpStatus: 422,
      fieldErrors: [
        {
          field: 'street1',
          category: 'invalid_attribute_value',
          message: 'Street address cannot be empty',
        },
      ],
    }

    const wrapper = createWrapper({ error: sdkError })

    const { result } = renderHook(() => useFieldErrorMessage('street1'), { wrapper })

    expect(result.current).toBe('Street address cannot be empty')
  })

  it('prioritizes partner validation message over API field error', async () => {
    const sdkError: SDKError = {
      category: 'api_error',
      message: '1 field has issues',
      httpStatus: 422,
      fieldErrors: [
        {
          field: 'street1',
          category: 'invalid_attribute_value',
          message: 'API error message for street1',
        },
      ],
    }

    const wrapper = createWrapper({
      error: sdkError,
      formErrors: { street1: { message: 'REQUIRED' } },
    })

    const { result } = renderHook(
      () => useFieldErrorMessage('street1', { REQUIRED: 'Partner error message' }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current).toBe('Partner error message')
    })
  })

  it('falls back to API field error when error code exists but no matching validation message', async () => {
    const sdkError: SDKError = {
      category: 'api_error',
      message: '1 field has issues',
      httpStatus: 422,
      fieldErrors: [
        {
          field: 'zip',
          category: 'invalid_attribute_value',
          message: 'Zip code is invalid',
        },
      ],
    }

    const wrapper = createWrapper({
      error: sdkError,
      formErrors: { zip: { message: 'SOME_UNHANDLED_CODE' } },
    })

    const { result } = renderHook(
      () =>
        useFieldErrorMessage('zip', {
          REQUIRED: 'Zip is required',
        }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current).toBe('Zip code is invalid')
    })
  })

  it('returns undefined when field has no errors from either source', () => {
    const sdkError: SDKError = {
      category: 'api_error',
      message: '1 field has issues',
      httpStatus: 422,
      fieldErrors: [
        {
          field: 'street1',
          category: 'invalid_attribute_value',
          message: 'Street has an issue',
        },
      ],
    }

    const wrapper = createWrapper({ error: sdkError })

    const { result } = renderHook(
      () => useFieldErrorMessage('zip', { REQUIRED: 'Zip is required' }),
      { wrapper },
    )

    expect(result.current).toBeUndefined()
  })
})
