import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import type * as PayrollFlowComponentsModule from './PayrollFlowComponents'
import { PayrollFlow } from './PayrollFlow'
import { createPayroll, handleGetPayrolls } from '@/test/mocks/apis/payrolls'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

/**
 * CHARACTERIZATION / BACKWARD-COMPAT TESTS — transition-payroll path.
 *
 * These tests pin the OBSERVABLE behavior of the transition path through
 * `Payroll.PayrollFlow`: which screen renders per resolve outcome, the breadcrumb
 * shown, and the events (names, payloads, order) re-emitted upstream. They must
 * hold across the internal rewiring of `TransitionFlow` / `TransitionFlowContextual`
 * / `TransitionPayroll`.
 *
 * They intentionally assert on the seam (routing, resolve lookup, breadcrumb chrome,
 * event re-emission) rather than the internals of the leaf screens, which are stubbed
 * with deterministic markers that also capture their props. The two leaves the
 * transition path renders are `TransitionCreation` (when no transition payroll exists)
 * and `PayrollConfiguration` (when one is resolved or created).
 */

const COMPANY_ID = 'company-123'

const { transitionPayload } = vi.hoisted(() => ({
  transitionPayload: {
    startDate: '2025-08-14',
    endDate: '2025-08-27',
    payScheduleUuid: '1478a82e-b45c-4980-843a-6ddc3b78268e',
  },
}))

const captured = vi.hoisted(() => ({
  creation: [] as Array<Record<string, unknown>>,
  configuration: [] as Array<Record<string, unknown>>,
}))

// Replace the landing screen with a button that fires the documented
// `transition/runPayroll` event (the same event `TransitionPayrollAlert` emits)
// with a fixed payload. The alert->event mapping is covered by TransitionPayrollAlert.test.tsx.
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

// Stub the creation screen: capture props, expose a button that fires the documented
// `transition/created` event to advance to configuration.
vi.mock('../TransitionCreation', () => ({
  TransitionCreation: (props: Record<string, unknown>) => {
    captured.creation.push(props)
    return (
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
    )
  },
}))

// Stub the configuration screen: capture props (companyId + payrollId).
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

describe('PayrollFlow — transition path (characterization)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    captured.creation.length = 0
    captured.configuration.length = 0
    setupApiTestMocks()
  })

  describe('resolve query finds no existing transition payroll', () => {
    it('routes from landing into the transition creation screen', async () => {
      const user = userEvent.setup()
      const resolveResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json([]))
      server.use(handleGetPayrolls(resolveResolver))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByTestId('landing-run-transition'))

      expect(await screen.findByTestId('transition-creation')).toBeInTheDocument()
      expect(screen.queryByTestId('payroll-configuration')).toBeNull()
      expect(screen.queryByTestId('landing-run-transition')).toBeNull()
      expect(resolveResolver).toHaveBeenCalled()
    })

    it('passes the transition pay-period context down to the creation screen', async () => {
      const user = userEvent.setup()
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByTestId('landing-run-transition'))
      await screen.findByTestId('transition-creation')

      expect(captured.creation.at(-1)).toMatchObject({
        companyId: COMPANY_ID,
        startDate: transitionPayload.startDate,
        endDate: transitionPayload.endDate,
        payScheduleUuid: transitionPayload.payScheduleUuid,
      })
    })

    it('shows the "Transition Payroll" breadcrumb on the creation step', async () => {
      const user = userEvent.setup()
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByTestId('landing-run-transition'))
      await screen.findByTestId('transition-creation')

      expect(await screen.findByText('Transition Payroll')).toBeInTheDocument()
    })
  })

  describe('resolve query finds an existing transition payroll', () => {
    it('routes from landing directly into the configuration screen, skipping creation', async () => {
      const user = userEvent.setup()
      const resolveResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json([matchingTransitionPayroll()]),
      )
      server.use(handleGetPayrolls(resolveResolver))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByTestId('landing-run-transition'))

      expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
      expect(screen.queryByTestId('transition-creation')).toBeNull()
      expect(resolveResolver).toHaveBeenCalled()
    })

    it('hands the resolved payrollUuid to the configuration screen', async () => {
      const user = userEvent.setup()
      server.use(handleGetPayrolls(() => HttpResponse.json([matchingTransitionPayroll()])))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByTestId('landing-run-transition'))
      await screen.findByTestId('payroll-configuration')

      expect(captured.configuration.at(-1)).toMatchObject({
        companyId: COMPANY_ID,
        payrollId: 'resolved-transition-uuid',
      })
    })
  })

  describe('event names, payloads, and ordering', () => {
    it('re-emits transition/runPayroll upstream with its documented payload shape', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={onEvent} />)

      await user.click(await screen.findByTestId('landing-run-transition'))
      await screen.findByTestId('transition-creation')

      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_TRANSITION_PAYROLL, {
        startDate: transitionPayload.startDate,
        endDate: transitionPayload.endDate,
        payScheduleUuid: transitionPayload.payScheduleUuid,
      })
    })

    it('emits runPayroll then created in order as the user advances creation → configuration', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={onEvent} />)

      await user.click(await screen.findByTestId('landing-run-transition'))
      await screen.findByTestId('transition-creation')

      await user.click(screen.getByTestId('transition-creation-submit'))
      await screen.findByTestId('payroll-configuration')

      const transitionEventOrder = onEvent.mock.calls
        .map(([type]) => type)
        .filter(
          type =>
            type === componentEvents.RUN_TRANSITION_PAYROLL ||
            type === componentEvents.TRANSITION_CREATED,
        )

      expect(transitionEventOrder).toEqual([
        componentEvents.RUN_TRANSITION_PAYROLL,
        componentEvents.TRANSITION_CREATED,
      ])
      expect(onEvent).toHaveBeenCalledWith(componentEvents.TRANSITION_CREATED, {
        payrollUuid: 'created-transition-uuid',
      })
    })

    it('carries the created payrollUuid into the configuration screen after creation completes', async () => {
      const user = userEvent.setup()
      server.use(handleGetPayrolls(() => HttpResponse.json([])))

      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByTestId('landing-run-transition'))
      await screen.findByTestId('transition-creation')

      await user.click(screen.getByTestId('transition-creation-submit'))
      await screen.findByTestId('payroll-configuration')

      expect(captured.configuration.at(-1)).toMatchObject({
        companyId: COMPANY_ID,
        payrollId: 'created-transition-uuid',
      })
    })
  })
})
