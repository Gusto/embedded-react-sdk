import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Garnishment } from '@gusto/embedded-api-v-2026-06-15/models/components/garnishment'
import type { UseDeductionsListReady } from '../../shared/useDeductionsList'
import { DeductionsList } from './DeductionsList'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const buildDeduction = (uuid: string, description: string): Garnishment => ({
  uuid,
  version: `version-${uuid}`,
  active: true,
  amount: '100',
  description,
  recurring: true,
  deductAsPercentage: false,
  courtOrdered: false,
  times: null,
  annualMaximum: null,
  payPeriodMaximum: null,
  totalAmount: null,
})

const buildReady = (
  deductions: Garnishment[],
  overrides: Partial<UseDeductionsListReady> = {},
): UseDeductionsListReady => ({
  isLoading: false,
  data: { deductions },
  status: {
    isFetching: false,
    isPending: false,
    deletingGarnishmentUuid: undefined,
  },
  actions: { onDelete: vi.fn() },
  errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
  ...overrides,
})

describe('DeductionsList', () => {
  const user = userEvent.setup()

  it('renders the table headers + the "Add another" and "Continue" buttons', async () => {
    renderWithProviders(
      <DeductionsList
        deductionsList={buildReady([buildDeduction('1', 'Health Insurance')])}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    await screen.findByText('Deduction')
    expect(screen.getByText('Frequency')).toBeInTheDocument()
    expect(screen.getByText('Withheld')).toBeInTheDocument()
    expect(screen.getByText('Add another deduction')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('invokes onAdd when "Add another deduction" is clicked', async () => {
    const onAdd = vi.fn()
    renderWithProviders(
      <DeductionsList
        deductionsList={buildReady([buildDeduction('1', 'Health Insurance')])}
        onAdd={onAdd}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    await user.click(await screen.findByText('Add another deduction'))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('shows the dollar cap instead of "0%" for a percentage garnishment saved with only a payPeriodMaximum (SDK-945)', async () => {
    const childSupport: Garnishment = {
      ...buildDeduction('cs-1', 'Child Support'),
      deductAsPercentage: true,
      amount: '0',
      payPeriodMaximum: '300',
      recurring: true,
    }
    renderWithProviders(
      <DeductionsList
        deductionsList={buildReady([childSupport])}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    await screen.findByText('Child Support')
    // The fixed dollar cap the user entered is shown...
    expect(screen.getByText(/300/)).toBeInTheDocument()
    // ...and the misleading "0%" label is gone (the named behavior under test).
    expect(screen.queryByText(/0\s*%/)).toBeNull()
  })

  it('invokes onContinue when "Continue" is clicked', async () => {
    const onContinue = vi.fn()
    renderWithProviders(
      <DeductionsList
        deductionsList={buildReady([])}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onContinue={onContinue}
      />,
    )

    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('renders an empty state with an "Add deduction" button when no deductions exist', async () => {
    const onAdd = vi.fn()
    renderWithProviders(
      <DeductionsList
        deductionsList={buildReady([])}
        onAdd={onAdd}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    await screen.findByText("You haven't added any deductions yet")
    await user.click(screen.getByRole('button', { name: 'Add deduction' }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  // Row-action coverage (Edit / Delete via the HamburgerMenu) is locked down
  // in useDeductionsList.test.tsx, which exercises the underlying mutation and
  // the DELETED vs DELETED_EMPTY branching directly. The react-aria Popover
  // does not open reliably in jsdom (see Common/UI/Menu/Menu.test.tsx), so
  // testing the menuitem clicks here would be flaky.
})
