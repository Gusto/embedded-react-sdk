import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PayrollFlow } from './PayrollFlow'
import {
  createPayroll,
  handleGetPayrollBlockers,
  handleGetPayrolls,
  handlePayrollsPrepare,
} from '@/test/mocks/apis/payrolls'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const TRANSITION_PAYROLL_ID = 'transition-payroll-uuid'

const payPeriod = {
  start_date: '2026-11-07',
  end_date: '2026-11-13',
  pay_schedule_uuid: 'schedule-1',
}

describe('PayrollFlow transition path', () => {
  let preparedPayrollIds: string[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    preparedPayrollIds = []
    setupApiTestMocks()

    const prepareResolver = vi.fn<HttpResponseResolver>(async ({ params }) => {
      preparedPayrollIds.push(String(params.payroll_id))
      return HttpResponse.json(
        await getFixture('put-v1-companies-company_id-payrolls-payroll_id-prepare'),
      )
    })

    server.use(
      handleGetPayrollBlockers(() => HttpResponse.json([])),
      http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_periods`, () =>
        HttpResponse.json([
          {
            ...payPeriod,
            payroll: {
              payroll_uuid: TRANSITION_PAYROLL_ID,
              processed: false,
              payroll_type: 'transition',
            },
          },
        ]),
      ),
      handleGetPayrolls(() =>
        HttpResponse.json([
          createPayroll({
            payroll_uuid: TRANSITION_PAYROLL_ID,
            processed: false,
            calculated_at: null,
            off_cycle: true,
            off_cycle_reason: 'Transition from old pay schedule',
            check_date: '2026-11-13',
            pay_period: payPeriod,
          }),
        ]),
      ),
      handlePayrollsPrepare(prepareResolver),
    )
  })

  it('opens the transition settings, then the payroll, when Run is clicked in the alert', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Run Transition Payroll' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.RUN_TRANSITION_PAYROLL,
      expect.objectContaining({ payrollUuid: TRANSITION_PAYROLL_ID }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Edit transition payroll' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByRole('heading', { name: 'Edit Payroll', level: 1 }),
    ).toBeInTheDocument()
    expect(new Set(preparedPayrollIds)).toEqual(new Set([TRANSITION_PAYROLL_ID]))
  })

  it('opens the transition settings, then the payroll, when Run is clicked in the payroll list', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Run Payroll' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.TRANSITION_PAYROLL_SELECTED,
      expect.objectContaining({ payrollUuid: TRANSITION_PAYROLL_ID }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Edit transition payroll' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByRole('heading', { name: 'Edit Payroll', level: 1 }),
    ).toBeInTheDocument()
    expect(new Set(preparedPayrollIds)).toEqual(new Set([TRANSITION_PAYROLL_ID]))
  })
})
