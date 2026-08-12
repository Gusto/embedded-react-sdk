import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from '@/lib/state-machine'
import { compensationStateMachine } from './compensationStateMachine'
import type { CompensationFlowContextInterface } from './CompensationFlowComponents'
import { componentEvents } from '@/shared/constants'

function createTestMachine() {
  return createMachine(
    'viewJobs',
    compensationStateMachine,
    (initialContext: CompensationFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      employeeId: 'test-employee',
      startDate: '2024-12-24',
      currentJobId: null,
    }),
  )
}

function createService() {
  const machine = createTestMachine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('compensationStateMachine', () => {
  // Regression test for SDK-1169: Add new job/Edit silently stopped navigating after
  // leaving and returning to a still-mounted Compensation component. `done` used to be
  // a final state (no transitions out), so once EMPLOYEE_COMPENSATION_DONE
  // fired, every subsequent event was a no-op and the machine could
  // never advance. EMPLOYEE_COMPENSATION_DONE now has no transition at all: the
  // machine stays in `viewJobs`, and Flow re-emits the event to the parent regardless.
  it('SDK-1169: keeps handling EMPLOYEE_JOB_ADD/EMPLOYEE_JOB_EDIT after DONE fires', () => {
    const service = createService()

    send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)
    expect(service.machine.current).toBe('viewJobs')

    send(service, componentEvents.EMPLOYEE_JOB_ADD)
    expect(service.machine.current).toBe('editJob')

    send(service, componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST)
    expect(service.machine.current).toBe('viewJobs')

    send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)
    expect(service.machine.current).toBe('viewJobs')

    send(service, componentEvents.EMPLOYEE_JOB_EDIT, { uuid: 'job-2' })
    expect(service.machine.current).toBe('editJob')
    expect(service.context.currentJobId).toBe('job-2')
  })
})
