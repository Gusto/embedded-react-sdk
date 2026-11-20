import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { industryStateMachine } from './industryStateMachine'
import { IndustryCardContextual, type IndustryContextInterface } from './IndustryComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof industryStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    industryStateMachine,
    (initialContext: IndustryContextInterface): IndustryContextInterface => ({
      ...initialContext,
      component: IndustryCardContextual,
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

describe('industryStateMachine', () => {
  it('opens the editor on the card edit request and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED)

    expect(service.machine.current).toBe('editIndustry')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.Industry',
        event: componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_CANCELLED,
      },
    })
  })

  it('returns to the card with an alert once the classification is saved', () => {
    const service = createService('editIndustry')
    send(service, componentEvents.COMPANY_MANAGEMENT_INDUSTRY_UPDATED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('industryUpdated')
    expect(service.context.header).toBeNull()
  })

  it('clears the alert in place when it is dismissed', () => {
    const service = createService('editIndustry')
    send(service, componentEvents.COMPANY_MANAGEMENT_INDUSTRY_UPDATED)
    send(service, componentEvents.COMPANY_MANAGEMENT_INDUSTRY_ALERT_DISMISSED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBeNull()
  })

  it('ignores a generic CANCEL while editing, so an inner cancel cannot close the block', () => {
    // Flow re-emits every event raised inside the edit screen to this machine. A CANCEL
    // transition here would therefore fire for a cancel on a screen *inside* the editor and
    // eject the user from the whole block. This asserts the absence is deliberate.
    const service = createService('editIndustry')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('editIndustry')
  })

  it('ignores the onboarding selected event, which the edit screen translates instead', () => {
    const service = createService('editIndustry')
    send(service, componentEvents.COMPANY_INDUSTRY_SELECTED)

    expect(service.machine.current).toBe('editIndustry')
  })
})
