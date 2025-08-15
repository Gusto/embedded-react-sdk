import { useState } from 'react'
import { PayrollEditEmployeeBlock } from '../PayrollEditEmployee/PayrollEditEmployeeBlock'
import { PayrollConfiguration } from './PayrollConfiguration'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'

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

interface PayrollConfigurationBlockProps extends BaseComponentInterface {
  payrollId: string
}
export const PayrollConfigurationBlock = ({
  onEvent,
  payrollId,
}: PayrollConfigurationBlockProps) => {
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
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, { employeeId })
  }
  const onSaved = () => {
    setEditedEmployeeId(undefined)
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVE)
  }

  const childComponent = editedEmployeeId ? (
    <PayrollEditEmployeeBlock onEvent={onEvent} employeeId={editedEmployeeId} onSaved={onSaved} />
  ) : (
    <PayrollConfiguration
      employees={employees}
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
    />
  )

  return <BaseComponent onEvent={onEvent}>{childComponent}</BaseComponent>
}
