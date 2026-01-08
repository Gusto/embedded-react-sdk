import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { PaymentStatement } from './PaymentStatement'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const mockContractorPaymentGroup = {
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
      status: 'Funded',
      hourly_rate: '18.00',
      wage: '0.00',
      wage_type: 'Hourly',
      wage_total: '638.00',
    },
    {
      uuid: 'payment-2',
      contractor_uuid: 'contractor-456',
      bonus: '100.00',
      hours: '0',
      payment_method: 'Check',
      reimbursement: '50.00',
      status: 'Unfunded',
      wage: '1000.00',
      wage_type: 'Fixed',
      wage_total: '1000.00',
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
      wage_type: 'Hourly',
      hourly_rate: '18.00',
      payment_method: 'Direct Deposit',
    },
    {
      uuid: 'contractor-456',
      business_name: 'Acme Consulting LLC',
      type: 'Business',
      is_active: true,
      onboarding_status: 'onboarding_completed',
      wage_type: 'Fixed',
      payment_method: 'Check',
    },
  ],
}

describe('PaymentStatement', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    paymentGroupId: 'payment-group-123',
    contractorUuid: 'contractor-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(
        `${API_BASE_URL}/v1/contractor_payment_groups/:contractor_payment_group_uuid`,
        () => {
          return HttpResponse.json({
            contractor_payment_group: mockContractorPaymentGroup,
          })
        },
      ),
      http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, () => {
        return HttpResponse.json(mockContractorsList)
      }),
    )
  })

  describe('rendering', () => {
    it('renders hourly contractor payment statement correctly', async () => {
      renderWithProviders(<PaymentStatement {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Payment statement for Ella Fitzgerald')).toBeInTheDocument()
      })

      expect(screen.getByText('December 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Direct Deposit')).toBeInTheDocument()
      expect(screen.getByText('Hours')).toBeInTheDocument()
      expect(screen.getByText('16.0 hours at $18.00/hr')).toBeInTheDocument()
      expect(screen.getByText('$638.00')).toBeInTheDocument()
      expect(screen.getByText('$350.00')).toBeInTheDocument()
    })

    it('renders fixed wage contractor payment statement correctly', async () => {
      renderWithProviders(<PaymentStatement {...defaultProps} contractorUuid="contractor-456" />)

      await waitFor(() => {
        expect(screen.getByText('Payment statement for Acme Consulting LLC')).toBeInTheDocument()
      })

      expect(screen.getByText('Check')).toBeInTheDocument()
      expect(screen.getByText('Wage')).toBeInTheDocument()
      expect(screen.queryByText('Hours')).not.toBeInTheDocument()
      expect(screen.getByText('$1,000.00')).toBeInTheDocument()
      expect(screen.getByText('$50.00')).toBeInTheDocument()
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

      renderWithProviders(<PaymentStatement {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('Payment statement for Ella Fitzgerald')).not.toBeInTheDocument()
      })
    })

    it('handles missing contractor', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, () => {
          return HttpResponse.json({ contractor_list: [] })
        }),
      )

      renderWithProviders(<PaymentStatement {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('Payment statement for Ella Fitzgerald')).not.toBeInTheDocument()
      })
    })
  })
})
