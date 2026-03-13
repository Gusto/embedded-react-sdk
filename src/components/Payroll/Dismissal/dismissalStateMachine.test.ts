import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { dismissalMachine, dismissalBreadcrumbsNodes } from './dismissalStateMachine'
import type { DismissalFlowContextInterface } from './DismissalFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine() {
  return createMachine(
    'payPeriodSelection',
    dismissalMachine,
    (initialContext: DismissalFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      employeeId: 'test-employee',
      breadcrumbs: buildBreadcrumbs(dismissalBreadcrumbsNodes),
      currentBreadcrumbId: 'payPeriodSelection',
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

describe('dismissalStateMachine', () => {
  describe('payPeriodSelection state', () => {
    it('starts in payPeriodSelection state', () => {
      const service = createService()
      expect(service.machine.current).toBe('payPeriodSelection')
    })

    it('transitions to execution on DISMISSAL_PAY_PERIOD_SELECTED', () => {
      const service = createService()

      send(service, componentEvents.DISMISSAL_PAY_PERIOD_SELECTED, {
        payrollUuid: 'payroll-123',
      })

      expect(service.machine.current).toBe('execution')
      expect(service.context.payrollUuid).toBe('payroll-123')
      expect(service.context.progressBarType).toBeNull()
    })
  })

  describe('execution state', () => {
    function toExecution(service: ReturnType<typeof createService>) {
      send(service, componentEvents.DISMISSAL_PAY_PERIOD_SELECTED, {
        payrollUuid: 'payroll-123',
      })
      expect(service.machine.current).toBe('execution')
    }

    it('transitions back to payPeriodSelection on BREADCRUMB_NAVIGATE with matching key', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'payPeriodSelection' })

      expect(service.machine.current).toBe('payPeriodSelection')
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.progressBarType).toBe('breadcrumbs')
      expect(service.context.currentBreadcrumbId).toBe('payPeriodSelection')
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
