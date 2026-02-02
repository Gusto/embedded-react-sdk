import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractorPaymentGroupsList(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/contractor_payment_groups`, resolver)
}

export function handleCreateContractorPaymentGroup(resolver: HttpResponseResolver) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_id/contractor_payment_groups`, resolver)
}

export function handlePreviewContractorPaymentGroup(resolver: HttpResponseResolver) {
  return http.post(
    `${API_BASE_URL}/v1/companies/:company_id/contractor_payment_groups/preview`,
    resolver,
  )
}

export function handleGetContractorPaymentGroup(resolver: HttpResponseResolver) {
  return http.get(
    `${API_BASE_URL}/v1/contractor_payment_groups/:contractor_payment_group_id`,
    resolver,
  )
}

export function handleCancelContractorPaymentGroup(resolver: HttpResponseResolver) {
  return http.delete(`${API_BASE_URL}/v1/contractor_payments/:contractor_payment_id`, resolver)
}

const mockPaymentGroupWithBlockers = {
  uuid: 'payment-group-123',
  company_uuid: '123',
  check_date: '2025-01-30',
  debit_date: '2025-01-28',
  status: 'Funded',
  creation_token: null,
  partner_owned_disbursement: false,
  submission_blockers: [],
  credit_blockers: [],
  totals: {
    amount: '1500.00',
    debit_amount: '1500.00',
    wage_amount: '1000.00',
    reimbursement_amount: '50.00',
    check_amount: '0.00',
  },
}

const mockPaymentGroup = {
  uuid: 'payment-group-123',
  company_uuid: '123',
  check_date: '2025-01-30',
  debit_date: '2025-01-28',
  status: 'Funded',
  contractor_payments: [
    {
      uuid: 'payment-1',
      contractor_uuid: 'contractor-123',
      wage: '1000.00',
      hours: '20.00',
      bonus: '200.00',
      reimbursement: '50.00',
      payment_method: 'Direct Deposit',
    },
  ],
  totals: {
    wages: '1000.00',
    reimbursements: '50.00',
    benefits: '0.00',
    taxes: '250.00',
    net_pay: '1250.00',
    debit_amount: '1500.00',
  },
}

export const getContractorPaymentGroupsList = handleGetContractorPaymentGroupsList(() =>
  HttpResponse.json([mockPaymentGroupWithBlockers], {
    headers: {
      'x-total-pages': '1',
      'x-total-count': '1',
    },
  }),
)

export const getContractorPaymentGroup = handleGetContractorPaymentGroup(() =>
  HttpResponse.json(mockPaymentGroup),
)

export const createContractorPaymentGroup = handleCreateContractorPaymentGroup(
  async ({ request }) => {
    const requestBody = (await request.json()) as {
      check_date?: string
      contractor_payments?: Array<Record<string, unknown>>
    } | null
    return HttpResponse.json(
      {
        ...mockPaymentGroup,
        uuid: 'new-payment-group-uuid',
        check_date: requestBody?.check_date,
        contractor_payments: requestBody?.contractor_payments ?? [],
      },
      { status: 201 },
    )
  },
)

export const previewContractorPaymentGroup = handlePreviewContractorPaymentGroup(
  async ({ request }) => {
    const requestBody = (await request.json()) as {
      check_date?: string
      contractor_payments?: Array<Record<string, unknown>>
    }
    const payments = requestBody.contractor_payments ?? []
    return HttpResponse.json({
      check_date: requestBody.check_date,
      creation_token: 'preview-token-123',
      contractor_payments: payments.map((payment, index) => ({
        ...payment,
        uuid: `preview-payment-${index}`,
      })),
      totals: {
        wages: '1000.00',
        reimbursements: '50.00',
        benefits: '0.00',
        taxes: '250.00',
        net_pay: '1250.00',
        debit_amount: '1500.00',
      },
    })
  },
)

export const cancelContractorPaymentGroup = handleCancelContractorPaymentGroup(
  () => new HttpResponse(null, { status: 204 }),
)

export default [
  getContractorPaymentGroupsList,
  getContractorPaymentGroup,
  createContractorPaymentGroup,
  previewContractorPaymentGroup,
  cancelContractorPaymentGroup,
]
