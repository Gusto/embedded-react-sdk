import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaymentMethod } from './PaymentMethod'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import {
  getEmptyEmployeeBankAccounts,
  getEmptyEmployeePaymentMethod,
} from '@/test/mocks/apis/employeesBankAccounts'
import { API_BASE_URL } from '@/test/constants'

const TWO_BANK_ACCOUNTS = [
  {
    uuid: 'bank-1',
    employee_uuid: 'employee-123',
    account_type: 'Checking',
    name: 'Chase',
    routing_number: '011401533',
    hidden_account_number: 'XXXX0000',
  },
  {
    uuid: 'bank-2',
    employee_uuid: 'employee-123',
    account_type: 'Savings',
    name: 'Wells Fargo',
    routing_number: '121000248',
    hidden_account_number: 'XXXX1111',
  },
]

const PERCENTAGE_PAYMENT_METHOD_TWO_SPLITS = {
  version: 'ad88c4e3c40f122582e425030d5c2771',
  type: 'Direct Deposit',
  split_by: 'Percentage',
  splits: [
    {
      uuid: 'bank-1',
      name: 'Chase',
      hidden_account_number: 'XXXX0000',
      priority: 1,
      split_amount: 60,
    },
    {
      uuid: 'bank-2',
      name: 'Wells Fargo',
      hidden_account_number: 'XXXX1111',
      priority: 2,
      split_amount: 40,
    },
  ],
}

const mockTwoBankAccounts = () => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
      HttpResponse.json(TWO_BANK_ACCOUNTS),
    ),
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
      HttpResponse.json(PERCENTAGE_PAYMENT_METHOD_TWO_SPLITS),
    ),
  )
}

