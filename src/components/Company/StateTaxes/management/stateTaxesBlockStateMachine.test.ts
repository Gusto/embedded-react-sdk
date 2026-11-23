import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { stateTaxesBlockStateMachine } from './stateTaxesBlockStateMachine'
import {
  StateTaxesCardContextual,
  type StateTaxesBlockContextInterface,
} from './StateTaxesComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof stateTaxesBlockStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    stateTaxesBlockStateMachine,
    (initialContext: StateTaxesBlockContextInterface): StateTaxesBlockContextInterface => ({
      ...initialContext,
      component: StateTaxesCardContextual,
      companyId: 'company-123',
      successAlert: null,
      pendingAlert: null,
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string) {
  ;(service.send as SendFunction<string>)({ type })
}

describe('stateTaxesBlockStateMachine', () => {
  it('opens the editor on the card action and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED)

    expect(service.machine.current).toBe('stateTaxes')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.StateTaxes',
        event: componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
      },
    })
  })

  it('stays in the editor as states are saved, recording the alert rather than showing it', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_UPDATED)

    expect(service.machine.current).toBe('stateTaxes')
    expect(service.context.pendingAlert).toBe('stateTaxesUpdated')
    expect(service.context.successAlert).toBeNull()
  })

  it('surfaces the recorded alert on the card once the user leaves', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_UPDATED)
    send(service, componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('stateTaxesUpdated')
    expect(service.context.pendingAlert).toBeNull()
  })

  it('returns without an alert when nothing was saved during the visit', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBeNull()
  })

  it('ignores a generic CANCEL, which returns one state to the list inside the editor', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('stateTaxes')
  })

  it('ignores the onboarding save and navigation events, which the editor translates', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_STATE_TAX_UPDATED)
    send(service, componentEvents.COMPANY_STATE_TAX_RATE_SCHEDULED)
    send(service, componentEvents.COMPANY_STATE_TAX_EDIT)
    send(service, componentEvents.COMPANY_STATE_TAX_MANAGE_RATES)

    expect(service.machine.current).toBe('stateTaxes')
    expect(service.context.pendingAlert).toBeNull()
  })
})
