import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { onboardingExecutionMachine } from './onboardingExecutionStateMachine'
import type { OnboardingContextInterface } from './OnboardingExecutionFlowComponents'
import { ProfileContextual } from '@/components/Employee/Profile/onboarding/Profile'
import { CompensationContextual } from '@/components/Employee/Compensation'
import { PaymentMethodContextual } from '@/components/Employee/PaymentMethod'
import { OnboardingSummaryContextual } from '@/components/Employee/OnboardingSummary'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import type { BackConfig } from '@/components/Flow/useFlow'

type State = keyof typeof onboardingExecutionMachine

function createService(
  initialState: State = 'employeeProfile',
  contextOverrides: Partial<OnboardingContextInterface> = {},
) {
  const machine = createMachine(
    initialState,
    onboardingExecutionMachine,
    (initialContext: OnboardingContextInterface) => ({
      ...initialContext,
      component: ProfileContextual,
      header: null,
      companyId: 'company-123',
      employeeId: 'employee-456',
      ...contextOverrides,
    }),
  )
  return interpret(machine, () => {})
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

const stepHeader = (currentStep: number, totalSteps: number, backLabelKey?: string) => ({
  indicator: 'progress',
  currentStep,
  totalSteps,
  ...(backLabelKey && {
    back: {
      labelKey: backLabelKey,
      namespace: 'Employee.OnboardingExecutionFlow',
      event: componentEvents.EMPLOYEE_ONBOARDING_BACK,
    },
  }),
})

describe('onboardingExecutionMachine back navigation', () => {
  describe('header configuration', () => {
    it('starts with no header on employeeProfile (test-only initial context bypasses production initial header builder)', () => {
      const service = createService('employeeProfile')

      expect(service.machine.current).toBe('employeeProfile')
      expect(service.context.header).toBeNull()
    })

    it('builds a step 2 of 6 progress header on compensation labeled with employeeProfile', () => {
      const service = createService('employeeProfile')

      send(service, componentEvents.EMPLOYEE_PROFILE_DONE, {
        uuid: 'employee-456',
        onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
        startDate: '2026-01-01',
      })

      expect(service.machine.current).toBe('compensation')
      expect(service.context.header).toEqual(stepHeader(2, 6, 'employeeProfile'))
    })

    it('builds a step 3 of 6 progress header on federalTaxes labeled with compensation', () => {
      const service = createService('compensation', {
        onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })

      send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)

      expect(service.machine.current).toBe('federalTaxes')
      expect(service.context.header).toEqual(stepHeader(3, 6, 'compensation'))
    })

    it('builds a step 4 of 6 progress header on stateTaxes labeled with federalTaxes', () => {
      const service = createService('federalTaxes', {
        onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })

      send(service, componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)

      expect(service.machine.current).toBe('stateTaxes')
      expect(service.context.header).toEqual(stepHeader(4, 6, 'federalTaxes'))
    })

    it('builds a step 5 of 6 progress header on paymentMethod labeled with stateTaxes', () => {
      const service = createService('stateTaxes', {
        onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })

      send(service, componentEvents.EMPLOYEE_STATE_TAXES_DONE)

      expect(service.machine.current).toBe('paymentMethod')
      expect(service.context.header).toEqual(stepHeader(5, 6, 'stateTaxes'))
    })

    it('builds a step 6 of 6 progress header on deductions labeled with paymentMethod (non-self path)', () => {
      const service = createService('paymentMethod')

      send(service, componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)

      expect(service.machine.current).toBe('deductions')
      expect(service.context.header).toEqual(stepHeader(6, 6, 'paymentMethod'))
    })

    it('builds a step 3 of 3 progress header on deductions labeled with compensation (self-onboarding path)', () => {
      const service = createService('compensation', {
        onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED,
      })

      send(service, componentEvents.EMPLOYEE_COMPENSATION_DONE)

      expect(service.machine.current).toBe('deductions')
      expect(service.context.header).toEqual(stepHeader(3, 3, 'compensation'))
    })

    it('builds a step 7 of 7 progress header on employeeDocuments labeled with deductions', () => {
      const service = createService('deductions', { withEmployeeI9: true })

      send(service, componentEvents.EMPLOYEE_DEDUCTION_DONE)

      expect(service.machine.current).toBe('employeeDocuments')
      expect(service.context.header).toEqual(stepHeader(7, 7, 'deductions'))
    })

    it('clears the header on the summary state', () => {
      const service = createService('employeeDocuments')

      send(service, componentEvents.EMPLOYEE_DOCUMENTS_DONE)

      expect(service.machine.current).toBe('summary')
      expect(service.context.header).toBeNull()
    })
  })

  describe('back transitions', () => {
    it('returns to employeeProfile from compensation and renders a step 1 progress header', () => {
      const service = createService('compensation')

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('employeeProfile')
      expect(service.context.component).toBe(ProfileContextual)
      expect(service.context.header).toEqual(stepHeader(1, 6))
    })

    it('returns to compensation from federalTaxes and relabels for employeeProfile', () => {
      const service = createService('federalTaxes')

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('compensation')
      expect(service.context.component).toBe(CompensationContextual)
      expect(service.context.header).toEqual(stepHeader(2, 6, 'employeeProfile'))
    })

    it('returns to federalTaxes from stateTaxes and relabels for compensation', () => {
      const service = createService('stateTaxes')

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('federalTaxes')
      expect(service.context.header).toEqual(stepHeader(3, 6, 'compensation'))
    })

    it('returns to stateTaxes from paymentMethod and relabels for federalTaxes', () => {
      const service = createService('paymentMethod')

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('stateTaxes')
      expect(service.context.header).toEqual(stepHeader(4, 6, 'federalTaxes'))
    })

    it('returns to deductions from employeeDocuments and relabels for paymentMethod (non-self)', () => {
      const service = createService('employeeDocuments', {
        onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('deductions')
      expect(service.context.header).toEqual(stepHeader(6, 6, 'paymentMethod'))
    })

    it('returns to deductions from employeeDocuments and relabels for compensation (self)', () => {
      const service = createService('employeeDocuments', {
        onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED,
      })

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('deductions')
      expect(service.context.header).toEqual(stepHeader(3, 3, 'compensation'))
    })

    it('returns to paymentMethod from deductions when not self-onboarding and relabels for stateTaxes', () => {
      const service = createService('deductions', {
        onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('paymentMethod')
      expect(service.context.component).toBe(PaymentMethodContextual)
      expect(service.context.header).toEqual(stepHeader(5, 6, 'stateTaxes'))
    })

    it('returns to compensation from deductions when self-onboarding and relabels for employeeProfile', () => {
      const service = createService('deductions', {
        onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED,
      })

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('compensation')
      expect(service.context.component).toBe(CompensationContextual)
      expect(service.context.header).toEqual(stepHeader(2, 3, 'employeeProfile'))
    })

    it('does not transition out of summary on back (no back edge defined)', () => {
      const service = createService('deductions')

      send(service, componentEvents.EMPLOYEE_DEDUCTION_DONE)
      expect(service.machine.current).toBe('summary')
      expect(service.context.component).toBe(OnboardingSummaryContextual)

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('summary')
      expect(service.context.header).toBeNull()
    })

    it('does not respond to CANCEL on intermediate steps (back uses a dedicated event)', () => {
      const service = createService('compensation')

      send(service, componentEvents.CANCEL)

      expect(service.machine.current).toBe('compensation')
    })
  })

  describe('initialBack (nested usage)', () => {
    const backToListConfig: BackConfig = {
      labelKey: 'backToListCta',
      namespace: 'Employee.EmployeeList',
      event: componentEvents.EMPLOYEES_LIST,
    }

    it('preserves the initialBack affordance on the step 1 header restored when navigating back to employeeProfile', () => {
      const service = createService('compensation', {
        initialBack: backToListConfig,
      })

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('employeeProfile')
      expect(service.context.header).toEqual({
        ...stepHeader(1, 6),
        back: backToListConfig,
      })
    })

    it('renders a step 1 progress header with no back affordance when no initialBack is supplied', () => {
      const service = createService('compensation')

      send(service, componentEvents.EMPLOYEE_ONBOARDING_BACK)

      expect(service.machine.current).toBe('employeeProfile')
      expect(service.context.header).toEqual(stepHeader(1, 6))
    })
  })
})
