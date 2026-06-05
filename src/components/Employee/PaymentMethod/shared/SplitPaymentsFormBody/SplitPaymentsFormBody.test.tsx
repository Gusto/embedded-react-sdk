import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  SplitPaymentsFormBody,
  type SplitPaymentsFormBodyDictionary,
} from './SplitPaymentsFormBody'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
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

describe('SplitPaymentsFormBody', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders split fields, interpolated account labels, and default action copy', async () => {
    mockTwoBankAccounts()
    renderWithProviders(
      <SplitPaymentsFormBody employeeId="employee-123" onSaved={vi.fn()} onCancel={vi.fn()} />,
    )

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: 'Percentage' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
    expect(screen.getByRole('radio', { name: 'Fixed amount' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Chase \(XXXX0000\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Wells Fargo \(XXXX1111\)/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onSaved with the updated payment method when percentages total 100', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    mockTwoBankAccounts()
    renderWithProviders(
      <SplitPaymentsFormBody employeeId="employee-123" onSaved={onSaved} onCancel={vi.fn()} />,
    )

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    mockTwoBankAccounts()
    renderWithProviders(
      <SplitPaymentsFormBody employeeId="employee-123" onSaved={vi.fn()} onCancel={onCancel} />,
    )

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders strings from the dictionary prop in place of the defaults', async () => {
    const dictionary: SplitPaymentsFormBodyDictionary = {
      en: {
        title: 'Distribute your paycheck',
        saveCta: 'Apply split',
        cancelCta: 'Discard',
      },
    }
    mockTwoBankAccounts()
    renderWithProviders(
      <SplitPaymentsFormBody
        employeeId="employee-123"
        dictionary={dictionary}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(
      await screen.findByRole('heading', { name: 'Distribute your paycheck' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply split' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument()
  })
})
