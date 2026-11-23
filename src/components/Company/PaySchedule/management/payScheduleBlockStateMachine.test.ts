import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { payScheduleBlockStateMachine } from './payScheduleBlockStateMachine'
import {
  PaySchedulesCardContextual,
  type PayScheduleBlockContextInterface,
} from './PayScheduleComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof payScheduleBlockStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    payScheduleBlockStateMachine,
    (initialContext: PayScheduleBlockContextInterface): PayScheduleBlockContextInterface => ({
      ...initialContext,
      component: PaySchedulesCardContextual,
      companyId: 'company-123',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string) {
  ;(service.send as SendFunction<string>)({ type })
}

describe('payScheduleBlockStateMachine', () => {
  it('opens the surface on the card action and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_REQUESTED)

    expect(service.machine.current).toBe('paySchedule')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.PaySchedule',
        event: componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_CANCELLED,
      },
    })
  })

  it('returns to the card via the back header', () => {
    const service = createService('paySchedule')
    send(service, componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.header).toBeNull()
  })

  it('ignores a generic CANCEL, which returns the schedule form to the overview inside', () => {
    const service = createService('paySchedule')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('paySchedule')
  })
})
