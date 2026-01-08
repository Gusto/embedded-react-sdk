import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaymentHistory } from './PaymentHistory'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const mockPaymentGroup = {
  uuid: 'payment-group-123',
  company_uuid: 'company-123',
  check_date: '2024-12-15',
  debit_date: '2024-12-13',
  status: 'Funded',
  contractor_payments: [
    {
      uuid: 'payment-1',
      contractor_uuid: 'contractor-123',
      bonus: '350.00',
      hours: '16.0',
      payment_method: 'Direct Deposit',
      reimbursement: '0.00',
      hourly_rate: '18.00',
      wage: '0.00',
      wage_type: 'Hourly',
      wage_total: '638.00',
      may_cancel: false,
    },
    {
      uuid: 'payment-2',
      contractor_uuid: 'contractor-456',
      bonus: '100.00',
      hours: '0',
      payment_method: 'Check',
      reimbursement: '50.00',
      wage: '1000.00',
      wage_type: 'Fixed',
      wage_total: '1000.00',
      may_cancel: true,
    },
  ],
}

const mockContractorsList = {
  contractor_list: [
    {
      uuid: 'contractor-123',
      first_name: 'Ella',
      last_name: 'Fitzgerald',
      type: 'Individual',
      is_active: true,
      onboarding_status: 'onboarding_completed',
    },
    {
      uuid: 'contractor-456',
      business_name: 'Acme Consulting LLC',
      type: 'Business',
      is_active: true,
      onboarding_status: 'onboarding_completed',
    },
  ],
}

describe('PaymentHistory', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    paymentId: 'payment-group-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(
        `${API_BASE_URL}/v1/contractor_payment_groups/:contractor_payment_group_uuid`,
        () => {
          return HttpResponse.json({ contractor_payment_group: mockPaymentGroup })
        },
      ),
      http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, () => {
        return HttpResponse.json(mockContractorsList)
      }),
    )
  })

  describe('rendering', () => {
    it('renders payment history with contractor payments', async () => {
      renderWithProviders(<PaymentHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Contractor payment history')).toBeInTheDocument()
      })

      expect(screen.getByText('Ella Fitzgerald')).toBeInTheDocument()
      expect(screen.getByText('Acme Consulting LLC')).toBeInTheDocument()
      expect(screen.getByText('$638.00')).toBeInTheDocument()
      expect(screen.getByText('$1,150.00')).toBeInTheDocument()
    })

    it('renders empty state when no payments', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/v1/contractor_payment_groups/:contractor_payment_group_uuid`,
          () => {
            return HttpResponse.json({
              contractor_payment_group: { ...mockPaymentGroup, contractor_payments: [] },
            })
          },
        ),
      )

      renderWithProviders(<PaymentHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No payments found')).toBeInTheDocument()
      })
    })
  })

  describe('payment actions', () => {
    it('emits view details event when payment is clicked', async () => {
      renderWithProviders(<PaymentHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Ella Fitzgerald')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Ella Fitzgerald'))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS, {
        contractorUuid: 'contractor-123',
        paymentGroupId: 'payment-group-123',
      })
    })

    it('shows cancel option for cancellable payments', async () => {
      renderWithProviders(<PaymentHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Acme Consulting LLC')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /action/i })
      await user.click(menuButtons[1]!)

      await waitFor(() => {
        expect(screen.getByText('Cancel payment')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('handles missing payment group', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/v1/contractor_payment_groups/:contractor_payment_group_uuid`,
          () => {
            return HttpResponse.json({})
          },
        ),
      )

      renderWithProviders(<PaymentHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('Contractor payment history')).not.toBeInTheDocument()
      })
    })
  })
})
