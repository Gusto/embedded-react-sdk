import { useTranslation } from 'react-i18next'
import { createMachine } from 'robot3'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { useMemo } from 'react'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import {
  IncludeDeductionsFormContextual,
  type DeductionsContextInterface,
  DeductionsListContextual,
} from './DeductionsComponents'
import { deductionsStateMachine } from './stateMachine'
import { DeductionsForm } from './DeductionsForm/DeductionsForm'
import { DeductionsList } from './DeductionsList/DeductionsList'
import { IncludeDeductionsForm } from './IncludeDeductionsForm/IncludeDeductionsForm'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useFlow } from '@/components/Flow/useFlow'

export interface DeductionsProps extends BaseComponentInterface<'Employee.Deductions'> {
  employeeId: string
}
function DeductionsFlow({ employeeId, onEvent, dictionary }: DeductionsProps) {
  useComponentDictionary('Employee.Deductions', dictionary)
  const { data } = useGarnishmentsListSuspense({ employeeId })
  const deductions = data.garnishmentList!
  const activeDeductions = deductions.filter(deduction => deduction.active)
  const hasExistingDeductions = useMemo(
    () => activeDeductions.length > 0,
    [activeDeductions.length],
  )

  // Determine initial state based on existing deductions
  const initialState: 'includeDeductions' | 'viewDeductions' = hasExistingDeductions
    ? 'viewDeductions'
    : 'includeDeductions'

  const initialComponent: React.ComponentType = hasExistingDeductions
    ? DeductionsListContextual
    : IncludeDeductionsFormContextual

  const manageDeductions = useMemo(
    () =>
      createMachine(
        initialState,
        deductionsStateMachine,
        (initialContext: DeductionsContextInterface) => ({
          ...initialContext,
          component: initialComponent,
          employeeId,
          currentDeductionId: null,
          hasExistingDeductions,
        }),
      ),
    [initialState, initialComponent, employeeId, hasExistingDeductions],
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

Deductions.DeductionsForm = DeductionsForm
Deductions.DeductionsList = DeductionsList
Deductions.IncludeDeductionsForm = IncludeDeductionsForm
