import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaymentsList } from './PaymentsList'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const mockPaymentGroups = [
  {
    uuid: 'payment-group-1',
    company_uuid: 'company-123',
    check_date: '2024-12-15',
    debit_date: '2024-12-13',
    status: 'Funded',
    totals: {
      amount: '2500.00',
      debit_amount: '2500.00',
      wage_amount: '2000.00',
      reimbursement_amount: '500.00',
    },
  },
  {
    uuid: 'payment-group-2',
    company_uuid: 'company-123',
    check_date: '2024-11-30',
    debit_date: '2024-11-28',
    status: 'Unfunded',
    totals: {
      amount: '1800.00',
      debit_amount: '1800.00',
      wage_amount: '1800.00',
      reimbursement_amount: '0.00',
    },
  },
]

describe('PaymentsList', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractor_payment_groups`, () => {
        return HttpResponse.json({ contractor_payment_groups: mockPaymentGroups })
      }),
    )
  })

  describe('rendering', () => {
    it('renders payment groups list', async () => {
      renderWithProviders(<PaymentsList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Contractor payments')).toBeInTheDocument()
      })

      expect(screen.getByText('December 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('November 30, 2024')).toBeInTheDocument()
      expect(screen.getByText('$2,500.00')).toBeInTheDocument()
      expect(screen.getByText('$1,800.00')).toBeInTheDocument()
    })

    it('renders empty state when no payment groups', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractor_payment_groups`, () => {
          return HttpResponse.json({ contractor_payment_groups: [] })
        }),
      )

      renderWithProviders(<PaymentsList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No contractor payments')).toBeInTheDocument()
      })
    })
  })

  describe('payment actions', () => {
    it('emits create payment event when create button is clicked', async () => {
      renderWithProviders(<PaymentsList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Contractor payments')).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /create payment/i })
      await user.click(createButton)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_CREATE)
    })

    it('emits view payment event when payment is clicked', async () => {
      renderWithProviders(<PaymentsList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 15, 2024')).toBeInTheDocument()
      })

      await user.click(screen.getByText('December 15, 2024'))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_VIEW, {
        paymentId: 'payment-group-1',
      })
    })
  })

  describe('error handling', () => {
    it('handles API errors gracefully', () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractor_payment_groups`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        }),
      )

      expect(() => {
        renderWithProviders(<PaymentsList {...defaultProps} />)
      }).not.toThrow()
    })
  })
})
