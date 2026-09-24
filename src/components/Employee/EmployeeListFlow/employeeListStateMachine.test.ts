import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { employeeListStateMachine } from './employeeListStateMachine'
import type { EmployeeListFlowContextInterface } from './EmployeeListFlowComponents'
import { componentEvents } from '@/shared/constants'

type EmployeeListState = 'list' | 'dashboard' | 'terminate' | 'onboard'

function createService(initialState: EmployeeListState = 'list') {
  const machine = createMachine(
    initialState,
    employeeListStateMachine,
    (initialContext: EmployeeListFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'company-123',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('employeeListStateMachine', () => {
  it('transitions from list to terminate on EMPLOYEE_DISMISS', () => {
    const service = createService()
    send(service, componentEvents.EMPLOYEE_DISMISS, { employeeId: 'employee-123' })
    expect(service.machine.current).toBe('terminate')
  })

  it('returns to list when the offboarding payroll is exited', () => {
    const service = createService('terminate')
    send(service, componentEvents.PAYROLL_EXIT_FLOW)
    expect(service.machine.current).toBe('list')
    expect(service.context.employeeId).toBeUndefined()
  })

  it('returns to list when the offboarding payroll is cancelled', () => {
    const service = createService('terminate')
    send(service, componentEvents.RUN_PAYROLL_CANCELLED)
    expect(service.machine.current).toBe('list')
    expect(service.context.employeeId).toBeUndefined()
  })

  it('returns to list on EMPLOYEE_RETURN_TO_LIST', () => {
    const service = createService('terminate')
    send(service, componentEvents.EMPLOYEE_RETURN_TO_LIST)
    expect(service.machine.current).toBe('list')
  })

  it('returns to list when dismissal is cancelled from the termination form', () => {
    const service = createService('terminate')
    send(service, componentEvents.CANCEL)
    expect(service.machine.current).toBe('list')
    expect(service.context.employeeId).toBeUndefined()
  })
})
