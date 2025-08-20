import { useState } from 'react'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import type { EventType } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

//TODO: Use Speakeasy type
interface PayrollItem {
  payrollId: string
}

// TODO: Replace this hook with call to Speakeasy instead
const usePayrollApi = ({ payrollId }: PayrollItem) => {
  return {
    data: {
      employees: [{ employeeId: 'cdef' }],
    },
  }
}
// TODO: Replace this hook with call to Speakeasy instead
const useCalculatePayrollApi = ({ payrollId }: PayrollItem) => {
  const mutate = async () => {}
  return { mutate }
}

interface PayrollConfigurationProps extends BaseComponentInterface {
  payrollId: string
}
export const PayrollConfiguration = ({
  onEvent,
  payrollId,
  ...baseProps
}: PayrollConfigurationProps) => {
  const {
    data: { employees },
  } = usePayrollApi({ payrollId })
  const { mutate } = useCalculatePayrollApi({ payrollId })
  const [editedEmployeeId, setEditedEmployeeId] = useState<string | undefined>(undefined)
  const onBack = () => {
    onEvent(componentEvents.RUN_PAYROLL_BACK)
  }
  const onCalculatePayroll = async () => {
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_CALCULATED)
  }
  const onEdit = ({ employeeId }: { employeeId: string }) => {
    setEditedEmployeeId(employeeId)
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDITED, { employeeId })
  }

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    if (event === componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED) {
      setEditedEmployeeId(undefined)
    }
    onEvent(event as EventType, payload)
  }

  const childComponent = editedEmployeeId ? (
    <PayrollEditEmployee onEvent={wrappedOnEvent} employeeId={editedEmployeeId} />
  ) : (
    <PayrollConfigurationPresentation
      employees={employees}
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
    />
  )

  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      {childComponent}
    </BaseComponent>
  )
}
