import { useEffect, type ReactNode } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  companyId: string
  payrollId: string
  alerts?: ReactNode
}

export function PayrollConfiguration(props: PayrollConfigurationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  onEvent,
  companyId,
  payrollId,
  dictionary,
  alerts,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)
  useI18n('Payroll.PayrollConfiguration')

  const { LoadingIndicator } = useBase()

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
    },
    { refetchInterval: 5_000 },
  )

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutateAsync: calculatePayroll } = usePayrollsCalculateMutation()

  const {
    preparedPayroll,
    paySchedule,
    isLoading: isPreparedPayrollDataLoading,
  } = usePreparedPayrollData({
    companyId,
    payrollId,
  })

  const onBack = () => {
    onEvent(componentEvents.RUN_PAYROLL_BACK)
  }
  const onCalculatePayroll = async () => {
    await calculatePayroll({
      request: {
        companyId,
        payrollId,
      },
    })
  }
  const onEdit = (employee: Employee) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDITED, { employeeId: employee.uuid })
  }

  const isCalculating =
    payrollData.payrollShow?.processingRequest?.status ===
    PayrollProcessingRequestStatus.Calculating
  const isCalculated =
    payrollData.payrollShow?.processingRequest?.status ===
    PayrollProcessingRequestStatus.CalculateSuccess

  useEffect(() => {
    if (isCalculated) {
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED)
    }
  }, [isCalculated, onEvent])

  if (isPreparedPayrollDataLoading || isCalculating) {
    return <LoadingIndicator />
  }

  return (
    <PayrollConfigurationPresentation
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
      employeeCompensations={preparedPayroll?.employeeCompensations || []}
      employeeDetails={employeeData.showEmployees || []}
      payPeriod={preparedPayroll?.payPeriod}
      paySchedule={paySchedule}
      isOffCycle={preparedPayroll?.offCycle}
      alerts={alerts}
    />
  )
}
