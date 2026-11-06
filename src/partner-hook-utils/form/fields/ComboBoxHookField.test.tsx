import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode, useEffect } from 'react'
import { FormFieldsMetadataProvider } from '../FormFieldsMetadataProvider'
import type { FieldMetadataWithOptions } from '../../types'
import { ComboBoxHookField } from './ComboBoxHookField'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

type TestFormValues = { state: string }

function TestWrapper({
  children,
  metadata = {},
  formErrors = {},
  defaultValue = '',
}: {
  children: ReactNode
  metadata?: Record<string, FieldMetadataWithOptions>
  formErrors?: Partial<Record<keyof TestFormValues, { message: string }>>
  defaultValue?: string
}) {
  const formMethods = useForm<TestFormValues>({
    defaultValues: { state: defaultValue },
  })

  useEffect(() => {
    for (const [field, err] of Object.entries(formErrors)) {
      formMethods.setError(field as keyof TestFormValues, err)
    }
  }, [formMethods, formErrors])

  return (
    <FormFieldsMetadataProvider metadata={metadata} errors={[]}>
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

describe('ComboBoxHookField', () => {
  it('renders the label and displays the selected option label for the form value', async () => {
    renderWithProviders(
      <TestWrapper metadata={{ state: stateMetadata }} defaultValue="NY">
        <ComboBoxHookField
          name="state"
          label="State"
          placeholder="Select state"
          validationMessages={{ REQUIRED: 'Please select a state' }}
        />
      </TestWrapper>,
    )

    expect(screen.getByText('State')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('New York')).toBeInTheDocument()
  })

  it('displays resolved error message from validation code', () => {
    renderWithProviders(
      <TestWrapper
        metadata={{ state: stateMetadata }}
        formErrors={{ state: { message: 'REQUIRED' } }}
      >
        <ComboBoxHookField
          name="state"
          label="State"
          placeholder="Select state"
          validationMessages={{ REQUIRED: 'Please select a state' }}
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Please select a state')).toBeInTheDocument()
  })

  it('uses getOptionLabel to override option labels from entries', async () => {
    renderWithProviders(
      <TestWrapper metadata={{ state: stateMetadata }} defaultValue="NY">
        <ComboBoxHookField
          name="state"
          label="State"
          placeholder="Select state"
          validationMessages={{ REQUIRED: 'Required' }}
          getOptionLabel={(entry: { code: string; fullName: string }) =>
            `${entry.fullName} (${entry.code})`
          }
        />
      </TestWrapper>,
    )

    expect(await screen.findByDisplayValue('New York (NY)')).toBeInTheDocument()
  })

  it('renders an empty input when the form value matches no supplied option', async () => {
    renderWithProviders(
      <TestWrapper metadata={{ state: stateMetadata }} defaultValue="TX">
        <ComboBoxHookField
          name="state"
          label="State"
          placeholder="Select state"
          validationMessages={{ REQUIRED: 'Required' }}
        />
      </TestWrapper>,
    )

    // The control matches on option value, so hooks must supply an option for
    // whatever value they place in the form -- see ComboBoxHookFieldProps remarks.
    expect(await screen.findByPlaceholderText('Select state')).toHaveValue('')
  })
})
