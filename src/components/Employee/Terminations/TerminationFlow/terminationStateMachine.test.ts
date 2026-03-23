import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { terminationMachine, terminationBreadcrumbNodes } from './terminationStateMachine'
import type { TerminationFlowContextInterface } from './TerminationFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

type TerminationState = 'form' | 'summary' | 'dismissalPayroll'

function createTestMachine(initialState: TerminationState = 'form') {
  return createMachine(
    initialState,
    terminationMachine,
    (initialContext: TerminationFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'company-123',
      employeeId: 'employee-123',
      progressBarType: 'breadcrumbs' as const,
      breadcrumbs: buildBreadcrumbs(terminationBreadcrumbNodes),
      currentBreadcrumbId: initialState,
    }),
  )
}

function createService(initialState: TerminationState = 'form') {
  const machine = createTestMachine(initialState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

function toSummary(service: ReturnType<typeof createService>) {
  send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
    employeeId: 'employee-123',
    effectiveDate: '2026-03-15',
    payrollOption: 'dismissalPayroll',
    payrollUuid: 'payroll-123',
  })
  expect(service.machine.current).toBe('summary')
}

function toDismissalPayroll(service: ReturnType<typeof createService>) {
  toSummary(service)
  send(service, componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL, {
    employeeId: 'employee-123',
    companyId: 'company-123',
    payrollUuid: 'payroll-123',
  })
  expect(service.machine.current).toBe('dismissalPayroll')
}

