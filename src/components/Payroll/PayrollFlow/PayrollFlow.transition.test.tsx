import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as PayrollFlowComponentsModule from './PayrollFlowComponents'
import { PayrollFlow } from './PayrollFlow'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

// Tests the transition path in PayrollFlow. Clicking Run on a transition payroll, in the alert
// or the list, opens TransitionConfiguration. Saving it opens PayrollConfiguration for the same
// payroll. The landing page and both screens are stubbed, so this only checks routing, props,
// and events.

const COMPANY_ID = 'company-123'
const TRANSITION_PAYROLL_ID = 'transition-payroll-uuid'

const captured = vi.hoisted(() => ({
  transitionConfiguration: [] as Array<Record<string, unknown>>,
  payrollConfiguration: [] as Array<Record<string, unknown>>,
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
        <>
          <button
            type="button"
            onClick={() => {
              onEvent(events.RUN_TRANSITION_PAYROLL, {
                payrollUuid: 'transition-payroll-uuid',
                startDate: '2025-08-14',
                endDate: '2025-08-27',
                payScheduleUuid: '1478a82e-b45c-4980-843a-6ddc3b78268e',
              })
            }}
          >
            Run from alert
          </button>
          <button
            type="button"
            onClick={() => {
              onEvent(events.TRANSITION_PAYROLL_SELECTED, {
                payrollUuid: 'transition-payroll-uuid',
              })
            }}
          >
            Run from list
          </button>
        </>
      )
    },
  }
})

vi.mock('../TransitionConfiguration', () => ({
  TransitionConfiguration: (props: Record<string, unknown>) => {
    captured.transitionConfiguration.push(props)
    return (
      <button
        type="button"
        onClick={() => {
          ;(props.onEvent as (event: string, data: unknown) => void)('transition/configured', {
            payrollUuid: props.payrollId,
          })
        }}
      >
        Save transition settings
      </button>
    )
  },
}))

vi.mock('../PayrollConfiguration/PayrollConfiguration', () => ({
  PayrollConfiguration: (props: Record<string, unknown>) => {
    captured.payrollConfiguration.push(props)
    return <div data-testid="payroll-configuration">Payroll configuration</div>
  },
}))

describe('PayrollFlow transition path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    captured.transitionConfiguration.length = 0
    captured.payrollConfiguration.length = 0
    setupApiTestMocks()
  })

  it.each(['Run from alert', 'Run from list'])(
    'opens TransitionConfiguration for the payroll on "%s"',
    async buttonName => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

      await user.click(await screen.findByRole('button', { name: buttonName }))

      expect(
        await screen.findByRole('button', { name: 'Save transition settings' }),
      ).toBeInTheDocument()
      expect(captured.transitionConfiguration.at(-1)).toMatchObject({
        companyId: COMPANY_ID,
        payrollId: TRANSITION_PAYROLL_ID,
      })
    },
  )

  it('opens PayrollConfiguration for the same payroll after the settings are saved', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<PayrollFlow companyId={COMPANY_ID} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Run from list' }))
    await user.click(await screen.findByRole('button', { name: 'Save transition settings' }))

    expect(await screen.findByTestId('payroll-configuration')).toBeInTheDocument()
    expect(captured.payrollConfiguration.at(-1)).toMatchObject({
      companyId: COMPANY_ID,
      payrollId: TRANSITION_PAYROLL_ID,
    })

    const transitionEvents = onEvent.mock.calls
      .map(([type]) => type)
      .filter(
        type =>
          type === componentEvents.TRANSITION_PAYROLL_SELECTED ||
          type === componentEvents.TRANSITION_CONFIGURED,
      )
    expect(transitionEvents).toEqual([
      componentEvents.TRANSITION_PAYROLL_SELECTED,
      componentEvents.TRANSITION_CONFIGURED,
    ])
  })
})
