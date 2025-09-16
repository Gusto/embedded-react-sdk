import { useState, useEffect } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'

interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  companyId: string
  payrollId: string
}

export function PayrollConfiguration(props: PayrollConfigurationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ onEvent, companyId, payrollId, dictionary }: PayrollConfigurationProps) => {
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
  const [editedEmployeeId, setEditedEmployeeId] = useState<string | undefined>(undefined)

  const {
    preparedPayroll,
    paySchedule,
    isLoading: isPreparedPayrollDataLoading,
    handlePreparePayroll,
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
    setEditedEmployeeId(employee.uuid)
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDITED, { employeeId: employee.uuid })
  }

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    if (
      event === componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED ||
      event === componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED
    ) {
      if (event === componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED) {
        void handlePreparePayroll()
      }
      setEditedEmployeeId(undefined)
    }

    onEvent(event as EventType, payload)
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

  if (editedEmployeeId) {
    return (
      <PayrollEditEmployee
        onEvent={wrappedOnEvent}
        employeeId={editedEmployeeId}
        companyId={companyId}
        payrollId={payrollId}
      />
    )
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
    />
  )
}
