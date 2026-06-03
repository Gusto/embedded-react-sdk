import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaymentMethod } from './PaymentMethod'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
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

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium', 'large'],
    useContainerBreakpoints: () => ['base', 'small', 'medium', 'large'],
  }
})

describe('PaymentMethod (management)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  describe('PaymentMethodCard', () => {
    it('renders the bank accounts list with fixture data', async () => {
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.getByRole('button', { name: /add another bank account/i })).toBeInTheDocument()
    })

    it('navigates to bank form when add bank account is clicked', async () => {
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
  })

  describe('BankForm', () => {
    it('renders bank account form fields when starting at add state', async () => {
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      expect(screen.getByLabelText('Routing number')).toBeInTheDocument()
      expect(screen.getByLabelText('Account number')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('creates a bank account and fires EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED', async () => {
      const user = userEvent.setup()
      // POST /v1/employees/:id/bank_accounts expects 201
      server.use(
        http.post(
          `${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`,
          async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>
            return HttpResponse.json(
              {
                uuid: 'new-account-uuid',
                employee_uuid: 'employee-123',
                account_type: body['accountType'] as string,
                name: body['name'] as string,
                routing_number: body['routingNumber'] as string,
                hidden_account_number: 'XXXX6789',
              },
              { status: 201 },
            )
          },
        ),
      )

      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Account nickname'), 'Test Account')
      await user.type(screen.getByLabelText('Routing number'), '011401533')
      await user.type(screen.getByLabelText('Account number'), '123456789')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
          expect.any(Object),
        )
      })
    })

    it('returns to list view when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })
  })

  describe('BankForm validation', () => {
    it('shows required-field errors when submitting an empty bank form', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

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

    it('shows format errors when routing number is not 9 digits', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Account nickname'), 'Test')
      await user.type(screen.getByLabelText('Routing number'), '12')
      await user.type(screen.getByLabelText('Account number'), '123456789')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Routing number should be a number (9 digits)')).toBeInTheDocument()
      })
    })
  })

  describe('SplitView', () => {
    it('renders percentage fields for each bank account when initialState is split', async () => {
      mockTwoBankAccounts()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="split" />,
      )

      await waitFor(
        () => {
          expect(screen.getByRole('radio', { name: 'Percentage' })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      expect(screen.getByRole('radio', { name: 'Percentage' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'Fixed amount' })).toBeInTheDocument()
      expect(screen.getByLabelText(/Chase \(XXXX0000\)/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Wells Fargo \(XXXX1111\)/)).toBeInTheDocument()
    })

    it('switches to Fixed amount mode and renders the reorderable list', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="split" />,
      )

      await waitFor(
        () => {
          expect(screen.getByRole('radio', { name: 'Fixed amount' })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
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

    it('fires EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED when percentage split is saved', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="split" />,
      )

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED,
          expect.any(Object),
        )
      })
    })

    it('returns to the list view when SplitView Cancel is clicked', async () => {
      const user = userEvent.setup()
      mockTwoBankAccounts()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="split" />,
      )

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.getByText('Chase')).toBeInTheDocument()
      })
      expect(screen.queryByRole('radio', { name: 'Fixed amount' })).not.toBeInTheDocument()
    })
  })

  describe('delete bank account', () => {
    it('shows delete dialog and fires EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED on confirm', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: 'Bank account actions' }))
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED,
          expect.anything(),
        )
      })
    })

    it('closes delete dialog without deleting when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: 'Bank account actions' }))
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      expect(onEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED,
        expect.anything(),
      )
    })
  })
})
