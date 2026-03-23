import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode, useEffect } from 'react'
import { FormFieldsMetadataProvider } from '../FormFieldsMetadataProvider'
import type { FieldMetadataWithOptions } from '../types'
import { SelectHookField } from './SelectHookField'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

type TestFormValues = { state: string }

function TestWrapper({
  children,
  metadata = {},
  formErrors = {},
}: {
  children: ReactNode
  metadata?: Record<string, FieldMetadataWithOptions>
  formErrors?: Partial<Record<keyof TestFormValues, { message: string }>>
}) {
  const formMethods = useForm<TestFormValues>({
    defaultValues: { state: '' },
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

const stateMetadata: FieldMetadataWithOptions<{ code: string; fullName: string }> = {
  name: 'state',
  isRequired: true,
  options: [
    { label: 'California', value: 'CA' },
    { label: 'New York', value: 'NY' },
  ],
  entries: [
    { code: 'CA', fullName: 'California' },
    { code: 'NY', fullName: 'New York' },
  ],
}

describe('SelectHookField', () => {
  it('renders with label and options from metadata', () => {
    renderWithProviders(
      <TestWrapper metadata={{ state: stateMetadata }}>
        <SelectHookField
          name="state"
          label="State"
          validationMessages={{ REQUIRED: 'Please select a state' }}
        />
      </TestWrapper>,
    )

    expect(screen.getByText('State')).toBeInTheDocument()
  })

  it('displays resolved error message from validation code', () => {
    renderWithProviders(
      <TestWrapper
        metadata={{ state: stateMetadata }}
        formErrors={{ state: { message: 'REQUIRED' } }}
      >
        <SelectHookField
          name="state"
          label="State"
          validationMessages={{ REQUIRED: 'Please select a state' }}
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Please select a state')).toBeInTheDocument()
  })

  it('uses getOptionLabel to override option labels from entries', () => {
    const CustomField = vi.fn(() => <div data-testid="custom-select" />)

    renderWithProviders(
      <TestWrapper metadata={{ state: stateMetadata }}>
        <SelectHookField
          name="state"
          label="State"
          validationMessages={{ REQUIRED: 'Required' }}
          getOptionLabel={(entry: { code: string; fullName: string }) =>
            `${entry.fullName} (${entry.code})`
          }
          FieldComponent={CustomField}
        />
      </TestWrapper>,
    )

    expect(CustomField).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { value: 'CA', label: 'California (CA)' },
          { value: 'NY', label: 'New York (NY)' },
        ],
      }),
      undefined,
    )
  })

  it('renders custom FieldComponent when provided', () => {
    const CustomField = vi.fn(() => <div data-testid="custom-select" />)

    renderWithProviders(
      <TestWrapper metadata={{ state: stateMetadata }}>
        <SelectHookField
          name="state"
          label="State"
          validationMessages={{ REQUIRED: 'Required' }}
          FieldComponent={CustomField}
        />
      </TestWrapper>,
    )

    expect(screen.getByTestId('custom-select')).toBeInTheDocument()
    expect(CustomField).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'state',
        label: 'State',
        isRequired: true,
      }),
      undefined,
    )
  })
})
