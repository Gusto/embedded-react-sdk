import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeePaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { usePayrollsGetPayStubsSuspense } from '@gusto/embedded-api/react-query/payrollsGetPayStubs'
import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import { useEmployeeFormsListSuspense } from '@gusto/embedded-api/react-query/employeeFormsList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { Form } from '@gusto/embedded-api/models/components/form'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import type { GetV1EmployeesEmployeeIdStateTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import type { GetV1EmployeesEmployeeIdPaymentMethodResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidpaymentmethod'
import type { GetV1EmployeesEmployeeIdBankAccountsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidbankaccounts'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import type { HookLoadingResult, BaseHookReady } from '@/types/sdkHooks'

// Derive types from operations responses since component types aren't exported from the SDK
type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>
type EmployeeStateTax = NonNullable<
  GetV1EmployeesEmployeeIdStateTaxesResponse['employeeStateTaxesList']
>[number]
type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]
type EmployeeBankAccount = NonNullable<
  GetV1EmployeesEmployeeIdBankAccountsResponse['employeeBankAccountList']
>[number]

export interface UseDashboardProps {
  employeeId: string
}

interface UseDashboardReady extends BaseHookReady {
  data: {
    employee: Employee
    currentHomeAddress?: EmployeeAddress
    currentWorkAddress?: EmployeeWorkAddress
    primaryJob?: Job
    employeePaymentMethod?: NonNullable<
      GetV1EmployeesEmployeeIdPaymentMethodResponse['employeePaymentMethod']
    >
    bankAccounts: EmployeeBankAccount[]
    garnishmentList: Garnishment[]
    payStubs: EmployeePayStub[]
    employeeFederalTax?: EmployeeFederalTax
    employeeStateTaxesList: EmployeeStateTax[]
    formList: Form[]
  }
  status: {
    isLoadingBasicDetails: boolean
    isLoadingJobAndPay: boolean
    isLoadingTaxes: boolean
    isLoadingDocuments: boolean
  }
}

export type UseDashboardResult = HookLoadingResult | UseDashboardReady

export function useDashboard({ employeeId }: UseDashboardProps): UseDashboardResult {
  // Employee and addresses
  const {
    data: { employee },
    isFetching: isFetchingEmployee,
  } = useEmployeesGetSuspense({ employeeId })

  const {
    data: { employeeAddressList },
    isFetching: isFetchingAddresses,
  } = useEmployeeAddressesGetSuspense({ employeeId })

  const {
    data: { employeeWorkAddressesList },
    isFetching: isFetchingWorkAddresses,
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  // Payment and compensation
  const {
    data: { employeePaymentMethod },
    isFetching: isFetchingPaymentMethod,
  } = useEmployeePaymentMethodGetSuspense({ employeeId })

  const { data: bankAccountsData, isFetching: isFetchingBankAccounts } =
    useEmployeePaymentMethodsGetBankAccountsSuspense({ employeeId })

  const {
    data: { garnishmentList },
    isFetching: isFetchingGarnishments,
  } = useGarnishmentsListSuspense({ employeeId })

  const { data: payStubData, isFetching: isFetchingPayStubs } = usePayrollsGetPayStubsSuspense({
    employeeId,
  })

  // Taxes
  const {
    data: { employeeFederalTax },
    isFetching: isFetchingFederalTaxes,
  } = useEmployeeTaxSetupGetFederalTaxesSuspense({ employeeUuid: employeeId })

  const {
    data: { employeeStateTaxesList },
    isFetching: isFetchingStateTaxes,
  } = useEmployeeTaxSetupGetStateTaxesSuspense({ employeeUuid: employeeId })

  // Documents
  const {
    data: { formList },
    isFetching: isFetchingForms,
  } = useEmployeeFormsListSuspense({
    employeeId,
  })

  // Derive current addresses
  const currentHomeAddress = useMemo(() => {
    return employeeAddressList?.find(address => address.active)
  }, [employeeAddressList])

  const currentWorkAddress = useMemo(() => {
    return employeeWorkAddressesList?.find(address => address.active)
  }, [employeeWorkAddressesList])

  // Derive primary job
  const primaryJob = useMemo(() => {
    return employee?.jobs?.find(job => job.primary === true)
  }, [employee?.jobs])

  // Derive bank accounts
  const bankAccounts = useMemo(() => {
    return bankAccountsData.employeeBankAccountList || []
  }, [bankAccountsData])

  // Derive paystubs (ensure they're sorted by check date desc)
  const payStubs = useMemo(() => {
    const stubs = payStubData.employeePayStubsList || []
    return stubs.sort((a, b) => {
      const dateA = a.checkDate ? new Date(a.checkDate).getTime() : 0
      const dateB = b.checkDate ? new Date(b.checkDate).getTime() : 0
      return dateB - dateA
    })
  }, [payStubData])

  // Loading states per tab
  const isLoadingBasicDetails = isFetchingEmployee || isFetchingAddresses || isFetchingWorkAddresses
  const isLoadingJobAndPay =
    isFetchingEmployee ||
    isFetchingPaymentMethod ||
    isFetchingBankAccounts ||
    isFetchingGarnishments ||
    isFetchingPayStubs
  const isLoadingTaxes = isFetchingFederalTaxes || isFetchingStateTaxes
  const isLoadingDocuments = isFetchingForms

  // Overall loading state (only show loading on initial load)
  const isLoading =
    !employee && (isFetchingEmployee || isFetchingAddresses || isFetchingWorkAddresses)

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling: {
        errors: [],
        retryQueries: () => {},
        clearSubmitError: () => {},
      },
    }
  }

  return {
    isLoading: false,
    data: {
      employee: employee!,
      currentHomeAddress,
      currentWorkAddress,
      primaryJob,
      employeePaymentMethod: employeePaymentMethod || undefined,
      bankAccounts,
      garnishmentList: garnishmentList || [],
      payStubs,
      employeeFederalTax,
      employeeStateTaxesList: employeeStateTaxesList || [],
      formList: formList || [],
    },
    status: {
      isLoadingBasicDetails,
      isLoadingJobAndPay,
      isLoadingTaxes,
      isLoadingDocuments,
    },
  }
}
