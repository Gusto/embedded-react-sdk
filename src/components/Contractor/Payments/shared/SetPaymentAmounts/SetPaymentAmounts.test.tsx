import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { UsePaymentAmountsEditorReturn } from '../usePaymentAmountsEditor'
import { SetPaymentAmounts } from './SetPaymentAmounts'
import type { EditContractorPaymentFormValues } from './EditContractorPaymentFormSchema'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

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

  it('applies a caller-provided dictionary override', async () => {
    renderSetPaymentAmounts({
      dictionary: { en: { hoursAndPaymentsLabel: 'Custom amounts label' } },
    })

    await waitFor(() => {
      expect(screen.getByText('Custom amounts label')).toBeInTheDocument()
    })
  })
})
