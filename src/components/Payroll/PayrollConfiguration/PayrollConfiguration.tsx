import { useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
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

  const { data: payrollData } = usePayrollsGetSuspense({ companyId, payrollId })

  // TODO: We need to update to get the uuids param working so we don't overfetch employees
  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutate } = useCalculatePayrollApi({ payrollId })
  const [editedEmployeeId, setEditedEmployeeId] = useState<string | undefined>(undefined)

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

  return editedEmployeeId ? (
    <PayrollEditEmployee onEvent={wrappedOnEvent} employeeId={editedEmployeeId} />
  ) : (
    <PayrollConfigurationPresentation
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
      employeeCompensations={payrollData.payrollShow?.employeeCompensations || []}
      employeeDetails={employeeData.showEmployees || []}
      payPeriod={payrollData.payrollShow?.payPeriod}
    />
  )
}
