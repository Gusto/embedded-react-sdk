import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
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
  it('reaches the final done state on EMPLOYEE_COMPENSATION_DONE from viewJobs', () => {
    const service = createService()

    send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)

    expect(service.machine.current).toBe('done')
  })

  // Regression test for SDK-1169: Add new job/Edit silently stopped navigating after
  // leaving and returning to a still-mounted Compensation component. Root cause:
  // `done` is a robot3 final state (no transitions out), so if the host doesn't
  // unmount Compensation once EMPLOYEE_COMPENSATION_DONE fires, every subsequent
  // event is a documented robot3 no-op and the machine can never advance.
  it('SDK-1169: drops EMPLOYEE_JOB_ADD/EMPLOYEE_JOB_EDIT once DONE has fired, if the machine keeps running', () => {
    const service = createService()

    send(service, componentEvents.EMPLOYEE_JOB_ADD)
    expect(service.machine.current).toBe('editJob')

    send(service, componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST)
    expect(service.machine.current).toBe('viewJobs')

    send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)
    expect(service.machine.current).toBe('done')

    send(service, componentEvents.EMPLOYEE_JOB_ADD)
    expect(service.machine.current).toBe('done')

    send(service, componentEvents.EMPLOYEE_JOB_EDIT, { uuid: 'job-2' })
    expect(service.machine.current).toBe('done')
  })

  it('SDK-1169: clears the rendered component once DONE fires, so a still-mounted host renders nothing rather than a dead jobs list', () => {
    const service = createService()

    send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)

    expect(service.machine.current).toBe('done')
    expect(service.context.component).toBeNull()
  })
})
