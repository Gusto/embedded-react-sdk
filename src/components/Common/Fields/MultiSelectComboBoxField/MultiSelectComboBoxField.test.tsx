import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiSelectComboBoxField } from './MultiSelectComboBoxField'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

const mockOptions = [
  { label: 'Alice Johnson', value: '1', description: 'Engineering' },
  { label: 'Bob Williams', value: '2', description: 'Marketing' },
  { label: 'Carol Davis', value: '3', description: 'Sales' },
]

interface TestFormValues {
  employees: string[]
}

const TestWrapper = ({
  children,
  defaultValues = { employees: [] },
  onSubmit = vi.fn(),
}: {
  children: React.ReactNode
  defaultValues?: TestFormValues
  onSubmit?: (data: TestFormValues) => void
}) => {
  const methods = useForm<TestFormValues>({ defaultValues })
  return (
    <GustoTestProvider>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {children}
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    </GustoTestProvider>
  )
}

describe('MultiSelectComboBoxField', () => {
  it('renders within a form context', () => {
    render(
      <TestWrapper>
        <MultiSelectComboBoxField name="employees" label="Select employees" options={mockOptions} />
      </TestWrapper>,
    )
    expect(screen.getByText('Select employees')).toBeInTheDocument()
  })

  it('renders with default values', () => {
    render(
      <TestWrapper defaultValues={{ employees: ['1', '2'] }}>
        <MultiSelectComboBoxField name="employees" label="Select employees" options={mockOptions} />
      </TestWrapper>,
    )
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Williams')).toBeInTheDocument()
  })

  it('submits form with selected values', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(
      <TestWrapper defaultValues={{ employees: ['1'] }} onSubmit={handleSubmit}>
        <MultiSelectComboBoxField name="employees" label="Select employees" options={mockOptions} />
      </TestWrapper>,
    )

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ employees: ['1'] }),
        expect.anything(),
      )
    })
  })

  it('updates form state when chip is removed', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(
      <TestWrapper defaultValues={{ employees: ['1', '2'] }} onSubmit={handleSubmit}>
        <MultiSelectComboBoxField name="employees" label="Select employees" options={mockOptions} />
      </TestWrapper>,
    )

    await user.click(screen.getByLabelText('Remove Alice Johnson'))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ employees: ['2'] }),
        expect.anything(),
      )
    })
  })

  it('shows validation error when required and empty', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <MultiSelectComboBoxField
          name="employees"
          label="Select employees"
          options={mockOptions}
          isRequired
          errorMessage="At least one employee is required"
        />
      </TestWrapper>,
    )

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText('At least one employee is required')).toBeInTheDocument()
    })
  })
})
