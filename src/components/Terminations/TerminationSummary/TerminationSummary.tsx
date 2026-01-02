import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import {
  useEmployeeEmploymentsGetTerminationsSuspense,
  invalidateAllEmployeeEmploymentsGetTerminations,
} from '@gusto/embedded-api/react-query/employeeEmploymentsGetTerminations'
import { useEmployeeEmploymentsDeleteTerminationMutation } from '@gusto/embedded-api/react-query/employeeEmploymentsDeleteTermination'
import { invalidateAllEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { TerminationSummaryPresentation } from './TerminationSummaryPresentation'
import { normalizeToDate } from '@/helpers/dateFormatting'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export type PayrollOption = 'dismissalPayroll' | 'regularPayroll' | 'anotherWay'

export interface TerminationSummaryProps extends BaseComponentInterface<'Terminations.TerminationSummary'> {
  employeeId: string
  companyId: string
  payrollOption?: PayrollOption
}

export function TerminationSummary(props: TerminationSummaryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, companyId, payrollOption, dictionary }: TerminationSummaryProps) => {
  useComponentDictionary('Terminations.TerminationSummary', dictionary)
  useI18n('Terminations.TerminationSummary')

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

  const terminations = terminationsData.terminationList ?? []
  const termination = terminations.find(t => t.active) ?? terminations[0]

  const effectiveDate = termination?.effectiveDate
  const canCancel = termination?.cancelable === true
  const effectiveDateLocal = normalizeToDate(effectiveDate)
  const todayMidnight = new Date(new Date().toDateString())
  const canEdit = effectiveDateLocal ? effectiveDateLocal >= todayMidnight : false

  const showRunOffCyclePayroll = payrollOption === 'anotherWay'
  const showRunPayroll =
    !showRunOffCyclePayroll &&
    (termination?.runTerminationPayroll === true || payrollOption === 'dismissalPayroll')

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
