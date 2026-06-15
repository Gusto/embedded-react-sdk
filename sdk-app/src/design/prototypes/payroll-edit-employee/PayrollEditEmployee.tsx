import { Suspense, useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import { useEmployeePaymentMethodsGetBankAccountsSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeePaymentMethodsGetBankAccounts'
import { usePayrollsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsList'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1companiescompanyidpayrolls'
import { PayrollEditEmployeePresentation } from '../../components/payroll/PayrollEditEmployee/PayrollEditEmployeePresentation'
import { BaseComponent } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { usePreparedPayrollData } from '@/components/Payroll/usePreparedPayrollData'
import { derivePayrollCategory } from '@/components/Payroll/payrollTypes'

export interface PayrollEditEmployeeProps {
  employeeId: string
  companyId: string
  preferredPayrollId?: string
}

const UNPROCESSED_LOOKBACK_MONTHS = 6
const UNPROCESSED_LOOKAHEAD_MONTHS = 3

function shiftDate(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]!
}

function Root({ employeeId, companyId, preferredPayrollId }: PayrollEditEmployeeProps) {
  const { Alert, Heading } = useComponentContext()

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
    startDate: shiftDate(-UNPROCESSED_LOOKBACK_MONTHS),
    endDate: shiftDate(UNPROCESSED_LOOKAHEAD_MONTHS),
    payrollTypes: [QueryParamPayrollTypes.Regular, QueryParamPayrollTypes.OffCycle],
    includeOffCycle: true,
  })
  const selectedPayrollId = useMemo(() => {
    const list = payrollsData.payrollList ?? []
    const preferred = list.find(p => p.payrollUuid === preferredPayrollId)
    return preferred?.payrollUuid ?? list[0]?.payrollUuid ?? ''
  }, [payrollsData.payrollList, preferredPayrollId])

  if (!selectedPayrollId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Heading as="h2">Payroll Edit Employee</Heading>
        <Alert label="No unprocessed payrolls" status="warning">
          This company has no unprocessed payrolls in the current window. Create or open one to load
          this prototype.
        </Alert>
      </Flex>
    )
  }

  return (
    <PreparedPayroll employeeId={employeeId} companyId={companyId} payrollId={selectedPayrollId} />
  )
}

interface PreparedPayrollProps {
  employeeId: string
  companyId: string
  payrollId: string
}

function PreparedPayroll({ employeeId, companyId, payrollId }: PreparedPayrollProps) {
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

  if (isLoading) {
    return <div>Loading payroll...</div>
  }

  const employee = employeeData.employee!
  const employeeCompensation = preparedPayroll?.employeeCompensations?.at(0)
  const bankAccounts = bankAccountsList.employeeBankAccounts || []
  const hasDirectDepositSetup = bankAccounts.length > 0
  const payrollCategory = derivePayrollCategory(preparedPayroll ?? {})

  return (
    <PayrollEditEmployeePresentation
      onSave={() => {}}
      onCancel={() => {}}
      employee={employee}
      employeeCompensation={employeeCompensation}
      fixedCompensationTypes={preparedPayroll?.fixedCompensationTypes || []}
      payPeriodStartDate={preparedPayroll?.payPeriod?.startDate}
      paySchedule={paySchedule}
      payrollCategory={payrollCategory}
      hasDirectDepositSetup={hasDirectDepositSetup}
    />
  )
}

export function PayrollEditEmployee(props: PayrollEditEmployeeProps) {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <Root {...props} />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
