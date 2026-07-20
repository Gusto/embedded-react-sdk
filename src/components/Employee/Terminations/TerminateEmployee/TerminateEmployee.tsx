import { useQueryClient } from '@tanstack/react-query'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import {
  useEmployeeEmploymentsGetTerminationsSuspense,
  invalidateAllEmployeeEmploymentsGetTerminations,
} from '@gusto/embedded-api/react-query/employeeEmploymentsGetTerminations'
import { useEmployeeEmploymentsCreateTerminationMutation } from '@gusto/embedded-api/react-query/employeeEmploymentsCreateTermination'
import { useEmployeeEmploymentsUpdateTerminationMutation } from '@gusto/embedded-api/react-query/employeeEmploymentsUpdateTermination'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api/react-query/payrollsCreateOffCycle'
import {
  usePaySchedulesGetUnprocessedTerminationPeriods,
  invalidateAllPaySchedulesGetUnprocessedTerminationPeriods,
} from '@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods'
import { invalidateAllPayrollsList } from '@gusto/embedded-api/react-query/payrollsList'
import { OffCycleReason } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { PayrollOption } from '../types'
import { TerminateEmployeePresentation } from './TerminateEmployeePresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { firstLastName } from '@/helpers/formattedStrings'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link TerminateEmployee}.
 *
 * @public
 */
export interface TerminateEmployeeProps extends BaseComponentInterface<'Employee.Terminations.TerminateEmployee'> {
  /** The employee identifier to terminate. */
  employeeId: string
  /** The associated company identifier. */
  companyId: string
}

/**
 * Form values collected by {@link TerminateEmployee}.
 *
 * @public
 */
export interface TerminateEmployeeFormData {
  /** The effective date of the termination — the employee's last day of work. */
  lastDayOfWork: Date
  /** How to process the employee's final paycheck. */
  payrollOption: PayrollOption
}

