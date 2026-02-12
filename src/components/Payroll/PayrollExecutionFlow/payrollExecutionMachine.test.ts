import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import {
  payrollExecutionMachine,
  payrollExecutionBreadcrumbsNodes,
} from './payrollExecutionMachine'
import type { PayrollFlowContextInterface } from '../PayrollFlow/PayrollFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine(initialState: 'configuration' | 'overview' = 'configuration') {
  return createMachine(
    initialState,
    payrollExecutionMachine,
    (initialContext: PayrollFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      payrollUuid: 'payroll-123',
      progressBarType: 'breadcrumbs' as const,
      breadcrumbs: buildBreadcrumbs(payrollExecutionBreadcrumbsNodes),
      currentBreadcrumbId: initialState,
      progressBarCta: null,
      withReimbursements: true,
    }),
  )
}

function createService(initialState: 'configuration' | 'overview' = 'configuration') {
  const machine = createTestMachine(initialState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('payrollExecutionMachine', () => {
  describe('configuration state', () => {
    it('starts in configuration by default', () => {
      const service = createService()
      expect(service.machine.current).toBe('configuration')
    })

    it('transitions to overview on RUN_PAYROLL_CALCULATED', () => {
      const service = createService()
      const payPeriod = { startDate: '2026-01-01', endDate: '2026-01-15' }

      send(service, componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollUuid: 'payroll-123',
        payPeriod,
      })

      expect(service.machine.current).toBe('overview')
      expect(service.context.payPeriod).toEqual(payPeriod)
    })

    it('transitions to editEmployee on RUN_PAYROLL_EMPLOYEE_EDIT', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
        employeeId: 'emp-1',
        firstName: 'Jane',
        lastName: 'Doe',
      })

      expect(service.machine.current).toBe('editEmployee')
      expect(service.context.employeeId).toBe('emp-1')
      expect(service.context.firstName).toBe('Jane')
      expect(service.context.lastName).toBe('Doe')
    })

    it('stays in configuration and sets payPeriod on RUN_PAYROLL_DATA_READY', () => {
      const service = createService()
      const payPeriod = { startDate: '2026-02-01', endDate: '2026-02-15' }

      send(service, componentEvents.RUN_PAYROLL_DATA_READY, { payPeriod })

      expect(service.machine.current).toBe('configuration')
      expect(service.context.payPeriod).toEqual(payPeriod)
    })

    it('transitions to blockers on RUN_PAYROLL_BLOCKERS_VIEW_ALL', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)

      expect(service.machine.current).toBe('blockers')
    })
  })

  describe('overview state', () => {
    function toOverview(service: ReturnType<typeof createService>) {
      send(service, componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollUuid: 'payroll-123',
        payPeriod: { startDate: '2026-01-01', endDate: '2026-01-15' },
      })
      expect(service.machine.current).toBe('overview')
    }

    it('can start directly in overview state', () => {
      const service = createService('overview')
      expect(service.machine.current).toBe('overview')
    })

    it('transitions to configuration on RUN_PAYROLL_EDIT', () => {
      const service = createService()
      toOverview(service)

      send(service, componentEvents.RUN_PAYROLL_EDIT)

      expect(service.machine.current).toBe('configuration')
    })

    it('transitions to receipts on RUN_PAYROLL_RECEIPT_GET', () => {
      const service = createService()
      toOverview(service)

      send(service, componentEvents.RUN_PAYROLL_RECEIPT_GET)

      expect(service.machine.current).toBe('receipts')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('does not handle RUN_PAYROLL_PROCESSED (bubbles to parent)', () => {
      const service = createService()
      toOverview(service)

      send(service, componentEvents.RUN_PAYROLL_PROCESSED)

      expect(service.machine.current).toBe('overview')
    })

    it('does not handle PAYROLL_EXIT_FLOW (bubbles to parent)', () => {
      const service = createService()
      toOverview(service)

      send(service, componentEvents.PAYROLL_EXIT_FLOW)

      expect(service.machine.current).toBe('overview')
    })

    it('does not handle RUN_PAYROLL_CANCELLED (bubbles to parent)', () => {
      const service = createService()
      toOverview(service)

      send(service, componentEvents.RUN_PAYROLL_CANCELLED)

      expect(service.machine.current).toBe('overview')
    })
  })

  describe('editEmployee state', () => {
    function toEditEmployee(service: ReturnType<typeof createService>) {
      send(service, componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
        employeeId: 'emp-1',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      expect(service.machine.current).toBe('editEmployee')
    }

    it('transitions to configuration on RUN_PAYROLL_EMPLOYEE_SAVED', () => {
      const service = createService()
      toEditEmployee(service)

      send(service, componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED)

      expect(service.machine.current).toBe('configuration')
      expect(service.context.employeeId).toBeUndefined()
      expect(service.context.firstName).toBeUndefined()
      expect(service.context.lastName).toBeUndefined()
    })

    it('transitions to configuration on RUN_PAYROLL_EMPLOYEE_CANCELLED', () => {
      const service = createService()
      toEditEmployee(service)

      send(service, componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)

      expect(service.machine.current).toBe('configuration')
      expect(service.context.employeeId).toBeUndefined()
    })
  })

  describe('full execution flow', () => {
    it('supports the complete happy path: configuration -> overview -> receipts', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollUuid: 'payroll-123',
        payPeriod: { startDate: '2026-01-01', endDate: '2026-01-15' },
      })
      expect(service.machine.current).toBe('overview')

      send(service, componentEvents.RUN_PAYROLL_RECEIPT_GET)
      expect(service.machine.current).toBe('receipts')
    })

    it('supports editing then returning to configuration', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollUuid: 'payroll-123',
        payPeriod: { startDate: '2026-01-01', endDate: '2026-01-15' },
      })
      expect(service.machine.current).toBe('overview')

      send(service, componentEvents.RUN_PAYROLL_EDIT)
      expect(service.machine.current).toBe('configuration')
    })
  })
})
