import { PayrollOverview } from './PayrollOverview'
import { componentEvents } from '@/shared/constants'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

//TODO: Use Speakeasy type
interface PayrollItem {
  payrollId: string
}

// TODO: Replace this hook with call to Speakeasy instead
const useSubmitPayrollApi = ({ payrollId }: PayrollItem) => {
  const mutate = async () => {}
  return { mutate }
}

interface PayrollOverviewBlockProps extends BaseComponentInterface {
  payrollId: string
}

export const PayrollOverviewBlock = ({ onEvent, payrollId }: PayrollOverviewBlockProps) => {
  const { mutate } = useSubmitPayrollApi({ payrollId })

  const onEdit = () => {
    onEvent(componentEvents.RUN_PAYROLL_EDITED)
  }
  const onSubmit = async () => {
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_SUBMITTED)
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollOverview onEdit={onEdit} onSubmit={onSubmit} />
    </BaseComponent>
  )
}
