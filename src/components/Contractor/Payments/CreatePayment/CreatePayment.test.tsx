import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { CreatePayment } from './CreatePayment'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { handlePreviewContractorPaymentGroup } from '@/test/mocks/apis/contractor_payment_groups'

const COMPANY_ID = 'company-123'

/**
 * Contractor fixtures use snake_case wire shape (matches other mock handlers).
 * The list endpoint filters to isActive + onboarding_completed contractors.
 */
const hourlyContractor = {
  uuid: 'contractor-hourly',
  company_uuid: COMPANY_ID,
  wage_type: 'Hourly',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  hourly_rate: '50.00',
  payment_method: 'Direct Deposit',
}

const fixedContractor = {
  uuid: 'contractor-fixed',
  company_uuid: COMPANY_ID,
  wage_type: 'Fixed',
  type: 'Individual',
  first_name: 'Grace',
  last_name: 'Hopper',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  payment_method: 'Direct Deposit',
}

const checkContractor = {
  uuid: 'contractor-check',
  company_uuid: COMPANY_ID,
  wage_type: 'Fixed',
  type: 'Individual',
  first_name: 'Alan',
  last_name: 'Turing',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  payment_method: 'Check',
}

const paymentConfigsMock = http.get(
  `${API_BASE_URL}/v1/companies/:company_uuid/payment_configs`,
  () => HttpResponse.json({ payment_speed: '2-day', fast_payment_limit: 5000000 }),
)

const listContractors = (contractors: Array<Record<string, unknown>>) =>
  handleGetContractorsList(() =>
    HttpResponse.json(contractors, {
      headers: { 'x-total-pages': '1', 'x-total-count': String(contractors.length) },
    }),
  )

const renderCreatePayment = (contractors: Array<Record<string, unknown>>, onEvent = vi.fn()) => {
  server.use(listContractors(contractors), paymentConfigsMock)
  renderWithProviders(<CreatePayment companyId={COMPANY_ID} onEvent={onEvent} />)
  return { onEvent }
}

/** Opens the edit modal for the contractor at `rowIndex` via its hamburger menu. */
const openEditModal = async (user: ReturnType<typeof userEvent.setup>, rowIndex = 0) => {
  await waitFor(() => {
    expect(
      screen.getAllByRole('button', { name: 'Edit contractor payment' }).length,
    ).toBeGreaterThan(rowIndex)
  })
  const triggers = screen.getAllByRole('button', { name: 'Edit contractor payment' })
  await user.click(triggers[rowIndex]!)
  const editItem = await screen.findByRole('menuitem', { name: 'Edit contractor payment' })
  await user.click(editItem)
  await screen.findByRole('heading', { name: 'Edit contractor pay' })
}

const saveEditModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Done' }))
}

/** The open edit modal's content region (labels collide with the table headers otherwise). */
const getModal = (): HTMLElement => {
  const heading = screen.getByRole('heading', { name: 'Edit contractor pay' })
  const modal = heading.closest('form')?.parentElement ?? heading.closest('[role]')
  return (modal as HTMLElement | null) ?? document.body
}

/**
 * Currency-formatted NumberInputFields deliberately blank their `aria-labelledby`
 * to avoid double-reading the label, so `getByLabelText` can't find them.
 * Resolve the input through the visible label's `for` -> input `id` association,
 * scoped to the open modal so it doesn't collide with the table column headers.
 */
