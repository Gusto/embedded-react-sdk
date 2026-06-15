import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/garnishmentsList'
import {
  IncludeDeductionsContextual,
  DeductionsListContextual,
  type DeductionsContextInterface,
} from './deductionsContextualComponents'
import { deductionsMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

/**
 * Props for {@link Deductions}.
 *
 * @public
 */
export interface DeductionsProps extends BaseComponentInterface<'Employee.Deductions'> {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Onboarding step for collecting an employee's post-tax deductions and court-ordered garnishments.
 *
 * @remarks
 * On first mount, routes between an "include deductions?" prompt (when the employee has no active deductions) and a list view of existing deductions. From there, users add or edit deductions inline — post-tax custom deductions or court-ordered garnishments — and can complete the step with or without any active deductions.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/deductions/include/yes` | Fired when the user chooses to add deductions from the include prompt | — |
 * | `employee/deductions/include/no` | Fired when the user chooses to skip deductions from the include prompt | — |
 * | `employee/deductions/add` | Fired when the user opens the form to add a new deduction | — |
 * | `employee/deductions/edit` | Fired when the user opens the form to edit an existing deduction | The matching `Garnishment` |
 * | `employee/deductions/created` | Fired after a new deduction is saved | The created `Garnishment` |
 * | `employee/deductions/updated` | Fired after an existing deduction is updated | The updated `Garnishment` |
 * | `employee/deductions/deleted` | Fired after a deduction is deleted and others remain | The deleted `Garnishment` |
 * | `employee/deductions/deletedEmpty` | Fired after the last deduction is deleted, leaving none | — |
 * | `employee/deductions/cancel` | Fired when the user cancels the form while other deductions exist | — |
 * | `employee/deductions/cancelEmpty` | Fired when the user cancels the form and no deductions remain | — |
 * | `employee/deductions/done` | Fired when the step is complete and the parent flow can advance | — |
 *
 * @param props - See {@link DeductionsProps}.
 * @returns The deductions onboarding step.
 * @public
 * @group Block Components
 *
 * @example
 * ```tsx
 * import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeOnboarding.Deductions
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
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