describe('PaymentMethod onboarding ListView', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders payment method type selector and bank accounts', async () => {
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /direct deposit/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('radio', { name: /check/i })).toBeInTheDocument()
    expect(screen.getByText('Chase')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('shows Add another bank account button in footer when direct deposit is selected with accounts', async () => {
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /direct deposit/i })).toBeChecked()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('button', { name: /add another bank account/i })).toBeInTheDocument()
  })

  it('hides DataView, Add another, and Split paycheck when Check is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByText('Chase')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('radio', { name: 'Check' }))

    expect(screen.queryByText('Chase')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add.*bank account/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /split paycheck/i })).not.toBeInTheDocument()
  })

  it('navigates to standalone BankForm when Add another bank account is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: /add another bank account/i }),
        ).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: /add another bank account/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
    })
  })

  it('fires EMPLOYEE_PAYMENT_METHOD_UPDATED and EMPLOYEE_PAYMENT_METHOD_DONE when Continue is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      const firedTypes = onEvent.mock.calls.map(([type]) => type)
      expect(firedTypes).toContain(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED)
      expect(firedTypes).toContain(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
    })
  })

  it('does not show Add bank account button when no accounts exist and payment method is Check', async () => {
    server.use(getEmptyEmployeeBankAccounts, getEmptyEmployeePaymentMethod)

    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /direct deposit/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.queryByRole('button', { name: /add.*bank account/i })).not.toBeInTheDocument()
  })

  describe('Inline bank form (Direct Deposit, no accounts)', () => {
    beforeEach(() => {
      server.use(
        getEmptyEmployeeBankAccounts,
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
          HttpResponse.json({
            version: 'ad88c4e3c40f122582e425030d5c2771',
            type: 'Direct Deposit',
          }),
        ),
      )
    })

    it('shows bank form fields immediately when Direct Deposit is selected with no accounts', async () => {
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.getByLabelText('Routing number')).toBeInTheDocument()
      expect(screen.getByLabelText('Account number')).toBeInTheDocument()
    })

    it('does not show a Cancel button on the inline bank form', async () => {
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })

    it('hides Continue button while in inline bank form mode', async () => {
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
    })

    it('switching to Check dismisses inline bank form and shows Continue', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Use exact name to avoid matching "Checking" in the account type radio group
      await user.click(screen.getByRole('radio', { name: 'Check' }))

      expect(screen.queryByLabelText('Account nickname')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('shows required-field errors when submitting empty inline bank form', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Account name is required')).toBeInTheDocument()
      })
      expect(screen.getByText('Routing number should be a number (9 digits)')).toBeInTheDocument()
      expect(screen.getByText('Account number is a required field')).toBeInTheDocument()
    })
  })

  describe('BankForm validation (standalone form via Add another)', () => {
    it('shows required-field errors when submitting an empty bank form', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /add another bank account/i }),
          ).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: /add another bank account/i }))
      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Account name is required')).toBeInTheDocument()
      })
      expect(screen.getByText('Routing number should be a number (9 digits)')).toBeInTheDocument()
      expect(screen.getByText('Account number is a required field')).toBeInTheDocument()
    })

    it('shows format errors when routing/account numbers are not 9 digits', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /add another bank account/i }),
          ).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: /add another bank account/i }))
      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Account nickname'), 'Test Account')
      await user.type(screen.getByLabelText('Routing number'), '123')
      await user.type(screen.getByLabelText('Account number'), 'abc')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Routing number should be a number (9 digits)')).toBeInTheDocument()
      })
      expect(
        screen.getByText('Account number should contain only digits (up to 17)'),
      ).toBeInTheDocument()
    })

    it('returns to list view when Cancel is clicked from standalone BankForm', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /add another bank account/i }),
          ).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: /add another bank account/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.getByText('Chase')).toBeInTheDocument()
      })
      expect(screen.queryByLabelText('Account nickname')).not.toBeInTheDocument()
    })
  })

  describe('Split paycheck button visibility', () => {
    it('hides Split paycheck button when fewer than 2 bank accounts exist', async () => {
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.queryByRole('button', { name: /split paycheck/i })).not.toBeInTheDocument()
    })

    it('shows Split paycheck button in footer when 2+ bank accounts exist', async () => {
      mockTwoBankAccounts()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
    })
  })

  describe('SplitView', () => {
    it('renders percentage fields for each bank account in default Percentage mode', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: /split paycheck/i }))

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: 'Percentage' })).toBeInTheDocument()
      })
      expect(screen.getByRole('radio', { name: 'Percentage' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'Fixed amount' })).toBeInTheDocument()
      expect(screen.getByLabelText(/Chase \(XXXX0000\)/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Wells Fargo \(XXXX1111\)/)).toBeInTheDocument()
    })

    it('fires EMPLOYEE_PAYMENT_METHOD_UPDATED when percentages sum to 100', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      await user.click(screen.getByRole('button', { name: /split paycheck/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/Chase \(XXXX0000\)/)).toBeInTheDocument()
      })

      // Defaults from fixture already total 100 (60 + 40); just submit.
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED,
          expect.any(Object),
        )
      })
    })

    it('shows the total-mismatch alert and blocks submit when percentages do not sum to 100', async () => {
      const user = userEvent.setup()
      const TOTAL_70_PAYMENT_METHOD = {
        version: 'v1',
        type: 'Direct Deposit',
        split_by: 'Percentage',
        splits: [
          { ...PERCENTAGE_PAYMENT_METHOD_TWO_SPLITS.splits[0], split_amount: 30 },
          { ...PERCENTAGE_PAYMENT_METHOD_TWO_SPLITS.splits[1], split_amount: 40 },
        ],
      }
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
          HttpResponse.json(TWO_BANK_ACCOUNTS),
        ),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
          HttpResponse.json(TOTAL_70_PAYMENT_METHOD),
        ),
      )

      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      await user.click(screen.getByRole('button', { name: /split paycheck/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      // Defaults from fixture (30 + 40 = 70) are preserved on mount thanks to the
      // post-migration fix to the splitBy-reset effect. Submitting surfaces the
      // alert at the correct path (errors.splitAmount, not errors.splitAmount.root).
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText(/splits must total 100%.*currently 70%/i)).toBeInTheDocument()
      })
      expect(onEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED,
        expect.anything(),
      )
    })

    it('switches to Fixed amount mode and renders the reorderable list', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      await user.click(screen.getByRole('button', { name: /split paycheck/i }))

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: 'Fixed amount' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('radio', { name: 'Fixed amount' }))

      await waitFor(() => {
        expect(
          screen.getByRole('list', { name: 'Reorderable list of bank accounts' }),
        ).toBeInTheDocument()
      })
      const list = screen.getByRole('list', { name: 'Reorderable list of bank accounts' })
      expect(within(list).getByLabelText(/Chase \(XXXX0000\)/)).toBeInTheDocument()
      expect(within(list).getByLabelText(/Wells Fargo \(XXXX1111\)/)).toBeInTheDocument()
    })

    it('returns to list view when SplitView Cancel is clicked', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      await user.click(screen.getByRole('button', { name: /split paycheck/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
      })
      expect(screen.queryByRole('radio', { name: 'Fixed amount' })).not.toBeInTheDocument()
    })
  })
})