describe('terminationStateMachine', () => {
  describe('form state', () => {
    it('starts in form by default', () => {
      const service = createService()
      expect(service.machine.current).toBe('form')
    })

    it('transitions to summary on EMPLOYEE_TERMINATION_DONE', () => {
      const service = createService()

      send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId: 'employee-123',
        effectiveDate: '2026-03-15',
        payrollOption: 'dismissalPayroll',
        payrollUuid: 'payroll-123',
      })

      expect(service.machine.current).toBe('summary')
      expect(service.context.payrollOption).toBe('dismissalPayroll')
      expect(service.context.payrollUuid).toBe('payroll-123')
      expect(service.context.currentBreadcrumbId).toBe('summary')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to summary on EMPLOYEE_TERMINATION_VIEW_SUMMARY', () => {
      const service = createService()

      send(service, componentEvents.EMPLOYEE_TERMINATION_VIEW_SUMMARY, {
        employeeId: 'employee-123',
        effectiveDate: '2026-03-15',
      })

      expect(service.machine.current).toBe('summary')
      expect(service.context.payrollOption).toBeUndefined()
      expect(service.context.currentBreadcrumbId).toBe('summary')
      expect(service.context.alerts).toBeUndefined()
    })
  })

  describe('summary state', () => {
    it('transitions to form on EMPLOYEE_TERMINATION_EDIT', () => {
      const service = createService()
      toSummary(service)

      send(service, componentEvents.EMPLOYEE_TERMINATION_EDIT, {
        employeeId: 'employee-123',
      })

      expect(service.machine.current).toBe('form')
      expect(service.context.currentBreadcrumbId).toBe('form')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to form on EMPLOYEE_TERMINATION_CANCELLED', () => {
      const service = createService()
      toSummary(service)

      send(service, componentEvents.EMPLOYEE_TERMINATION_CANCELLED, {
        employeeId: 'employee-123',
        alert: { type: 'success', title: 'Cancelled' },
      })

      expect(service.machine.current).toBe('form')
      expect(service.context.currentBreadcrumbId).toBe('form')
      expect(service.context.payrollOption).toBeUndefined()
      expect(service.context.alerts).toEqual([{ type: 'success', title: 'Cancelled' }])
    })

    it('transitions to dismissalPayroll on EMPLOYEE_TERMINATION_RUN_PAYROLL', () => {
      const service = createService()
      toSummary(service)

      send(service, componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL, {
        employeeId: 'employee-123',
        companyId: 'company-123',
        payrollUuid: 'payroll-456',
      })

      expect(service.machine.current).toBe('dismissalPayroll')
      expect(service.context.payrollUuid).toBe('payroll-456')
      expect(service.context.progressBarType).toBeNull()
    })

    it('uses existing payrollUuid when event payload has none', () => {
      const service = createService()
      toSummary(service)

      send(service, componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL, {
        employeeId: 'employee-123',
        companyId: 'company-123',
      })

      expect(service.machine.current).toBe('dismissalPayroll')
      expect(service.context.payrollUuid).toBe('payroll-123')
    })

    it('transitions to dismissalPayroll on EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL', () => {
      const service = createService()
      toSummary(service)

      send(service, componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL, {
        employeeId: 'employee-123',
        companyId: 'company-123',
      })

      expect(service.machine.current).toBe('dismissalPayroll')
      expect(service.context.payrollUuid).toBeUndefined()
      expect(service.context.progressBarType).toBeNull()
    })

    it('navigates to form via breadcrumb', () => {
      const service = createService()
      toSummary(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'form' })

      expect(service.machine.current).toBe('form')
      expect(service.context.currentBreadcrumbId).toBe('form')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })
  })

  describe('dismissalPayroll state', () => {
    it('transitions to summary on PAYROLL_EXIT_FLOW', () => {
      const service = createService()
      toDismissalPayroll(service)

      send(service, componentEvents.PAYROLL_EXIT_FLOW)

      expect(service.machine.current).toBe('summary')
      expect(service.context.currentBreadcrumbId).toBe('summary')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('navigates to summary via breadcrumb', () => {
      const service = createService()
      toDismissalPayroll(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'summary' })

      expect(service.machine.current).toBe('summary')
      expect(service.context.currentBreadcrumbId).toBe('summary')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('navigates to form via breadcrumb', () => {
      const service = createService()
      toDismissalPayroll(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'form' })

      expect(service.machine.current).toBe('form')
      expect(service.context.currentBreadcrumbId).toBe('form')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })
  })

  describe('full termination flow', () => {
    it('supports form -> summary -> edit -> form -> summary', () => {
      const service = createService()

      send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId: 'employee-123',
        effectiveDate: '2026-03-15',
        payrollOption: 'dismissalPayroll',
      })
      expect(service.machine.current).toBe('summary')

      send(service, componentEvents.EMPLOYEE_TERMINATION_EDIT, {
        employeeId: 'employee-123',
      })
      expect(service.machine.current).toBe('form')

      send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId: 'employee-123',
        effectiveDate: '2026-04-01',
        payrollOption: 'regularPayroll',
      })
      expect(service.machine.current).toBe('summary')
      expect(service.context.payrollOption).toBe('regularPayroll')
    })

    it('supports form -> summary -> dismissalPayroll -> save and exit -> summary', () => {
      const service = createService()

      send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId: 'employee-123',
        effectiveDate: '2026-03-15',
        payrollOption: 'dismissalPayroll',
        payrollUuid: 'payroll-123',
      })
      expect(service.machine.current).toBe('summary')

      send(service, componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL, {
        employeeId: 'employee-123',
        companyId: 'company-123',
        payrollUuid: 'payroll-123',
      })
      expect(service.machine.current).toBe('dismissalPayroll')

      send(service, componentEvents.PAYROLL_EXIT_FLOW)
      expect(service.machine.current).toBe('summary')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('supports form -> summary -> off-cycle payroll -> save and exit -> summary', () => {
      const service = createService()

      send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId: 'employee-123',
        effectiveDate: '2026-03-15',
        payrollOption: 'anotherWay',
        payrollUuid: 'payroll-123',
      })
      expect(service.machine.current).toBe('summary')

      send(service, componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL, {
        employeeId: 'employee-123',
        companyId: 'company-123',
      })
      expect(service.machine.current).toBe('dismissalPayroll')
      expect(service.context.payrollUuid).toBeUndefined()

      send(service, componentEvents.PAYROLL_EXIT_FLOW)
      expect(service.machine.current).toBe('summary')
      expect(service.context.progressBarType).toBe('breadcrumbs')
    })

    it('supports form -> summary -> cancel -> form with alert', () => {
      const service = createService()

      send(service, componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId: 'employee-123',
        effectiveDate: '2026-03-15',
        payrollOption: 'dismissalPayroll',
      })
      expect(service.machine.current).toBe('summary')

      send(service, componentEvents.EMPLOYEE_TERMINATION_CANCELLED, {
        employeeId: 'employee-123',
        alert: { type: 'success', title: 'Termination cancelled' },
      })
      expect(service.machine.current).toBe('form')
      expect(service.context.alerts).toEqual([{ type: 'success', title: 'Termination cancelled' }])
      expect(service.context.payrollOption).toBeUndefined()
    })
  })
})
