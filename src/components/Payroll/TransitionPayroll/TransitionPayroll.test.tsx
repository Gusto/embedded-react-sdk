import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { TransitionPayroll } from './TransitionPayroll'
import { createPayroll, handleGetPayrolls } from '@/test/mocks/apis/payrolls'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const START_DATE = '2025-08-14'
const END_DATE = '2025-08-27'
const PAY_SCHEDULE_UUID = '1478a82e-b45c-4980-843a-6ddc3b78268e'

const captured = vi.hoisted(() => ({
  configuration: [] as Array<Record<string, unknown>>,
}))

vi.mock('../TransitionCreation', () => ({
  TransitionCreation: (props: Record<string, unknown>) => (
    <div data-testid="transition-creation">
      <button
        type="button"
        data-testid="transition-creation-submit"
        onClick={() => {
          ;(props.onEvent as (event: string, data: unknown) => void)('transition/created', {
            payrollUuid: 'created-transition-uuid',
          })
        }}
      >
        Create
      </button>
    </div>
  ),
}))

vi.mock('../PayrollConfiguration/PayrollConfiguration', () => ({
  PayrollConfiguration: (props: Record<string, unknown>) => {
    captured.configuration.push(props)
    return <div data-testid="payroll-configuration">Configuration</div>
  },
}))

const matchingTransitionPayroll = () =>
  createPayroll({
    payroll_uuid: 'resolved-transition-uuid',
    off_cycle: true,
    off_cycle_reason: 'Transition from old pay schedule',
    processed: false,
    pay_period: {
      start_date: START_DATE,
      end_date: END_DATE,
      pay_schedule_uuid: PAY_SCHEDULE_UUID,
    },
  })

const defaultProps = {
  companyId: COMPANY_ID,
  startDate: START_DATE,
  endDate: END_DATE,
  payScheduleUuid: PAY_SCHEDULE_UUID,
}

describe('TransitionPayroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    captured.configuration.length = 0
    setupApiTestMocks()
  })

  it('starts on creation when no transition payroll exists yet', async () => {
    server.use(handleGetPayrolls(() => HttpResponse.json([])))

    renderWithProviders(<TransitionPayroll {...defaultProps} onEvent={vi.fn()} />)

    expect(await screen.findByTestId('transition-creation')).toBeInTheDocument()
    expect(screen.queryByTestId('payroll-configuration')).toBeNull()
  })

  it('starts on configuration for an existing transition payroll and passes its id', async () => {
    server.use(handleGetPayrolls(() => HttpResponse.json([matchingTransitionPayroll()])))

    renderWithProviders(<TransitionPayroll {...defaultProps} onEvent={vi.fn()} />)

    expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
    expect(screen.queryByTestId('transition-creation')).toBeNull()
    expect(captured.configuration.at(-1)).toMatchObject({
      companyId: COMPANY_ID,
      payrollId: 'resolved-transition-uuid',
    })
  })

  it('starts on configuration when a payrollUuid prop is supplied, ignoring the lookup', async () => {
    server.use(handleGetPayrolls(() => HttpResponse.json([])))

    renderWithProviders(
      <TransitionPayroll {...defaultProps} payrollUuid="provided-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
    expect(screen.queryByTestId('transition-creation')).toBeNull()
    expect(captured.configuration.at(-1)).toMatchObject({
      companyId: COMPANY_ID,
      payrollId: 'provided-uuid',
    })
  })

  it('advances from creation to configuration on transition/created, carrying the new id', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    server.use(handleGetPayrolls(() => HttpResponse.json([])))

    renderWithProviders(<TransitionPayroll {...defaultProps} onEvent={onEvent} />)

    await user.click(await screen.findByTestId('transition-creation-submit'))

    expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith('transition/created', {
      payrollUuid: 'created-transition-uuid',
    })
    expect(captured.configuration.at(-1)).toMatchObject({
      companyId: COMPANY_ID,
      payrollId: 'created-transition-uuid',
    })
  })
})
