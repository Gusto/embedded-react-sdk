import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import {
  IncludeDeductionsFormContextual,
  type DeductionsContextInterface,
  DeductionsListContextual,
} from './DeductionsComponents'
import { deductionsStateMachine } from './stateMachine'

interface UseEmployeeDeductionsProps {
  employeeId: string
}

export function useEmployeeDeductions({ employeeId }: UseEmployeeDeductionsProps) {
  const { data } = useGarnishmentsListSuspense({ employeeId })
  const deductions = data.garnishmentList!
  const activeDeductions = deductions.filter(deduction => deduction.active)
  const hasExistingDeductions = useMemo(
    () => activeDeductions.length > 0,
    [activeDeductions.length],
  )

  const initialState: 'includeDeductions' | 'viewDeductions' = hasExistingDeductions
    ? 'viewDeductions'
    : 'includeDeductions'

  const initialComponent: React.ComponentType = hasExistingDeductions
    ? DeductionsListContextual
    : IncludeDeductionsFormContextual

  const machine = useMemo(
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

  return {
    data: {
      deductions,
      activeDeductions,
      hasExistingDeductions,
    },
    actions: {},
    meta: {
      machine,
    },
  }
}
