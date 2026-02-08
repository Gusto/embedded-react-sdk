import { describe, it, expect } from 'vitest'
import { createMachine, interpret } from 'robot3'
import { offCycleMachine } from './offCycleStateMachine'
import { componentEvents } from '@/shared/constants'
import type { OffCycleFlowContextInterface } from './OffCycleFlowComponents'

describe('offCycleStateMachine', () => {
  const createInitialContext = (): OffCycleFlowContextInterface => ({
    companyId: 'test-company-id',
    component: null,
    onEvent: () => {},
  })

  const createTestMachine = () => {
    return createMachine('createOffCyclePayroll', offCycleMachine, createInitialContext)
  }

  const runMachine = (events: Array<{ type: string; payload?: unknown }>) => {
    const machine = createTestMachine()
    const service = interpret(machine, () => {})
    events.forEach(event => service.send(event))
    return { state: service.machine.current, context: service.context }
  }

  describe('Flow States', () => {
    it('starts in createOffCyclePayroll state', () => {
      const machine = createTestMachine()
      const service = interpret(machine, () => {})
      expect(service.machine.current).toBe('createOffCyclePayroll')
    })

    it('transitions from createOffCyclePayroll to done on CREATED', () => {
      const { state } = runMachine([
        { type: componentEvents.OFF_CYCLE_CREATED, payload: { payrollUuid: 'payroll-123' } },
      ])
      expect(state).toBe('done')
    })
  })
})
