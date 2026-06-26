import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import {
  useEmployeeEmploymentsGetTerminationsSuspense,
  invalidateAllEmployeeEmploymentsGetTerminations,
} from '@gusto/embedded-api-v-2025-11-15/react-query/employeeEmploymentsGetTerminations'
import { useEmployeeEmploymentsDeleteTerminationMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeEmploymentsDeleteTermination'
import { invalidateAllEmployeesList } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesList'
import type { PayrollOption } from '../types'
import { TerminationSummaryPresentation } from './TerminationSummaryPresentation'
import { normalizeToDate } from '@/helpers/dateFormatting'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

/**
 * Props for {@link TerminationSummary}.
 *
 * @public
 */
export interface TerminationSummaryProps extends BaseComponentInterface<'Employee.Terminations.TerminationSummary'> {
  /** The associated employee identifier. */
  employeeId: string
  /** The associated company identifier. */
  companyId: string
  /** The selected payroll processing option. When provided, the summary surfaces a success alert confirming the action taken. */
  payrollOption?: PayrollOption
  /** UUID of the created off-cycle payroll (when applicable). */
  payrollUuid?: string
}

/**
 * Termination summary with edit, cancel, and run-payroll actions plus an offboarding checklist.
 *
 * @remarks
 * Displays termination details and provides actions for managing the termination. Includes an offboarding checklist covering payroll timing, tax forms, and account disconnection. The available actions depend on the termination state:
 *
 * - **Edit** is available when the termination date is in the future and the employee is not yet terminated. The effective date cannot be edited if it is in the past.
 * - **Cancel** is available when the termination is still cancellable — `regularPayroll` or `anotherWay` options can be cancelled; `dismissalPayroll` cannot.
 * - **Run termination payroll** is shown for the `dismissalPayroll` option and navigates to the dismissal payroll flow.
 * - **Run off-cycle payroll** is shown for the `anotherWay` option and navigates to the off-cycle payroll creation flow.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/termination/edit` | Fired when user clicks to edit termination details | `{ employeeId: string }` |
 * | `employee/termination/cancelled` | Fired when a termination is successfully cancelled | `{ employeeId: string, alert?: `{@link TerminationFlowAlert}` }` |
 * | `employee/termination/runPayroll` | Fired when user clicks to run termination payroll | `{ employeeId: string, companyId: string, effectiveDate: string }` |
 * | `employee/termination/runOffCyclePayroll` | Fired when user clicks to run an off-cycle payroll | `{ employeeId: string, companyId: string }` |
 *
 * @param props - See {@link TerminationSummaryProps}.
 * @returns The termination summary view.
 * @public
 * @group Block Components
 *
 * @example
 * ```tsx
 * import { EmployeeManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeManagement.TerminationSummary
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       payrollOption="dismissalPayroll"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function TerminationSummary(props: TerminationSummaryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  employeeId,
  companyId,
  payrollOption,
  payrollUuid,
  dictionary,
}: TerminationSummaryProps) => {
  useComponentDictionary('Employee.Terminations.TerminationSummary', dictionary)
  useI18n('Employee.Terminations.TerminationSummary')

  const queryClient = useQueryClient()
  const { onEvent, baseSubmitHandler } = useBase()

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  const { data: terminationsData } = useEmployeeEmploymentsGetTerminationsSuspense({ employeeId })

  const { mutateAsync: deleteTermination, isPending: isDeleting } =
    useEmployeeEmploymentsDeleteTerminationMutation()

  const employeeName = [employee?.firstName, employee?.lastName].filter(Boolean).join(' ')

  const terminations = terminationsData.terminations ?? []
  const termination = terminations.find(t => t.active) ?? terminations[0]

  const effectiveDate = termination?.effectiveDate
  const canCancel = termination?.cancelable === true
  const effectiveDateLocal = normalizeToDate(effectiveDate)
  const todayMidnight = new Date(new Date().toDateString())
  const canEdit =
    !employee?.terminated && effectiveDateLocal ? effectiveDateLocal >= todayMidnight : false

  const showRunOffCyclePayroll = payrollOption === 'anotherWay'
  const showRunPayroll =
    !showRunOffCyclePayroll &&
    (termination?.runTerminationPayroll === true || payrollOption === 'dismissalPayroll')

  // Only show success alert if payrollOption is provided (meaning we just completed the termination)
  // Don't show it if we're just viewing an existing termination (employee already terminated)
  const showSuccessAlert = payrollOption !== undefined

  const handleCancelClick = () => {
    setIsCancelDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsCancelDialogOpen(false)
  }

  const handleConfirmCancel = async () => {
    if (!termination) return

    await baseSubmitHandler({ terminationId: termination.uuid }, async () => {
      await deleteTermination({
        request: {
          employeeId,
        },
      })

      await invalidateAllEmployeeEmploymentsGetTerminations(queryClient)
      await invalidateAllEmployeesList(queryClient)

      setIsCancelDialogOpen(false)

      onEvent(componentEvents.EMPLOYEE_TERMINATION_CANCELLED, {
        employeeId,
        termination,
      })
    })
  }

  const handleEditDismissal = () => {
    onEvent(componentEvents.EMPLOYEE_TERMINATION_EDIT, {
      employeeId,
      termination,
    })
  }

  const handleRunDismissalPayroll = () => {
    onEvent(componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL, {
      employeeId,
      companyId,
      payrollUuid,
      termination,
    })
  }

  const handleRunOffCyclePayroll = () => {
    onEvent(componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL, {
      employeeId,
      companyId,
      termination,
    })
  }

  if (!termination) {
    return null
  }

  return (
    <TerminationSummaryPresentation
      employeeName={employeeName}
      effectiveDate={effectiveDate}
      canCancel={canCancel}
      canEdit={canEdit}
      showRunPayroll={showRunPayroll}
      showRunOffCyclePayroll={showRunOffCyclePayroll}
      showSuccessAlert={showSuccessAlert}
      onCancelClick={handleCancelClick}
      onEditDismissal={handleEditDismissal}
      onRunDismissalPayroll={handleRunDismissalPayroll}
      onRunOffCyclePayroll={handleRunOffCyclePayroll}
      isLoading={isDeleting}
      isCancelDialogOpen={isCancelDialogOpen}
      onDialogClose={handleDialogClose}
      onDialogConfirm={handleConfirmCancel}
      isCancelling={isDeleting}
    />
  )
}