const getMoneyInput = (labelText: string): HTMLInputElement => {
  const label = within(getModal()).getByText(labelText).closest('label') as HTMLLabelElement | null
  const inputId = label?.getAttribute('for')
  const input = inputId ? document.getElementById(inputId) : null
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Could not resolve money input for label "${labelText}"`)
  }
  return input
}

/** The DataView totals footer row (the one containing the "Totals" label). */
const getTotalsRow = (): HTMLElement => {
  const totalsCell = screen.getByText('Totals')
  const row = totalsCell.closest('[role="row"]') as HTMLElement | null
  if (!row) throw new Error('Could not find totals footer row')
  return row
}

describe('CreatePayment', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('default render', () => {
    it('renders the table with contractors, headers, and the continue button', async () => {
      renderCreatePayment([hourlyContractor, fixedContractor])

      expect(await screen.findByRole('heading', { name: 'Pay contractors' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
      expect(screen.getByText('Payment date')).toBeInTheDocument()
    })

    it('shows the empty state when no eligible contractors exist', async () => {
      renderCreatePayment([])

      expect(await screen.findByText('No contractors available for payment')).toBeInTheDocument()
    })
  })

  describe('edit modal initial values', () => {
    it('opens the modal with the hourly fields for an hourly contractor', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor])
      await openEditModal(user)

      expect(screen.getByLabelText('Hours')).toBeInTheDocument()
      expect(within(getModal()).getByText('Bonus')).toBeInTheDocument()
      expect(within(getModal()).getByText('Reimbursement')).toBeInTheDocument()
    })

    it('opens the modal with the fixed-amount field for a fixed contractor', async () => {
      const user = userEvent.setup()
      renderCreatePayment([fixedContractor])
      await openEditModal(user)

      expect(within(getModal()).getByText('Fixed amount')).toBeInTheDocument()
      expect(within(getModal()).getByText('Reimbursement')).toBeInTheDocument()
    })

    it('fires CONTRACTOR_PAYMENT_EDIT when the edit modal opens', async () => {
      const user = userEvent.setup()
      const { onEvent } = renderCreatePayment([hourlyContractor])
      await openEditModal(user)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_EDIT)
    })
  })

  describe('isTouched / line-item state', () => {
    it('leaves a contractor untouched when all amounts stay at zero', async () => {
      const user = userEvent.setup()
      const { onEvent } = renderCreatePayment([hourlyContractor])
      await openEditModal(user)
      await saveEditModal(user)

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })

      const updateCall = onEvent.mock.calls.find(
        ([event]) => event === componentEvents.CONTRACTOR_PAYMENT_UPDATE,
      )
      expect(updateCall?.[1]).toMatchObject({
        contractorUuid: 'contractor-hourly',
        hours: 0,
        bonus: 0,
        reimbursement: 0,
      })
    })

    it('marks a contractor touched once any amount is above zero', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor])
      await openEditModal(user)

      await user.type(getMoneyInput('Bonus'), '100')
      await saveEditModal(user)

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })

      expect(screen.getByText('Pay updated for Ada Lovelace')).toBeInTheDocument()
    })
  })

  describe('totals calculation', () => {
    it('multiplies hours by the hourly rate into the total for an hourly contractor', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor])
      await openEditModal(user)

      await user.type(screen.getByLabelText('Hours'), '10')
      await saveEditModal(user)

      // 10 hours x $50/hr = $500 in the totals footer
      await waitFor(() => {
        expect(within(getTotalsRow()).getByText('$500.00')).toBeInTheDocument()
      })
    })

    it('adds the fixed wage amount into the total for a fixed contractor', async () => {
      const user = userEvent.setup()
      renderCreatePayment([fixedContractor])
      await openEditModal(user)

      await user.type(getMoneyInput('Fixed amount'), '750')
      await saveEditModal(user)

      // Fixed wage contributes to both the wage column total and the grand total
      await waitFor(() => {
        expect(within(getTotalsRow()).getAllByText('$750.00').length).toBeGreaterThanOrEqual(2)
      })
    })

    it('accumulates totals across multiple contractors', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor, fixedContractor])

      // Hourly (row 0): 4 hours x $50 = $200
      await openEditModal(user, 0)
      await user.type(screen.getByLabelText('Hours'), '4')
      await saveEditModal(user)
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })

      // Fixed (row 1): $300
      await openEditModal(user, 1)
      await user.type(getMoneyInput('Fixed amount'), '300')
      await saveEditModal(user)

      // Grand total $500 shows in the footer's last cell
      await waitFor(() => {
        expect(within(getTotalsRow()).getByText('$500.00')).toBeInTheDocument()
      })
    })
  })

  describe('successful edit submission', () => {
    it('closes the modal, shows a success alert, and fires CONTRACTOR_PAYMENT_UPDATE', async () => {
      const user = userEvent.setup()
      const { onEvent } = renderCreatePayment([hourlyContractor])
      await openEditModal(user)

      await user.type(screen.getByLabelText('Hours'), '8')
      await user.type(getMoneyInput('Bonus'), '25')
      await saveEditModal(user)

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })
      expect(screen.getByText('Pay updated for Ada Lovelace')).toBeInTheDocument()

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_PAYMENT_UPDATE,
        expect.objectContaining({
          contractorUuid: 'contractor-hourly',
          hours: 8,
          bonus: 25,
          paymentMethod: 'Direct Deposit',
        }),
      )
    })

    it('dismisses the success alert when its dismiss control is used', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor])
      await openEditModal(user)
      await user.type(getMoneyInput('Bonus'), '100')
      await saveEditModal(user)

      await screen.findByText('Pay updated for Ada Lovelace')
      await user.click(screen.getByRole('button', { name: 'Dismiss alert' }))

      await waitFor(() => {
        expect(screen.queryByText('Pay updated for Ada Lovelace')).not.toBeInTheDocument()
      })
    })
  })

  describe('allowedPaymentMethods gating', () => {
    it('disables Direct Deposit for a contractor whose payment method is Check', async () => {
      const user = userEvent.setup()
      renderCreatePayment([checkContractor])
      await openEditModal(user)

      const directDeposit = screen.getByRole('radio', { name: 'Direct deposit' })
      expect(directDeposit).toBeDisabled()
    })

    it('enables Direct Deposit for a contractor whose payment method is Direct Deposit', async () => {
      const user = userEvent.setup()
      renderCreatePayment([fixedContractor])
      await openEditModal(user)

      const directDeposit = screen.getByRole('radio', { name: 'Direct deposit' })
      expect(directDeposit).toBeEnabled()
    })
  })

  describe('modal round-trip', () => {
    it('pre-populates saved amounts when the same contractor is re-opened', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor])

      // First open: enter 8 hours and a $25 bonus, save
      await openEditModal(user)
      await user.type(screen.getByLabelText('Hours'), '8')
      await user.type(getMoneyInput('Bonus'), '25')
      await saveEditModal(user)

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })

      // Re-open the same contractor
      await openEditModal(user)

      expect(screen.getByLabelText('Hours')).toHaveValue('8')
      expect(getMoneyInput('Bonus')).toHaveValue('25.00')
    })
  })

  describe('continue to preview', () => {
    it('shows an error alert when no contractors are touched', async () => {
      const user = userEvent.setup()
      renderCreatePayment([hourlyContractor])

      await screen.findByRole('heading', { name: 'Pay contractors' })
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(
        await screen.findByText('Please add at least one contractor payment to continue.'),
      ).toBeInTheDocument()
    })

    it('previews only touched contractors and fires CONTRACTOR_PAYMENT_PREVIEW', async () => {
      const user = userEvent.setup()

      let previewBody: { contractor_payments?: Array<Record<string, unknown>> } | null = null
      const previewResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        previewBody = (await request.json()) as {
          contractor_payments?: Array<Record<string, unknown>>
        }
        return HttpResponse.json({
          check_date: '2025-01-30',
          creation_token: 'preview-token-123',
          debit_date: '2025-01-28',
          contractor_payments: (previewBody.contractor_payments ?? []).map((p, i) => ({
            ...p,
            uuid: `preview-${i}`,
            wage_total: '400.00',
          })),
          submission_blockers: [],
          totals: { amount: '400.00', debit_amount: '400.00' },
        })
      })

      const { onEvent } = renderCreatePayment([hourlyContractor, fixedContractor])
      server.use(handlePreviewContractorPaymentGroup(previewResolver))

      // Touch only the hourly contractor
      await openEditModal(user)
      await user.type(screen.getByLabelText('Hours'), '8')
      await saveEditModal(user)
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(previewResolver).toHaveBeenCalledTimes(1)
      })
      expect(previewBody!.contractor_payments).toHaveLength(1)
      expect(previewBody!.contractor_payments![0]).toMatchObject({
        contractor_uuid: 'contractor-hourly',
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.CONTRACTOR_PAYMENT_PREVIEW,
          expect.objectContaining({ creationToken: 'preview-token-123' }),
        )
      })
    })
  })

  describe('back to edit', () => {
    it('fires CONTRACTOR_PAYMENT_BACK_TO_EDIT when returning from preview', async () => {
      const user = userEvent.setup()

      const previewResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          check_date: '2025-01-30',
          creation_token: 'preview-token-123',
          debit_date: '2025-01-28',
          contractor_payments: [
            {
              uuid: 'preview-0',
              contractor_uuid: 'contractor-hourly',
              wage_type: 'Hourly',
              hourly_rate: '50.00',
              hours: '8.00',
              wage_total: '400.00',
              payment_method: 'Direct Deposit',
            },
          ],
          submission_blockers: [],
          totals: { amount: '400.00', debit_amount: '400.00' },
        }),
      )

      const { onEvent } = renderCreatePayment([hourlyContractor])
      server.use(handlePreviewContractorPaymentGroup(previewResolver))

      await openEditModal(user)
      await user.type(screen.getByLabelText('Hours'), '8')
      await saveEditModal(user)
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: 'Edit contractor pay' }),
        ).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      const editButton = await screen.findByRole('button', { name: 'Edit' })
      await user.click(editButton)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_BACK_TO_EDIT)
    })
  })
})
