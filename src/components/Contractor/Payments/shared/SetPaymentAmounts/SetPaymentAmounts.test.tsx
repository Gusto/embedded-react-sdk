import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { UsePaymentAmountsEditorReturn } from '../usePaymentAmountsEditor'
import { SetPaymentAmounts, type SetPaymentAmountsDictionary } from './SetPaymentAmounts'
import type { EditContractorPaymentFormValues } from './EditContractorPaymentFormSchema'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const dictionary: SetPaymentAmountsDictionary = {
  hoursAndPaymentsLabel: 'Hours and payments',
  contractorTableHeaders: {
    contractor: 'Contractor',
    wageType: 'Wage',
    paymentMethod: 'Payment method',
    hours: 'Hours',
    wage: 'Fixed amount',
    bonus: 'Bonus',
    reimbursement: 'Reimbursement',
    total: 'Total',
  },
  emptyTableTitle: 'No contractors available for payment',
  emptyTableDescription:
    'There are no active contractors with completed onboarding. Add and onboard contractors before creating payments.',
  na: 'N/A',
  totalsLabel: 'Totals',
  editContractor: 'Edit contractor payment',
  perHour: '/hr',
  editContractorPayment: {
    title: 'Edit contractor pay',
    subtitle:
      'Edit contractor\'s hours, additional earnings, and reimbursements. Inputs not applicable to this contractor are disabled. Please click "Done" to apply the change.',
    hoursLabel: 'Hours',
    hoursAdornment: 'hrs',
    hoursPayDescription: (rate, total) => `${rate}/hr × hours = ${total}`,
    wageLabel: 'Fixed amount',
    bonusLabel: 'Bonus',
    reimbursementLabel: 'Reimbursement',
    paymentMethodLabel: 'Payment Method',
    cancelCta: 'Cancel',
    saveCta: 'Done',
    paymentMethods: {
      check: 'Check',
      directDeposit: 'Direct deposit',
      historicalPayment: 'Historical payment',
    },
    errors: {
      directDepositNotAvailable:
        'Direct Deposit is not available for contractors set up for Check payments',
      unsupportedPaymentMethod:
        'This payment method is not supported. Please select Check or Direct Deposit.',
    },
  },
}

const contractors: Contractor[] = [
  {
    uuid: 'contractor-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    type: 'Individual',
    wageType: 'Hourly',
    hourlyRate: '50.00',
    paymentMethod: 'Direct Deposit',
    isActive: true,
    onboardingStatus: 'onboarding_completed',
  },
]

const contractorPayments: Parameters<typeof SetPaymentAmounts>[0]['contractorPayments'] = [
  {
    contractorUuid: 'contractor-1',
    paymentMethod: 'Direct Deposit',
    wage: '0',
    hours: '10',
    bonus: '0',
    reimbursement: '0',
  },
]

const totals = { wage: 0, bonus: 0, reimbursement: 0, total: 500 }

function renderSetPaymentAmounts(overrides: Partial<Parameters<typeof SetPaymentAmounts>[0]> = {}) {
  const open = vi.fn()
  const Harness = () => {
    const formMethods = useForm<EditContractorPaymentFormValues>({
      defaultValues: { wageType: 'Hourly', paymentMethod: 'Direct Deposit', contractorUuid: '' },
    })
    const editModal: UsePaymentAmountsEditorReturn['editModal'] = {
      isOpen: false,
      formMethods,
      open,
      close: vi.fn(),
      submit: vi.fn(),
    }

    return (
      <SetPaymentAmounts
        contractors={contractors}
        contractorPayments={contractorPayments}
        totals={totals}
        allowedPaymentMethods={['Check', 'Direct Deposit']}
        editModal={editModal}
        dictionary={dictionary}
        {...overrides}
      />
    )
  }

  renderWithProviders(<Harness />)
  return { open }
}

describe('SetPaymentAmounts', () => {
  it('renders contractor rows and totals', async () => {
    renderSetPaymentAmounts()

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.getAllByText('$500.00').length).toBeGreaterThan(0)
  })

  it('renders the empty state when there are no contractors', async () => {
    renderSetPaymentAmounts({ contractors: [], contractorPayments: [] })

    await waitFor(() => {
      expect(screen.getByText('No contractors available for payment')).toBeInTheDocument()
    })
  })

  it('opens the edit modal for the clicked row', async () => {
    const user = userEvent.setup()
    const { open } = renderSetPaymentAmounts()

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))

    expect(open).toHaveBeenCalledWith('contractor-1')
  })

  it('renders the caller-provided dictionary', async () => {
    renderSetPaymentAmounts({
      dictionary: { ...dictionary, hoursAndPaymentsLabel: 'Custom amounts label' },
    })

    await waitFor(() => {
      expect(screen.getByText('Custom amounts label')).toBeInTheDocument()
    })
  })
})
