import { useState } from 'react'
import { PayrollEditEmployeeBlock } from '../PayrollEditEmployee/PayrollEditEmployeeBlock'
import { PayrollConfiguration } from './PayrollConfiguration'
import { BaseComponent } from '@/components/Base/Base'

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

interface PayrollConfigurationBlockProps {
  onBack: () => void
  onEvent: (event: string, payload: unknown) => void
  onCalculated: () => void
  payrollId: string
}
export const PayrollConfigurationBlock = ({
  onBack,
  onEvent,
  onCalculated,
  payrollId,
}: PayrollConfigurationBlockProps) => {
  const {
    data: { employees },
  } = usePayrollApi({ payrollId })
  const { mutate } = useCalculatePayrollApi({ payrollId })
  const [editedEmployeeId, setEditedEmployeeId] = useState<string | undefined>(undefined)
  const onCalculatePayroll = async () => {
    await mutate()
    onCalculated()
  }
  const onEdit = ({ employeeId }: { employeeId: string }) => {
    setEditedEmployeeId(employeeId)
  }
  const onSaved = () => {
    setEditedEmployeeId(undefined)
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
