import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { dashboardStateMachine } from './dashboardStateMachine'
import { DashboardViewContextual, type DashboardContextInterface } from './DashboardComponents'
import { componentEvents } from '@/shared/constants'

function createService() {
  const machine = createMachine(
    'companyForms',
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
    send(service, componentEvents.COMPANY_SIGN_FORM)
    send(service, componentEvents.COMPANY_DASHBOARD_BACK)
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBe('formsSigned')
  })
})
