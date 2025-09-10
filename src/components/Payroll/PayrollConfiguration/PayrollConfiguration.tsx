import { useState, useEffect } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollprepared'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
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

  const { mutateAsync: preparePayroll, isPending: isPreparePayrollPending } =
    usePayrollsPrepareMutation()
  const { mutateAsync: calculatePayroll } = usePayrollsCalculateMutation()
  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()
  const [editedEmployeeId, setEditedEmployeeId] = useState<string | undefined>(undefined)

  const { data: payScheduleData } = usePaySchedulesGet(
    {
      companyId,
      payScheduleId: preparedPayroll?.payPeriod?.payScheduleUuid || '',
    },
    {
      enabled: Boolean(preparedPayroll?.payPeriod?.payScheduleUuid),
    },
  )

  useEffect(() => {
    const handlePreparePayroll = async () => {
      const result = await preparePayroll({
        request: {
          companyId,
          payrollId,
        },
      })
      setPreparedPayroll(result.payrollPrepared)
    }

    void handlePreparePayroll()
  }, [companyId, payrollId, preparePayroll])

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
    if (event === componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED) {
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

  if (isPreparePayrollPending || isCalculating) {
    return <LoadingIndicator />
  }

  return editedEmployeeId ? (
    <PayrollEditEmployee onEvent={wrappedOnEvent} employeeId={editedEmployeeId} />
  ) : (
    <PayrollConfigurationPresentation
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
      employeeCompensations={preparedPayroll?.employeeCompensations || []}
      employeeDetails={employeeData.showEmployees || []}
      payPeriod={preparedPayroll?.payPeriod}
      paySchedule={payScheduleData?.payScheduleObject}
      isOffCycle={preparedPayroll?.offCycle}
    />
  )
}
