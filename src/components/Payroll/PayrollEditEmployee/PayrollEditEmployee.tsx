import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeePaymentMethodsGetBankAccounts'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsUpdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollupdate'
import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { PREPARE_QUERY_KEY } from '../PayrollConfiguration/usePayrollConfigurationData'
import { derivePayrollCategory, isOffCyclePayroll } from '../payrollTypes'
import { cleanupReimbursements } from '../helpers'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { componentEvents } from '@/shared/constants'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'
import { useBase } from '@/components/Base/useBase'

/**
 * Props for {@link PayrollEditEmployee}.
 *
 * @public
 */
export interface PayrollEditEmployeeProps extends BaseComponentInterface<'Payroll.PayrollEditEmployee'> {
  /** The associated employee identifier. */
  employeeId: string
  /** The associated company identifier. */
  companyId: string
  /** The associated payroll identifier. */
  payrollId: string
  /** Whether to show reimbursement fields. Defaults to `true`. */
  withReimbursements?: boolean
}

/**
 * Editor for an individual employee's compensation within a payroll run.
 *
 * Allows modification of pay rates, hours, time off, additional earnings,
 * reimbursements, and payment method for a single employee on the specified payroll.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/employee/saved` | Fired when employee payroll compensation changes are saved | `{ payrollPrepared, employee }` |
 * | `runPayroll/employee/cancelled` | Fired when the user cancels editing employee payroll compensation | — |
 *
 * @param props - {@link PayrollEditEmployeeProps} plus base component props.
 * @returns The employee compensation editor.
 * @public
 *
 * @example
 * ```tsx
 * import { Payroll } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <Payroll.PayrollEditEmployee
 *       employeeId="your-employee-id"
 *       companyId="your-company-id"
 *       payrollId="your-payroll-id"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function PayrollEditEmployee(props: PayrollEditEmployeeProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  employeeId,
  companyId,
  payrollId,
  onEvent,
  dictionary,
  withReimbursements = true,
}: PayrollEditEmployeeProps) => {
  useComponentDictionary('Payroll.PayrollEditEmployee', dictionary)

  const queryClient = useQueryClient()
  const { LoadingIndicator, baseSubmitHandler } = useBase()

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const memoizedEmployeeId = useMemo(() => [employeeId], [employeeId])
  const { preparedPayroll, paySchedule, isLoading } = usePreparedPayrollData({
    companyId,
    payrollId,
    employeeUuids: memoizedEmployeeId,
  })

  const { mutateAsync: updatePayroll, isPending } = usePayrollsUpdateMutation()

  const employee = employeeData.employee!
  const employeeCompensation = preparedPayroll?.employeeCompensations?.at(0)
  const bankAccounts = bankAccountsList.employeeBankAccounts || []
  const hasDirectDepositSetup = bankAccounts.length > 0
  const payrollCategory = derivePayrollCategory(preparedPayroll ?? {})
  const usesItemizedReimbursements = !isOffCyclePayroll(payrollCategory)

  const transformEmployeeCompensation = ({
    paymentMethod,
    reimbursements,
    ...compensation
  }: PayrollEmployeeCompensationsType): PayrollUpdateEmployeeCompensations => {
    return {
      ...compensation,
      ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
      memo: compensation.memo || undefined,
      // Off-cycle payrolls write reimbursements via the legacy fixed_compensations field; the
      // itemized array gets rejected by the `emb_off_cycle_disable_named_reimbursements` backend
      // flag (default-on globally, expected removal 2026-09-01).
      // TODO(post-2026-09-01): drop the branch once the flag is gone.
      ...(usesItemizedReimbursements && reimbursements
        ? { reimbursements: cleanupReimbursements(reimbursements) }
        : {}),
    }
  }

  const onSave = async (updatedCompensation: PayrollEmployeeCompensationsType) => {
    const transformedCompensation = transformEmployeeCompensation(updatedCompensation)
    await baseSubmitHandler(null, async () => {
      const result = await updatePayroll({
        request: {
          companyId,
          payrollId,
          payrollUpdate: {
            employeeCompensations: [transformedCompensation],
          },
        },
      })

      await queryClient.invalidateQueries({
        queryKey: [PREPARE_QUERY_KEY, payrollId],
      })

      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
        payrollPrepared: result.payrollPrepared,
        employee,
      })
    })
  }

  const onCancel = () => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <PayrollEditEmployeePresentation
      onSave={onSave}
      onCancel={onCancel}
      employee={employee}
      isPending={isPending}
      employeeCompensation={employeeCompensation}
      fixedCompensationTypes={preparedPayroll?.fixedCompensationTypes || []}
      payPeriodStartDate={preparedPayroll?.payPeriod?.startDate}
      paySchedule={paySchedule}
      payrollCategory={payrollCategory}
      withReimbursements={withReimbursements}
      hasDirectDepositSetup={hasDirectDepositSetup}
    />
  )
}
