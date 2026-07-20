import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EditContractorPaymentPresentation } from './EditContractorPaymentPresentation'
import {
  createEditContractorPaymentFormSchema,
  type EditContractorPaymentFormValues,
} from './EditContractorPaymentFormSchema'
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

describe('EditContractorPaymentPresentation validation errors', () => {
  it('shows the directDepositNotAvailable translation when a Check contractor form submits with Direct Deposit', async () => {
    const user = userEvent.setup()

    const Harness = () => {
      const formMethods = useForm<EditContractorPaymentFormValues>({
        resolver: zodResolver(createEditContractorPaymentFormSchema()),
        defaultValues: {
          wageType: 'Fixed',
          paymentMethod: 'Check',
          contractorUuid: 'contractor-check',
          contractorPaymentMethod: 'Check',
        },
      })

      return (
        <>
          <button
            type="button"
            onClick={() => {
              formMethods.setValue('paymentMethod', 'Direct Deposit')
            }}
          >
            Force Direct Deposit
          </button>
          <EditContractorPaymentPresentation
            isOpen
            onClose={vi.fn()}
            onSubmit={vi.fn()}
            formMethods={formMethods}
            contractorPaymentMethod="Check"
          />
        </>
      )
    }

    renderWithProviders(<Harness />)

    await user.click(await screen.findByRole('button', { name: 'Force Direct Deposit' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Direct Deposit is not available for contractors set up for Check payments',
        ),
      ).toBeInTheDocument()
    })
  })
})

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
