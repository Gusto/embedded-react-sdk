import { useTranslation } from 'react-i18next'
import { createMachine } from 'robot3'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import {
  IncludeDeductionsFormContextual,
  type DeductionsContextInterface,
  DeductionFormContextual,
} from './DeductionsComponents'
import { deductionsStateMachine } from './stateMachine'
import { DeductionsListContextual } from './DeductionsComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useFlow } from '@/components/Flow/useFlow'

export interface DeductionsProps extends BaseComponentInterface<'Employee.Deductions'> {
  employeeId: string
  /**
   * When true, skips the "include deductions" step and goes directly to the add deduction form.
   * Useful for scenarios where you want to bypass the initial question and jump straight to adding a deduction.
   *
   * @example
   * // Skip the include step and go directly to add deduction
   * <Deductions employeeId="123" startWithAdd={true} />
   */
  startWithAdd?: boolean
}

/**
 * Deductions component that manages employee deduction workflows using a state machine.
 *
 * Flow states:
 * - includeDeductions: Shows form asking if user wants to include deductions
 * - viewDeductions: Shows list of existing deductions with add/edit/delete options
 * - addDeduction: Shows form to add a new deduction
 * - editDeduction: Shows form to edit an existing deduction
 * - done: Final state when deductions flow is complete
 *
 * Bypass options:
 * - Use startWithAdd prop to go directly to add deduction
 * - Send EMPLOYEE_DEDUCTION_ADD event from includeDeductions to bypass
 * - Send EMPLOYEE_DEDUCTION_DONE event from includeDeductions to go to view deductions
 */
function DeductionsFlow({ employeeId, onEvent, dictionary, startWithAdd }: DeductionsProps) {
  useComponentDictionary('Employee.Deductions', dictionary)
  const { data } = useGarnishmentsListSuspense({ employeeId })
  const deductions = data.garnishmentList!
  const activeDeductions = deductions.filter(deduction => deduction.active)
  const hasExistingDeductions = activeDeductions.length > 0

  // Determine initial state - follows BankAccount pattern with optional override
  const shouldStartWithAdd = startWithAdd || false
  const initialState: 'includeDeductions' | 'viewDeductions' | 'addDeduction' = shouldStartWithAdd
    ? 'addDeduction'
    : hasExistingDeductions
      ? 'viewDeductions'
      : 'includeDeductions'

  const initialComponent: React.ComponentType = shouldStartWithAdd
    ? DeductionFormContextual
    : hasExistingDeductions
      ? DeductionsListContextual
      : IncludeDeductionsFormContextual

  const manageDeductions = createMachine(
    initialState,
    deductionsStateMachine,
    (initialContext: DeductionsContextInterface) => ({
      ...initialContext,
      component: initialComponent,
      employeeId,
      currentDeduction: null,
      startWithAdd,
      hasExistingDeductions,
    }),
  )

  return <Flow machine={manageDeductions} onEvent={onEvent} />
}

export function Deductions(props: DeductionsProps) {
  return (
    <BaseComponent {...props}>
      <DeductionsFlow {...props} />
    </BaseComponent>
  )
}

export const DeductionsContextual = () => {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Deductions',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Deductions employeeId={employeeId} onEvent={onEvent} />
}
