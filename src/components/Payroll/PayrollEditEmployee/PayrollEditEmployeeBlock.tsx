import { PayrollEditEmployee } from './PayrollEditEmployee'
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

interface PayrollEditEmployeeBlockProps {
  employeeId: string
  onEvent: (event: string, payload: unknown) => void
  onSaved: () => void
}

export const PayrollEditEmployeeBlock = ({
  employeeId,
  onEvent,
  onSaved,
}: PayrollEditEmployeeBlockProps) => {
  const { mutate } = useEditEmployeeApi({ employeeId })
  const onDone = async () => {
    await mutate()
    onSaved()
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollEditEmployee onDone={onDone} />
    </BaseComponent>
  )
}
