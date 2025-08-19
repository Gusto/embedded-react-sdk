import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { componentEvents } from '@/shared/constants'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

//TODO: Use Speakeasy type
interface Employee {
  employeeId: string
}

// TODO: Replace this hook with call to Speakeasy instead
const useEditEmployeeApi = ({ employeeId }: Employee) => {
  const mutate = async () => {}
  return { mutate }
}

interface PayrollEditEmployeeProps extends BaseComponentInterface {
  employeeId: string
}

export const PayrollEditEmployee = ({
  employeeId,
  onEvent,
  ...baseProps
}: PayrollEditEmployeeProps) => {
  const { mutate } = useEditEmployeeApi({ employeeId })
  const onDone = async () => {
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED)
  }
  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      <PayrollEditEmployeePresentation onDone={onDone} />
    </BaseComponent>
  )
}
