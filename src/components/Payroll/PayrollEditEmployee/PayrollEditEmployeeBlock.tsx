import { PayrollEditEmployee } from './PayrollEditEmployee'
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

interface PayrollEditEmployeeBlockProps extends BaseComponentInterface {
  employeeId: string
}

export const PayrollEditEmployeeBlock = ({
  employeeId,
  onEvent,
}: PayrollEditEmployeeBlockProps) => {
  const { mutate } = useEditEmployeeApi({ employeeId })
  const onDone = async () => {
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVE)
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollEditEmployee onDone={onDone} />
    </BaseComponent>
  )
}
