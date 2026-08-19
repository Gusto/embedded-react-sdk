import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from '@/lib/state-machine'
import { deductionsMachine } from './stateMachine'
import type { DeductionsContextInterface } from './deductionsContextualComponents'
import { componentEvents } from '@/shared/constants'

function createTestMachine() {
  return createMachine('list', deductionsMachine, (initialContext: DeductionsContextInterface) => ({
    ...initialContext,
    component: () => null,
    employeeId: 'test-employee',
  }))
}

function createService() {
  const machine = createTestMachine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('deductionsMachine', () => {
  // Regression test for SDK-1169: `done` used to be a final state (no
  // transitions out) reached from `list` on EMPLOYEE_DEDUCTION_DONE. A host that kept
  // this component mounted past that signal was left with a deductions list whose
  // Add/Edit controls could never fire another transition. EMPLOYEE_DEDUCTION_DONE now
  // has no transition at all: the machine stays in `list`, and Flow re-emits the event
  // to the parent regardless.
  it('SDK-1169: keeps handling EMPLOYEE_DEDUCTION_ADD/EMPLOYEE_DEDUCTION_EDIT after DONE fires', () => {
    const service = createService()

    send(service, componentEvents.EMPLOYEE_DEDUCTION_DONE)
    expect(service.machine.current).toBe('list')

    send(service, componentEvents.EMPLOYEE_DEDUCTION_ADD)
    expect(service.machine.current).toBe('form')

    send(service, componentEvents.EMPLOYEE_DEDUCTION_CANCEL)
    expect(service.machine.current).toBe('list')

    send(service, componentEvents.EMPLOYEE_DEDUCTION_DONE)
    expect(service.machine.current).toBe('list')

    send(service, componentEvents.EMPLOYEE_DEDUCTION_EDIT, { uuid: 'deduction-2' })
    expect(service.machine.current).toBe('form')
    expect(service.context.editingDeductionId).toBe('deduction-2')
  })
})
