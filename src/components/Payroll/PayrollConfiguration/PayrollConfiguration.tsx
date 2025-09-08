import { useState, useEffect } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollprepared'
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

const useCalculatePayrollApi = ({ payrollId }: { payrollId: string }) => {
  const mutate = async () => {}
  return { mutate }
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

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutateAsync: preparePayroll, isPending: isPreparePayrollPending } =
    usePayrollsPrepareMutation()
  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()

  const { mutate } = useCalculatePayrollApi({ payrollId })
  const [editedEmployeeId, setEditedEmployeeId] = useState<string | undefined>(undefined)

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
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_CALCULATED)
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

  if (isPreparePayrollPending) {
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
    />
  )
}
