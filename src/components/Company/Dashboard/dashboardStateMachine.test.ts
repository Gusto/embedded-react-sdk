import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { dashboardStateMachine } from './dashboardStateMachine'
import { DashboardViewContextual, type DashboardContextInterface } from './DashboardComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof dashboardStateMachine = 'companyForms') {
  const machine = createMachine(
    initialState,
    dashboardStateMachine,
    (initialContext: DashboardContextInterface): DashboardContextInterface => ({
      ...initialContext,
      component: DashboardViewContextual,
      companyId: 'company-123',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string) {
  ;(service.send as SendFunction<string>)({ type })
}

describe('dashboardStateMachine — companyForms', () => {
  it('stays on the forms spoke when the signatory is reassigned from inside it', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_ASSIGN_SIGNATORY_DONE)
    expect(service.machine.current).toBe('companyForms')
  })

  it('surfaces "Documents signed" on leaving after a form was signed', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_UPDATED)
    send(service, componentEvents.COMPANY_DASHBOARD_BACK)
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBe('formsSigned')
  })

  it('ignores the onboarding signature event, which CompanyFormsEditScreen translates', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_SIGN_FORM)
    send(service, componentEvents.COMPANY_DASHBOARD_BACK)

    // Nothing was recorded, so leaving must not claim a form was signed.
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBeNull()
  })
})

describe('dashboardStateMachine — signatory', () => {
  it('ignores the onboarding completion event, which SignatoryEditScreen translates', () => {
    // This is what structurally removes the cross-spoke hazard the companyForms spoke used
    // to guard by omission. company/signatory/assignSignatory/done is raised both by the
    // signatory surface and by DocumentSigner's own assign-signatory step; only saves routed
    // through SignatoryEditScreen raise the management event, so only those return here.
    const service = createService('signatory')
    send(service, componentEvents.COMPANY_ASSIGN_SIGNATORY_DONE)

    expect(service.machine.current).toBe('signatory')
  })

  it('returns to the cards with an alert on the management event', () => {
    const service = createService('signatory')
    send(service, componentEvents.COMPANY_MANAGEMENT_SIGNATORY_UPDATED)

    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBe('signatoryUpdated')
  })
})

describe('dashboardStateMachine — stateTaxes', () => {
  it('stays on the state taxes spoke as states are saved and rates scheduled', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_STATE_TAX_UPDATED)
    send(service, componentEvents.COMPANY_STATE_TAX_RATE_SCHEDULED)
    expect(service.machine.current).toBe('stateTaxes')
  })

  it('surfaces "State tax settings updated" on leaving after a rate was scheduled', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_STATE_TAX_RATE_SCHEDULED)
    send(service, componentEvents.COMPANY_DASHBOARD_BACK)
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBe('stateTaxesUpdated')
  })

  it('returns without an alert when nothing was saved during the visit', () => {
    const service = createService('stateTaxes')
    send(service, componentEvents.COMPANY_DASHBOARD_BACK)
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBeNull()
  })
})
