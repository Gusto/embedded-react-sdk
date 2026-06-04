import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { dashboardStateMachine } from './dashboardStateMachine'
import { DashboardViewContextual, type DashboardContextInterface } from './DashboardComponents'
import { componentEvents } from '@/shared/constants'

type DashboardState = keyof typeof dashboardStateMachine

function createService(initialState: DashboardState = 'index') {
  const machine = createMachine(
    initialState,
    dashboardStateMachine,
    (initialContext: DashboardContextInterface): DashboardContextInterface => ({
      ...initialContext,
      component: DashboardViewContextual,
      employeeId: 'employee-123',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('dashboardStateMachine — documentManager', () => {
  it('enters documentManager from index on EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED', () => {
    const service = createService('index')
    send(service, componentEvents.EMPLOYEE_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED, {
      employeeId: 'employee-123',
      formId: 'form-1',
    })
    expect(service.machine.current).toBe('documentManager')
    expect(service.context.formId).toBe('form-1')
  })

  it('returns to index with a documentSigned alert when the form is signed (SDK-946)', () => {
    const service = createService('documentManager')
    send(service, componentEvents.EMPLOYEE_SIGN_FORM, { uuid: 'form-1' })
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBe('documentSigned')
  })

  it('returns to index without an alert on CANCEL', () => {
    const service = createService('documentManager')
    send(service, componentEvents.CANCEL)
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBeNull()
  })
})
