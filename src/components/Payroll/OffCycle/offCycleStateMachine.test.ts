import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { offCycleMachine, offCycleBreadcrumbsNodes } from './offCycleStateMachine'
import type { OffCycleFlowContextInterface } from './OffCycleFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine() {
  return createMachine(
    'createOffCyclePayroll',
    offCycleMachine,
    (initialContext: OffCycleFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
      currentBreadcrumbId: 'createOffCyclePayroll',
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

describe('offCycleStateMachine', () => {
  describe('createOffCyclePayroll state', () => {
    it('starts in createOffCyclePayroll state', () => {
      const service = createService()
      expect(service.machine.current).toBe('createOffCyclePayroll')
    })

    it('transitions to execution on OFF_CYCLE_CREATED', () => {
      const service = createService()

      send(service, componentEvents.OFF_CYCLE_CREATED, { payrollUuid: 'payroll-123' })

      expect(service.machine.current).toBe('execution')
      expect(service.context.payrollUuid).toBe('payroll-123')
      expect(service.context.progressBarType).toBeNull()
    })
  })

  describe('execution state', () => {
    function toExecution(service: ReturnType<typeof createService>) {
      send(service, componentEvents.OFF_CYCLE_CREATED, { payrollUuid: 'payroll-123' })
      expect(service.machine.current).toBe('execution')
    }

    it('transitions back to createOffCyclePayroll on BREADCRUMB_NAVIGATE with matching key', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'createOffCyclePayroll' })

      expect(service.machine.current).toBe('createOffCyclePayroll')
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.progressBarType).toBe('breadcrumbs')
      expect(service.context.currentBreadcrumbId).toBe('createOffCyclePayroll')
    })

    it('ignores BREADCRUMB_NAVIGATE with non-matching key', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'configuration' })

      expect(service.machine.current).toBe('execution')
      expect(service.context.payrollUuid).toBe('payroll-123')
    })
  })
})
