import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import type * as PayrollFlowComponentsModule from './PayrollFlowComponents'
import { PayrollFlow } from './PayrollFlow'
import { createPayroll, handleGetPayrolls } from '@/test/mocks/apis/payrolls'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

// Covers the PayrollFlow transition path: clicking "Run Transition Payroll" resolves
// whether a transition payroll already exists and routes to configuration or creation.
// The landing screen and the two leaf screens are stubbed so the test asserts routing,
// props, and events rather than leaf internals.

const COMPANY_ID = 'company-123'

const { transitionPayload } = vi.hoisted(() => ({
  transitionPayload: {
    startDate: '2025-08-14',
    endDate: '2025-08-27',
    payScheduleUuid: '1478a82e-b45c-4980-843a-6ddc3b78268e',
  },
}))

const captured = vi.hoisted(() => ({
  configuration: [] as Array<Record<string, unknown>>,
}))

vi.mock('./PayrollFlowComponents', async importOriginal => {
  const actual = await importOriginal<typeof PayrollFlowComponentsModule>()
  const { useFlow } = await import('@/components/Flow/useFlow')
  const { componentEvents: events } = await import('@/shared/constants')
  return {
    ...actual,
    PayrollLandingContextual: () => {
      const { onEvent } = useFlow()
      return (
        <button
          type="button"
          data-testid="landing-run-transition"
          onClick={() => {
            onEvent(events.RUN_TRANSITION_PAYROLL, transitionPayload)
          }}
        >
          Run Transition Payroll
        </button>
      )
    },
  }
})

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
        Create transition payroll
      </button>
    </div>
  ),
}))

vi.mock('../PayrollConfiguration/PayrollConfiguration', () => ({
  PayrollConfiguration: (props: Record<string, unknown>) => {
    captured.configuration.push(props)
    return <div data-testid="payroll-configuration">Payroll configuration</div>
  },
}))

const matchingTransitionPayroll = () =>
  createPayroll({
    payroll_uuid: 'resolved-transition-uuid',
    off_cycle: true,
    off_cycle_reason: 'Transition from old pay schedule',
    processed: false,
    pay_period: {
      start_date: transitionPayload.startDate,
      end_date: transitionPayload.endDate,
      pay_schedule_uuid: transitionPayload.payScheduleUuid,
    },
  })

describe('PayrollFlow transition path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    captured.configuration.length = 0
    setupApiTestMocks()
  })

  it('opens the creation screen when no transition payroll exists', async () => {
    const user = userEvent.setup()
    server.use(handleGetPayrolls(() => HttpResponse.json([])))

    renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

    await user.click(await screen.findByTestId('landing-run-transition'))

    expect(await screen.findByTestId('transition-creation')).toBeInTheDocument()
    expect(screen.queryByTestId('payroll-configuration')).toBeNull()
  })

  it('opens configuration directly for an existing transition payroll', async () => {
    const user = userEvent.setup()
    server.use(handleGetPayrolls(() => HttpResponse.json([matchingTransitionPayroll()])))

    renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

    await user.click(await screen.findByTestId('landing-run-transition'))

    expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
    expect(screen.queryByTestId('transition-creation')).toBeNull()
    expect(captured.configuration.at(-1)).toMatchObject({
      companyId: COMPANY_ID,
      payrollId: 'resolved-transition-uuid',
    })
  })

  it('advances creation to configuration with the created payroll', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    server.use(handleGetPayrolls(() => HttpResponse.json([])))

    renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    await user.click(await screen.findByTestId('landing-run-transition'))
    await user.click(await screen.findByTestId('transition-creation-submit'))

    expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
    expect(captured.configuration.at(-1)).toMatchObject({
      companyId: COMPANY_ID,
      payrollId: 'created-transition-uuid',
    })

    const events = onEvent.mock.calls
      .map(([type]) => type)
      .filter(
        type =>
          type === componentEvents.RUN_TRANSITION_PAYROLL ||
          type === componentEvents.TRANSITION_CREATED,
      )
    expect(events).toEqual([
      componentEvents.RUN_TRANSITION_PAYROLL,
      componentEvents.TRANSITION_CREATED,
    ])
  })
})
