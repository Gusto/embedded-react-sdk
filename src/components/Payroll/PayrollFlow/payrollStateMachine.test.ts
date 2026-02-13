import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { payrollFlowMachine, payrollFlowBreadcrumbsNodes } from './payrollStateMachine'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine() {
  return createMachine(
    'landing',
    payrollFlowMachine,
    (initialContext: PayrollFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      progressBarType: null,
      breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
      currentBreadcrumbId: 'landing',
      progressBarCta: null,
      withReimbursements: true,
    }),
  )
}

function createService() {
  const machine = createTestMachine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = interpret(machine, () => {}, {} as any)
  return service
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('payrollFlowMachine', () => {
  describe('landing state', () => {
    it('transitions to execution on RUN_PAYROLL_SELECTED', () => {
      const service = createService()
      expect(service.machine.current).toBe('landing')

      send(service, componentEvents.RUN_PAYROLL_SELECTED, {
        payrollUuid: 'payroll-123',
      })

      expect(service.machine.current).toBe('execution')
      expect(service.context.payrollUuid).toBe('payroll-123')
      expect(service.context.executionInitialState).toBe('configuration')
      expect(service.context.showPayrollCancelledAlert).toBe(false)
    })

    it('transitions to execution on REVIEW_PAYROLL with overview initial state', () => {
      const service = createService()

      send(service, componentEvents.REVIEW_PAYROLL, {
        payrollUuid: 'payroll-456',
      })

      expect(service.machine.current).toBe('execution')
      expect(service.context.payrollUuid).toBe('payroll-456')
      expect(service.context.executionInitialState).toBe('overview')
    })

    it('transitions to blockers on RUN_PAYROLL_BLOCKERS_VIEW_ALL', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)

      expect(service.machine.current).toBe('blockers')
      expect(service.context.progressBarType).toBe('breadcrumbs')
      expect(service.context.showPayrollCancelledAlert).toBe(false)
    })

    it('clears showPayrollCancelledAlert on RUN_PAYROLL_CANCELLED_ALERT_DISMISSED', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_SELECTED, {
        payrollUuid: 'payroll-123',
      })
      send(service, componentEvents.RUN_PAYROLL_CANCELLED)
      expect(service.context.showPayrollCancelledAlert).toBe(true)

      send(service, componentEvents.RUN_PAYROLL_CANCELLED_ALERT_DISMISSED)
      expect(service.machine.current).toBe('landing')
      expect(service.context.showPayrollCancelledAlert).toBe(false)
    })
  })

  describe('execution state', () => {
    function toExecution(service: ReturnType<typeof createService>) {
      send(service, componentEvents.RUN_PAYROLL_SELECTED, {
        payrollUuid: 'payroll-123',
      })
      expect(service.machine.current).toBe('execution')
    }

    it('transitions to landing on PAYROLL_EXIT_FLOW', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.PAYROLL_EXIT_FLOW)

      expect(service.machine.current).toBe('landing')
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.executionInitialState).toBeUndefined()
      expect(service.context.progressBarType).toBeNull()
    })

    it('transitions to landing with alert on RUN_PAYROLL_CANCELLED', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.RUN_PAYROLL_CANCELLED)

      expect(service.machine.current).toBe('landing')
      expect(service.context.showPayrollCancelledAlert).toBe(true)
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.executionInitialState).toBeUndefined()
    })

    it('transitions to submittedOverview on RUN_PAYROLL_PROCESSED with payPeriod from event', () => {
      const service = createService()
      toExecution(service)
      const payPeriod = { startDate: '2026-01-01', endDate: '2026-01-15' }

      send(service, componentEvents.RUN_PAYROLL_PROCESSED, { payPeriod })

      expect(service.machine.current).toBe('submittedOverview')
      expect(service.context.payPeriod).toEqual(payPeriod)
      expect(service.context.executionInitialState).toBeUndefined()
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('transitions to landing on BREADCRUMB_NAVIGATE with landing key', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'landing' })

      expect(service.machine.current).toBe('landing')
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.executionInitialState).toBeUndefined()
    })

    it('ignores BREADCRUMB_NAVIGATE with non-landing key', () => {
      const service = createService()
      toExecution(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'configuration' })

      expect(service.machine.current).toBe('execution')
    })
  })

  describe('submittedOverview state', () => {
    function toSubmittedOverview(service: ReturnType<typeof createService>) {
      send(service, componentEvents.RUN_PAYROLL_SELECTED, {
        payrollUuid: 'payroll-123',
      })
      send(service, componentEvents.RUN_PAYROLL_PROCESSED, {
        payPeriod: { startDate: '2026-01-01', endDate: '2026-01-15' },
      })
      expect(service.machine.current).toBe('submittedOverview')
    }

    it('transitions to submittedReceipts on RUN_PAYROLL_RECEIPT_GET', () => {
      const service = createService()
      toSubmittedOverview(service)

      send(service, componentEvents.RUN_PAYROLL_RECEIPT_GET)

      expect(service.machine.current).toBe('submittedReceipts')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('transitions to landing with alert on RUN_PAYROLL_CANCELLED', () => {
      const service = createService()
      toSubmittedOverview(service)

      send(service, componentEvents.RUN_PAYROLL_CANCELLED)

      expect(service.machine.current).toBe('landing')
      expect(service.context.showPayrollCancelledAlert).toBe(true)
    })

    it('transitions to landing on PAYROLL_EXIT_FLOW', () => {
      const service = createService()
      toSubmittedOverview(service)

      send(service, componentEvents.PAYROLL_EXIT_FLOW)

      expect(service.machine.current).toBe('landing')
    })
  })

  describe('submittedReceipts state', () => {
    it('transitions to landing on PAYROLL_EXIT_FLOW', () => {
      const service = createService()
      send(service, componentEvents.RUN_PAYROLL_SELECTED, {
        payrollUuid: 'payroll-123',
      })
      send(service, componentEvents.RUN_PAYROLL_PROCESSED, {
        payPeriod: { startDate: '2026-01-01', endDate: '2026-01-15' },
      })
      send(service, componentEvents.RUN_PAYROLL_RECEIPT_GET)
      expect(service.machine.current).toBe('submittedReceipts')

      send(service, componentEvents.PAYROLL_EXIT_FLOW)

      expect(service.machine.current).toBe('landing')
    })
  })

  describe('blockers state', () => {
    it('transitions to landing on PAYROLL_EXIT_FLOW', () => {
      const service = createService()
      send(service, componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
      expect(service.machine.current).toBe('blockers')

      send(service, componentEvents.PAYROLL_EXIT_FLOW)

      expect(service.machine.current).toBe('landing')
    })
  })
})
