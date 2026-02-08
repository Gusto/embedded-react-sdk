import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface CreateOffCyclePayrollProps extends BaseComponentInterface {
  companyId: string
}

export function CreateOffCyclePayroll(props: CreateOffCyclePayrollProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ onEvent }: CreateOffCyclePayrollProps) {
  const Components = useComponentContext()

  const handleContinue = () => {
    onEvent(componentEvents.OFF_CYCLE_CREATED, {})
  }

  return (
    <Components.Button variant="primary" onClick={handleContinue}>
      Create Off-Cycle Payroll (Placeholder)
    </Components.Button>
  )
}
