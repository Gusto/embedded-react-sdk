import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { transitionMachine, transitionBreadcrumbsNodes } from './transitionStateMachine'
import {
  TransitionPayrollContextual,
  type TransitionFlowContextInterface,
} from './TransitionFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine() {
  return createMachine(
    'transitionPayroll',
    transitionMachine,
    (initialContext: TransitionFlowContextInterface) => ({
      ...initialContext,
      component: TransitionPayrollContextual,
      companyId: 'test-company',
      startDate: '2025-08-14',
      endDate: '2025-08-27',
      payScheduleUuid: 'schedule-uuid-1',
      withReimbursements: true,
      withOffcyclePayroll: true,
      header: {
        type: 'breadcrumbs' as const,
        breadcrumbs: buildBreadcrumbs(transitionBreadcrumbsNodes),
        currentBreadcrumbId: 'createTransitionPayroll',
      },
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

function currentBreadcrumbId(service: ReturnType<typeof createService>) {
  const { header } = service.context
  return header?.type === 'breadcrumbs' ? header.currentBreadcrumbId : undefined
}

describe('transitionMachine', () => {
  it('starts on the transitionPayroll entry state', () => {
    const service = createService()
    expect(service.machine.current).toBe('transitionPayroll')
  })

  describe('TRANSITION_CREATED', () => {
    it('records the created payrollUuid and flips the active breadcrumb to configuration while staying on the entry node', () => {
      const service = createService()

      send(service, componentEvents.TRANSITION_CREATED, { payrollUuid: 'payroll-123' })

      expect(service.machine.current).toBe('transitionPayroll')
      expect(service.context.payrollUuid).toBe('payroll-123')
      expect(currentBreadcrumbId(service)).toBe('configuration')
    })

    it('preserves the transition pay-period context through the transition', () => {
      const service = createService()

      send(service, componentEvents.TRANSITION_CREATED, { payrollUuid: 'payroll-123' })

      expect(service.context.startDate).toBe('2025-08-14')
      expect(service.context.endDate).toBe('2025-08-27')
      expect(service.context.payScheduleUuid).toBe('schedule-uuid-1')
    })
  })

  describe('bubbled configuration events route into the shared execution states', () => {
    it('routes runPayroll/calculated to overview', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollUuid: 'payroll-123',
        payPeriod: { startDate: '2025-08-14', endDate: '2025-08-27' },
      })

      expect(service.machine.current).toBe('overview')
      expect(currentBreadcrumbId(service)).toBe('overview')
    })

    it('routes runPayroll/employee/edit to editEmployee', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
        employeeId: 'emp-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
      })

      expect(service.machine.current).toBe('editEmployee')
      expect(service.context.employeeId).toBe('emp-1')
    })

    it('routes runPayroll/blockers/viewAll to blockers', () => {
      const service = createService()

      send(service, componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)

      expect(service.machine.current).toBe('blockers')
    })
  })

  it('keeps the Transition Payroll crumb as a display-only ancestor across execution trails', () => {
    const trails = buildBreadcrumbs(transitionBreadcrumbsNodes)

    for (const stateKey of ['configuration', 'overview', 'editEmployee', 'receipts', 'blockers']) {
      const trail = trails[stateKey]!
      expect(trail[0]).toMatchObject({ id: 'createTransitionPayroll' })
      // Display-only: the ancestor crumb is not navigable.
      expect(trail[0]!.onNavigate).toBeUndefined()
    }
  })

  it('ignores unrelated events on the entry state', () => {
    const service = createService()

    send(service, componentEvents.OFF_CYCLE_CREATED, { payrollUuid: 'payroll-123' })

    expect(service.machine.current).toBe('transitionPayroll')
  })
})
