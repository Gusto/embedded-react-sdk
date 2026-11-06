import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { type ReactNode } from 'react'
import { FormFieldsMetadataProvider } from '../FormFieldsMetadataProvider'
import type { FieldMetadataWithOptions } from '../../types'
import { RadioGroupHookField } from './RadioGroupHookField'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

type TestFormValues = { wageType: string }

function TestWrapper({
  children,
  metadata = {},
}: {
  children: ReactNode
  metadata?: Record<string, FieldMetadataWithOptions>
}) {
  const formMethods = useForm<TestFormValues>({ defaultValues: { wageType: 'Fixed' } })

  return (
    <FormFieldsMetadataProvider metadata={metadata} errors={[]}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}

const wageTypeMetadata: FieldMetadataWithOptions<string> = {
  name: 'wageType',
  isRequired: true,
  options: [
    { label: 'Fixed', value: 'Fixed' },
    { label: 'Hourly', value: 'Hourly' },
  ],
  entries: ['Fixed', 'Hourly'],
}

describe('RadioGroupHookField', () => {
  it('renders a description under each option from getOptionDescription', () => {
    renderWithProviders(
      <TestWrapper metadata={{ wageType: wageTypeMetadata }}>
        <RadioGroupHookField
          name="wageType"
          label="Wage type"
          getOptionDescription={value =>
            value === 'Hourly' ? 'Pay based on hours worked.' : 'Pay a fixed amount.'
          }
        />
      </TestWrapper>,
    )

    expect(screen.getByRole('radio', { name: /Hourly/ })).toHaveAccessibleDescription(
      'Pay based on hours worked.',
    )
    expect(screen.getByRole('radio', { name: /Fixed/ })).toHaveAccessibleDescription(
      'Pay a fixed amount.',
    )
  })

  it('applies getOptionLabel and getOptionDescription together', () => {
    const CustomField = vi.fn(() => <div data-testid="custom-radio" />)

    renderWithProviders(
      <TestWrapper metadata={{ wageType: wageTypeMetadata }}>
        <RadioGroupHookField
          name="wageType"
          label="Wage type"
          getOptionLabel={value => `${value} pay`}
          getOptionDescription={value => `How ${value} works`}
          FieldComponent={CustomField}
        />
      </TestWrapper>,
    )

    expect(CustomField).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { value: 'Fixed', label: 'Fixed pay', description: 'How Fixed works' },
          { value: 'Hourly', label: 'Hourly pay', description: 'How Hourly works' },
        ],
      }),
      undefined,
    )
  })

  it('keeps the hook-provided labels when only getOptionDescription is supplied', () => {
    const CustomField = vi.fn(() => <div data-testid="custom-radio" />)

    renderWithProviders(
      <TestWrapper metadata={{ wageType: wageTypeMetadata }}>
        <RadioGroupHookField
          name="wageType"
          label="Wage type"
          getOptionDescription={value => `How ${value} works`}
          FieldComponent={CustomField}
        />
      </TestWrapper>,
    )

    expect(CustomField).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { value: 'Fixed', label: 'Fixed', description: 'How Fixed works' },
          { value: 'Hourly', label: 'Hourly', description: 'How Hourly works' },
        ],
      }),
      undefined,
    )
  })
})