/**
 * Standalone form for capturing an employee's termination details — last day of work and how to process final payroll.
 *
 * @remarks
 * The main termination form used inside {@link TerminationFlow}. Detects existing
 * terminations and pre-populates for editing when one is active, or routes to
 * the summary view (via the `employee/termination/viewSummary` event) when the
 * employee is already terminated.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/termination/created` | Fired when a new termination is created | `{ employeeId: string, effectiveDate: string, payrollOption: PayrollOption }` |
 * | `employee/termination/updated` | Fired when an existing termination is updated | `{ employeeId: string, effectiveDate: string, payrollOption: PayrollOption }` |
 * | `employee/termination/done` | Fired when the termination form is completed | `{ employeeId: string, effectiveDate: string, payrollOption: PayrollOption, payrollUuid?: string }` |
 * | `employee/termination/viewSummary` | Fired when redirecting to view an existing termination | `{ employeeId: string, effectiveDate: string }` |
 * | `employee/termination/payrollCreated` | Fired after a dismissal-payroll period was successfully created | `{ payrolls: PayrollUnprocessed[] }` |
 * | `employee/termination/payrollFailed` | Fired if creating a dismissal payroll fails | `{ employeeId: string, error: unknown }` |
 * | `CANCEL` | Fired when the user clicks Cancel | — |
 *
 * @param props - See {@link TerminateEmployeeProps}.
 * @returns The termination form.
 * @public
 * @group Block components
 *
 * @example
 * ```tsx
 * import { EmployeeManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeManagement.TerminateEmployee
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function TerminateEmployee(props: TerminateEmployeeProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, companyId, dictionary }: TerminateEmployeeProps) => {
  useComponentDictionary('Employee.Terminations.TerminateEmployee', dictionary)
  useI18n('Employee.Terminations.TerminateEmployee')

  const queryClient = useQueryClient()
  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  const { data: terminationsData } = useEmployeeEmploymentsGetTerminationsSuspense({ employeeId })

  const { mutateAsync: createTermination, isPending: isCreatingTermination } =
    useEmployeeEmploymentsCreateTerminationMutation()

  const { mutateAsync: updateTermination, isPending: isUpdatingTermination } =
    useEmployeeEmploymentsUpdateTerminationMutation()

  const { mutateAsync: createOffCyclePayroll, isPending: isCreatingPayroll } =
    usePayrollsCreateOffCycleMutation()

  const { refetch: fetchTerminationPeriods } = usePaySchedulesGetUnprocessedTerminationPeriods(
    { companyId },
    { enabled: false },
  )

  // If employee is already terminated, redirect to summary with existing termination data
  // Don't pass payrollOption to avoid showing the success alert
  if (employee?.terminated && terminationsData.terminations?.[0]) {
    onEvent(componentEvents.EMPLOYEE_TERMINATION_VIEW_SUMMARY, {
      employeeId,
      effectiveDate: terminationsData.terminations[0].effectiveDate!,
      termination: terminationsData.terminations[0],
    })
    return null
  }

  const employeeName = firstLastName({
    first_name: employee?.firstName,
    last_name: employee?.lastName,
  })

  const existingTermination = terminationsData.terminations?.[0]

  const handleSubmit = async (formData: TerminateEmployeeFormData) => {
    const { lastDayOfWork, payrollOption } = formData
    const effectiveDate = formatDateToStringDate(lastDayOfWork)!

    await baseSubmitHandler({ effectiveDate, payrollOption }, async () => {
      const runTerminationPayroll = payrollOption === 'dismissalPayroll'

      const result = existingTermination
        ? await updateTermination({
            request: {
              employeeId,
              requestBody: {
                version: existingTermination.version!,
                effectiveDate,
                runTerminationPayroll,
              },
            },
          })
        : await createTermination({
            request: {
              employeeId,
              requestBody: {
                effectiveDate,
                runTerminationPayroll,
              },
            },
          })

      await invalidateAllEmployeeEmploymentsGetTerminations(queryClient)

      let firstPayrollUuid: string | undefined

      if (runTerminationPayroll) {
        try {
          const { data: terminationPeriodsData } = await fetchTerminationPeriods()

          const employeePeriods =
            terminationPeriodsData?.unprocessedTerminationPayPeriods?.filter(
              period => period.employeeUuid === employeeId,
            ) ?? []

          const createdPayrolls = []

          for (const terminationPeriod of employeePeriods) {
            if (terminationPeriod.startDate && terminationPeriod.endDate) {
              const payrollResult = await createOffCyclePayroll({
                request: {
                  companyId,
                  requestBody: {
                    offCycle: true,
                    offCycleReason: OffCycleReason.DismissedEmployee,
                    startDate: new RFCDate(terminationPeriod.startDate),
                    endDate: new RFCDate(terminationPeriod.endDate),
                    employeeUuids: [employeeId],
                    checkDate: terminationPeriod.checkDate
                      ? new RFCDate(terminationPeriod.checkDate)
                      : undefined,
                  },
                },
              })

              if (payrollResult.payrollUnprocessed) {
                createdPayrolls.push(payrollResult.payrollUnprocessed)
              }
            }
          }

          if (createdPayrolls.length > 0) {
            firstPayrollUuid = createdPayrolls[0]?.payrollUuid ?? createdPayrolls[0]?.uuid

            await invalidateAllPayrollsList(queryClient)
            await invalidateAllPaySchedulesGetUnprocessedTerminationPeriods(queryClient)

            onEvent(componentEvents.EMPLOYEE_TERMINATION_PAYROLL_CREATED, {
              payrolls: createdPayrolls,
            })
          }
        } catch (payrollError) {
          onEvent(componentEvents.EMPLOYEE_TERMINATION_PAYROLL_FAILED, {
            error: payrollError,
            employeeId,
          })
        }
      }

      const eventType = existingTermination
        ? componentEvents.EMPLOYEE_TERMINATION_UPDATED
        : componentEvents.EMPLOYEE_TERMINATION_CREATED

      onEvent(eventType, {
        termination: result.termination,
        payrollOption,
        runTerminationPayroll,
      })

      onEvent(componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId,
        effectiveDate,
        payrollOption,
        payrollUuid: firstPayrollUuid,
        termination: result.termination,
        ...(payrollOption === 'anotherWay' && { manualHandling: true }),
      })
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  const isPending = isCreatingTermination || isUpdatingTermination || isCreatingPayroll

  return (
    <TerminateEmployeePresentation
      employeeName={employeeName}
      existingTermination={existingTermination}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isPending}
    />
  )
}
