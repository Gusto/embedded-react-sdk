import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import {
  IncludeDeductionsContextual,
  DeductionsListContextual,
  type DeductionsContextInterface,
} from './deductionsContextualComponents'
import { deductionsMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface DeductionsProps extends BaseComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

export function Deductions({ employeeId, dictionary, onEvent }: DeductionsProps) {
  return (
    <BaseBoundaries componentName="Employee.Deductions">
      <DeductionsRoot employeeId={employeeId} dictionary={dictionary} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function DeductionsRoot({ employeeId, dictionary, onEvent }: DeductionsProps) {
  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  // Used only to pick the machine's initial state. The list rendered inside
  // each contextual wrapper uses a non-suspense hook (React Query dedupes).
  const { data } = useGarnishmentsListSuspense({ employeeId })
  const hasActiveDeductions = (data.garnishments ?? []).some(g => g.active)

  const machine = useMemo(
    () =>
      createMachine(
        hasActiveDeductions ? 'list' : 'include',
        deductionsMachine,
        (initialContext: DeductionsContextInterface) => ({
          ...initialContext,
          component: hasActiveDeductions ? DeductionsListContextual : IncludeDeductionsContextual,
          employeeId,
        }),
      ),
    [employeeId, hasActiveDeductions],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
