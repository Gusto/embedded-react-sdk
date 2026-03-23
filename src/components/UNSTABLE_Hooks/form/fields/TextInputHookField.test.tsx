import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode, useEffect } from 'react'
import { FormFieldsMetadataProvider } from '../FormFieldsMetadataProvider'
import type { FieldMetadata } from '../types'
import { TextInputHookField } from './TextInputHookField'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

type TestFormValues = { street1: string }

function TestWrapper({
  children,
  metadata = {},
  formErrors = {},
}: {
  children: ReactNode
  metadata?: Record<string, FieldMetadata>
  formErrors?: Partial<Record<keyof TestFormValues, { message: string }>>
}) {
  const formMethods = useForm<TestFormValues>({
    defaultValues: { street1: '' },
  })

  useEffect(() => {
    for (const [field, err] of Object.entries(formErrors)) {
      formMethods.setError(field as keyof TestFormValues, err)
    }
  }, [formMethods, formErrors])

  return (
    <FormFieldsMetadataProvider metadata={metadata} error={null}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}

describe('TextInputHookField', () => {
  it('renders with label and reads isRequired from metadata', () => {
    renderWithProviders(
      <TestWrapper metadata={{ street1: { name: 'street1', isRequired: true } }}>
        <TextInputHookField
          name="street1"
          label="Street Address"
          validationMessages={{ REQUIRED: 'Street is required' }}
        />
      </TestWrapper>,
    )

    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
  })

  it('displays resolved error message from validation code', () => {
    renderWithProviders(
      <TestWrapper
        metadata={{ street1: { name: 'street1', isRequired: true } }}
        formErrors={{ street1: { message: 'REQUIRED' } }}
      >
        <TextInputHookField
          name="street1"
          label="Street Address"
          validationMessages={{ REQUIRED: 'Street is required' }}
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Street is required')).toBeInTheDocument()
  })

  it('renders custom FieldComponent when provided', () => {
    const CustomField = vi.fn(() => <div data-testid="custom-field" />)

    renderWithProviders(
      <TestWrapper metadata={{ street1: { name: 'street1' } }}>
        <TextInputHookField
          name="street1"
          label="Street Address"
          validationMessages={{ REQUIRED: 'Street is required' }}
          FieldComponent={CustomField}
        />
      </TestWrapper>,
    )

    expect(screen.getByTestId('custom-field')).toBeInTheDocument()
    expect(CustomField).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'street1',
        label: 'Street Address',
      }),
      undefined,
    )
  })
})
