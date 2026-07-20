import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { EditContractorPaymentPresentation } from './EditContractorPaymentPresentation'
import type { EditContractorPaymentFormValues } from './EditContractorPaymentFormSchema'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const renderPresentation = (defaultValues: Partial<EditContractorPaymentFormValues>) => {
  const Harness = () => {
    const formMethods = useForm<EditContractorPaymentFormValues>({
      defaultValues: {
        wageType: 'Hourly',
        paymentMethod: 'Check',
        contractorUuid: 'contractor-1',
        ...defaultValues,
      },
    })

    return (
      <EditContractorPaymentPresentation
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        formMethods={formMethods}
      />
    )
  }

  return renderWithProviders(<Harness />)
}

describe('EditContractorPaymentPresentation hours pay hint initialization', () => {
  it('seeds the hint from an existing hours value on first render', async () => {
    renderPresentation({ hourlyRate: 25, hours: 10 })

    await waitFor(() => {
      expect(screen.getByText(content => content.includes('$250.00'))).toBeInTheDocument()
    })
  })

  it('defaults to zero hours when the initial value is undefined', async () => {
    renderPresentation({ hourlyRate: 25, hours: undefined })

    await waitFor(() => {
      expect(screen.getByText(content => content.includes('$0.00'))).toBeInTheDocument()
    })
    expect(screen.queryByText(content => content.includes('NaN'))).toBeNull()
  })

  it('defaults to zero hours when the initial value is NaN', async () => {
    renderPresentation({ hourlyRate: 25, hours: Number.NaN })

    await waitFor(() => {
      expect(screen.getByText(content => content.includes('$0.00'))).toBeInTheDocument()
    })
    expect(screen.queryByText(content => content.includes('NaN'))).toBeNull()
  })

  it('recomputes the hint as hours are typed into the input', async () => {
    const user = userEvent.setup()
    renderPresentation({ hourlyRate: 25, hours: undefined })

    await waitFor(() => {
      expect(screen.getByText(content => content.includes('$0.00'))).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Hours'), '20')

    await waitFor(() => {
      expect(screen.getByText(content => content.includes('$500.00'))).toBeInTheDocument()
    })
  })
})
