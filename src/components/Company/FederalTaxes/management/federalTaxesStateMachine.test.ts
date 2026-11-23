import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { federalTaxesStateMachine } from './federalTaxesStateMachine'
import {
  FederalTaxesCardContextual,
  type FederalTaxesContextInterface,
} from './FederalTaxesComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof federalTaxesStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    federalTaxesStateMachine,
    (initialContext: FederalTaxesContextInterface): FederalTaxesContextInterface => ({
      ...initialContext,
      component: FederalTaxesCardContextual,
      companyId: 'company-123',
      successAlert: null,
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string) {
  ;(service.send as SendFunction<string>)({ type })
}

describe('federalTaxesStateMachine', () => {
  it('opens the editor on the card edit request and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED)

    expect(service.machine.current).toBe('editFederalTaxes')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.FederalTaxes',
        event: componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_CANCELLED,
      },
    })
  })

  it('returns to the card with an alert once the details are saved', () => {
    const service = createService('editFederalTaxes')
    send(service, componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_UPDATED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('federalTaxesUpdated')
    expect(service.context.header).toBeNull()
  })

  it('clears the alert in place when it is dismissed', () => {
    const service = createService('editFederalTaxes')
    send(service, componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_UPDATED)
    send(service, componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_ALERT_DISMISSED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBeNull()
  })

  it('ignores a generic CANCEL while editing, so an inner cancel cannot close the block', () => {
    // Flow re-emits every event raised inside the edit screen to this machine. A CANCEL
    // transition here would therefore fire for a cancel on a screen *inside* the editor and
    // eject the user from the whole block. This asserts the absence is deliberate.
    const service = createService('editFederalTaxes')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('editFederalTaxes')
  })

  it('ignores the onboarding save events, which the edit screen translates instead', () => {
    // Both fire on one save. Declaring either here as well would transition twice.
    const service = createService('editFederalTaxes')
    send(service, componentEvents.COMPANY_FEDERAL_TAXES_UPDATED)
    send(service, componentEvents.COMPANY_FEDERAL_TAXES_DONE)

    expect(service.machine.current).toBe('editFederalTaxes')
  })
})
