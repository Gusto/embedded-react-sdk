import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { http, HttpResponse } from 'msw'
import { PaymentFlow } from './PaymentFlow'
import type { PaymentFlowProps } from './PaymentFlowComponents'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { handleGetContractorPaymentGroup } from '@/test/mocks/apis/contractor_payment_groups'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'

/**
 * `CreatePayment` (reached via the createPayment breadcrumb test) queries payment
 * speed and the contractor payment receipt; neither has a default handler in
 * `handlers.ts`, so both need an explicit mock to avoid an unhandled request.
 */
const paymentConfigsMock = http.get(
  `${API_BASE_URL}/v1/companies/:company_uuid/payment_configs`,
  () => HttpResponse.json({ payment_speed: '2-day', fast_payment_limit: 5000000 }),
)

const contractorPaymentReceiptNotAvailable = http.get(
  `${API_BASE_URL}/v1/contractor_payments/:contractor_payment_uuid/receipt`,
  () => new HttpResponse(null, { status: 404 }),
)

/**
 * Overrides the default `getContractorPaymentGroup` fixture with a contractor
 * payment that carries `may_cancel: true`, so the history row's action menu
 * surfaces both "View" and "Cancel payment".
 */
const paymentGroupWithCancelableContractorPayment = handleGetContractorPaymentGroup(() =>
  HttpResponse.json({
    uuid: 'payment-group-123',
    company_uuid: '123',
    check_date: '2025-01-30',
    debit_date: '2025-01-28',
    status: 'Funded',
    contractor_payments: [
      {
        uuid: 'contractor-payment-1',
        contractor_uuid: 'contractor-123',
        wage_type: 'Hourly',
        hourly_rate: '50.00',
        hours: '10.00',
        bonus: '0.00',
        reimbursement: '0.00',
        wage_total: '500.00',
        payment_method: 'Direct Deposit',
        status: 'Funded',
        may_cancel: true,
      },
    ],
    totals: {
      wages: '500.00',
      reimbursements: '0.00',
      benefits: '0.00',
      taxes: '0.00',
      net_pay: '500.00',
      debit_amount: '500.00',
    },
  }),
)

/**
 * Wraps `PaymentFlow` behind a sibling button that forces a parent re-render.
 * Simulates a partner app re-rendering its own tree on every bubbled `onEvent`
 * call -- independent of anything `PaymentFlow` itself controls -- to check
 * that the flow's in-progress state survives being re-rendered from above.
 */
function PaymentFlowHost({ onEvent }: { onEvent: PaymentFlowProps['onEvent'] }) {
  const [, setTick] = useState(0)
  return (
    <div>
      <button
        onClick={() => {
          setTick(tick => tick + 1)
        }}
      >
        force parent re-render
      </button>
      <PaymentFlow companyId={COMPANY_ID} onEvent={onEvent} />
    </div>
  )
}

describe('PaymentFlow', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(paymentConfigsMock, contractorPaymentReceiptNotAvailable)
  })

  it('walks from the payments list through history and a payment statement, back via breadcrumb, then cancels', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    server.use(paymentGroupWithCancelableContractorPayment)

    renderWithProviders(<PaymentFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    // Landing -> History
    await user.click(await screen.findByRole('button', { name: 'View payment' }))
    await screen.findByRole('heading', { name: 'Contractor payment history' })
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_VIEW, {
      paymentId: 'payment-group-123',
    })

    // History -> Statement
    await user.click(screen.getByRole('button', { name: 'Action' }))
    await user.click(await screen.findByRole('menuitem', { name: 'View' }))
    await screen.findByRole('heading', { name: 'Payment statement for John Contractor' })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS,
      expect.objectContaining({ paymentGroupId: 'payment-group-123' }),
    )

    // Statement -> History, via the "Payment history" breadcrumb
    await user.click(screen.getByRole('button', { name: 'Payment history' }))
    await screen.findByRole('heading', { name: 'Contractor payment history' })

    // History -> Landing, via cancelling the payment
    await user.click(screen.getByRole('button', { name: 'Action' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cancel payment' }))

    await screen.findByRole('heading', { name: 'Contractor payments' })
    expect(await screen.findByText('Contractor payment cancelled successfully')).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_CANCEL, {
      paymentId: 'contractor-payment-1',
    })
  })

  it('returns to the payments list when the breadcrumb is clicked from history', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    server.use(paymentGroupWithCancelableContractorPayment)

    renderWithProviders(<PaymentFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'View payment' }))
    await screen.findByRole('heading', { name: 'Contractor payment history' })

    await user.click(screen.getByRole('button', { name: 'Contractor payments' }))

    await screen.findByRole('heading', { name: 'Contractor payments' })
    expect(screen.getByRole('button', { name: 'View payment' })).toBeInTheDocument()
  })

  it('returns to the payments list when the breadcrumb is clicked from createPayment', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(<PaymentFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Contractor payments' })
    await user.click(screen.getByRole('button', { name: 'New payment' }))

    await screen.findByRole('heading', { name: 'Pay contractors' })
    await user.click(screen.getByRole('button', { name: 'Contractor payments' }))

    await screen.findByRole('heading', { name: 'Contractor payments' })
  })

  it("does not reset the flow's current step when the partner app re-renders its own tree mid-flow", async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    server.use(paymentGroupWithCancelableContractorPayment)

    renderWithProviders(<PaymentFlowHost onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'View payment' }))
    await screen.findByRole('heading', { name: 'Contractor payment history' })

    await user.click(screen.getByRole('button', { name: 'force parent re-render' }))

    expect(screen.getByRole('heading', { name: 'Contractor payment history' })).toBeInTheDocument()
  })
})
