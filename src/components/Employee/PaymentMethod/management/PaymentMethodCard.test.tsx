import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaymentMethodCard } from './PaymentMethodCard'
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

const mockCheckPaymentMethod = () => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
      HttpResponse.json([]),
    ),
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
      HttpResponse.json({
        version: 'v1',
        type: 'Check',
        split_by: null,
        splits: [],
      }),
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

describe('PaymentMethodCard (standalone)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the Payment card title and bank accounts once data loads', async () => {
    renderWithProviders(<PaymentMethodCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByText('Chase')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add another bank account/i })).toBeInTheDocument()
  })

  it('renders the Check label when the employee is on Check payment method', async () => {
    mockCheckPaymentMethod()

    renderWithProviders(<PaymentMethodCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByText('Check')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.queryByRole('button', { name: /split paycheck/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /add another bank account/i }),
    ).not.toBeInTheDocument()
  })

  it('fires EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED when the add CTA is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: /add another bank account/i }),
        ).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: /add another bank account/i }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
    )
  })

  it('fires EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED when Split paycheck is clicked', async () => {
    const user = userEvent.setup()
    mockTwoBankAccounts()
    renderWithProviders(<PaymentMethodCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /split paycheck/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: /split paycheck/i }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED,
    )
  })

  it('fires EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED when delete is confirmed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodCard employeeId="employee-123" onEvent={onEvent} />)

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
})
