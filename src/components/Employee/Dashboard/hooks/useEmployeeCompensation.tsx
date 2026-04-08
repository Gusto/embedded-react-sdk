import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { usePayrollsGetPayStubsSuspense } from '@gusto/embedded-api/react-query/payrollsGetPayStubs'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { GetV1EmployeesEmployeeIdPaymentMethodResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidpaymentmethod'
import type { GetV1EmployeesEmployeeIdBankAccountsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidbankaccounts'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import { buildQueryErrorHandling } from '@/helpers/buildQueryErrorHandling'
import type { HookLoadingResult, BaseHookReady } from '@/types/sdkHooks'

// Derive types from operations responses
type EmployeeBankAccount = NonNullable<
  GetV1EmployeesEmployeeIdBankAccountsResponse['employeeBankAccountList']
>[number]
type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

export interface UseEmployeeCompensationProps {
  employeeId: string
}

interface UseEmployeeCompensationReady extends Omit<BaseHookReady, 'data' | 'status'> {
  data: {
    primaryJob?: Job
    employeePaymentMethod?: NonNullable<
      GetV1EmployeesEmployeeIdPaymentMethodResponse['employeePaymentMethod']
    >
    bankAccounts: EmployeeBankAccount[]
    garnishmentList: Garnishment[]
    payStubs: EmployeePayStub[]
  }
  status: {
    isPending: boolean
  }
}

export type UseEmployeeCompensationResult = HookLoadingResult | UseEmployeeCompensationReady

export function useEmployeeCompensation({
  employeeId,
}: UseEmployeeCompensationProps): UseEmployeeCompensationResult {
  const employeeQuery = useEmployeesGetSuspense({ employeeId })
  const paymentMethodQuery = useEmployeePaymentMethodGetSuspense({ employeeId })
  const bankAccountsQuery = useEmployeePaymentMethodsGetBankAccountsSuspense({ employeeId })
  const garnishmentsQuery = useGarnishmentsListSuspense({ employeeId })
  const payStubsQuery = usePayrollsGetPayStubsSuspense({ employeeId })

  const employee = employeeQuery.data.employee
  const employeePaymentMethod = paymentMethodQuery.data.employeePaymentMethod
  const bankAccountsData = bankAccountsQuery.data
  const garnishmentList = garnishmentsQuery.data.garnishmentList
  const payStubsData = payStubsQuery.data

  // Derive primary job
  const primaryJob = useMemo(() => {
    return employee?.jobs?.find(job => job.primary === true)
  }, [employee?.jobs])

  // Derive bank accounts
  const bankAccounts = useMemo(() => {
    return bankAccountsData.employeeBankAccountList || []
  }, [bankAccountsData])

  // Derive and sort paystubs by check date descending
  const payStubs = useMemo(() => {
    const stubs = payStubsData.employeePayStubsList || []
    return stubs.sort((a, b) => {
      const dateA = a.checkDate ? new Date(a.checkDate).getTime() : 0
      const dateB = b.checkDate ? new Date(b.checkDate).getTime() : 0
      return dateB - dateA
    })
  }, [payStubsData])

  const isPending =
    employeeQuery.isFetching ||
    paymentMethodQuery.isFetching ||
    bankAccountsQuery.isFetching ||
    garnishmentsQuery.isFetching ||
    payStubsQuery.isFetching

  const isLoading = !employee && isPending

  const errorHandling = buildQueryErrorHandling([
    employeeQuery,
    paymentMethodQuery,
    bankAccountsQuery,
    garnishmentsQuery,
    payStubsQuery,
  ])

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      primaryJob,
      employeePaymentMethod: employeePaymentMethod || undefined,
      bankAccounts,
      garnishmentList: garnishmentList || [],
      payStubs,
    },
    status: {
      isPending,
    },
    errorHandling,
  }
}
