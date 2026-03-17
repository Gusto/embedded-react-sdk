import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { transitionMachine, transitionBreadcrumbsNodes } from './transitionStateMachine'
import type { TransitionFlowContextInterface } from './TransitionFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine() {
  return createMachine(
    'createTransitionPayroll',
    transitionMachine,
    (initialContext: TransitionFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      startDate: '2025-08-14',
      endDate: '2025-08-27',
      payScheduleUuid: 'schedule-uuid-1',
      breadcrumbs: buildBreadcrumbs(transitionBreadcrumbsNodes),
      currentBreadcrumbId: 'createTransitionPayroll',
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

describe('transitionStateMachine', () => {
  describe('createTransitionPayroll state', () => {
    it('starts in createTransitionPayroll state', () => {
      const service = createService()
      expect(service.machine.current).toBe('createTransitionPayroll')
    })

    it('transitions to execution on TRANSITION_CREATED', () => {
      const service = createService()

      send(service, componentEvents.TRANSITION_CREATED, { payrollUuid: 'payroll-123' })

      expect(service.machine.current).toBe('execution')
      expect(service.context.payrollUuid).toBe('payroll-123')
      expect(service.context.progressBarType).toBeNull()
    })

    it('preserves flow context (startDate, endDate, payScheduleUuid) through transition', () => {
      const service = createService()

      send(service, componentEvents.TRANSITION_CREATED, { payrollUuid: 'payroll-123' })

      expect(service.context.startDate).toBe('2025-08-14')
      expect(service.context.endDate).toBe('2025-08-27')
      expect(service.context.payScheduleUuid).toBe('schedule-uuid-1')
    })

    it('does not transition on unrelated events', () => {
      const service = createService()

      send(service, componentEvents.OFF_CYCLE_CREATED, { payrollUuid: 'payroll-123' })

      expect(service.machine.current).toBe('createTransitionPayroll')
    })
  })

  describe('execution state', () => {
    function toExecution(service: ReturnType<typeof createService>) {
      send(service, componentEvents.TRANSITION_CREATED, { payrollUuid: 'payroll-123' })
      expect(service.machine.current).toBe('execution')
    }

    it('transitions back to createTransitionPayroll on BREADCRUMB_NAVIGATE with matching key', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'createTransitionPayroll' })

      expect(service.machine.current).toBe('createTransitionPayroll')
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.progressBarType).toBe('breadcrumbs')
      expect(service.context.currentBreadcrumbId).toBe('createTransitionPayroll')
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
