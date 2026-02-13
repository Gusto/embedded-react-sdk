import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { componentEvents, type EventType } from '@/shared/constants'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'

export interface UsePayrollEditEmployeeParams {
  employeeId: string
  companyId: string
  payrollId: string
  onEvent: OnEventType<EventType, unknown>
  withReimbursements?: boolean
}

export interface UsePayrollEditEmployeeReturn {
  data: {
    employee: Employee
    employeeCompensation?: PayrollEmployeeCompensationsType
    fixedCompensationTypes: PayrollFixedCompensationTypesType[]
    payPeriodStartDate?: string
    paySchedule?: PayScheduleObject
    isOffCycle?: boolean
    withReimbursements: boolean
    hasDirectDepositSetup: boolean
  }
  actions: {
    onSave: (updatedCompensation: PayrollEmployeeCompensationsType) => Promise<void>
    onCancel: () => void
  }
  meta: {
    isPending: boolean
    isLoading: boolean
  }
}

const transformEmployeeCompensation = ({
  paymentMethod,
  reimbursements,
  ...compensation
}: PayrollEmployeeCompensationsType): PayrollUpdateEmployeeCompensations => {
  return {
    ...compensation,
    ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
    memo: compensation.memo || undefined,
  }
}

export function usePayrollEditEmployee({
  employeeId,
  companyId,
  payrollId,
  onEvent,
  withReimbursements = true,
}: UsePayrollEditEmployeeParams): UsePayrollEditEmployeeReturn {
  const { baseSubmitHandler } = useBase()

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const memoizedEmployeeId = useMemo(() => [employeeId], [])
  const { preparedPayroll, paySchedule, isLoading } = usePreparedPayrollData({
    companyId,
    payrollId,
    employeeUuids: memoizedEmployeeId,
  })

  const { mutateAsync: updatePayroll, isPending } = usePayrollsUpdateMutation()

  const employee = employeeData.employee!
  const employeeCompensation = preparedPayroll?.employeeCompensations?.at(0)
  const bankAccounts = bankAccountsList.employeeBankAccountList || []
  const hasDirectDepositSetup = bankAccounts.length > 0

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

      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
        payrollPrepared: result.payrollPrepared,
        employee,
      })
    })
  }

  const onCancel = () => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)
  }

  return {
    data: {
      employee,
      employeeCompensation,
      fixedCompensationTypes: preparedPayroll?.fixedCompensationTypes || [],
      payPeriodStartDate: preparedPayroll?.payPeriod?.startDate,
      paySchedule,
      isOffCycle: preparedPayroll?.offCycle,
      withReimbursements,
      hasDirectDepositSetup,
    },
    actions: {
      onSave,
      onCancel,
    },
    meta: {
      isPending,
      isLoading,
    },
  }
}
