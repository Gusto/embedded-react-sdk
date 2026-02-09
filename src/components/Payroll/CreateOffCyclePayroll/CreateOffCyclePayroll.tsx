import { CreateOffCyclePayrollPresentation } from './CreateOffCyclePayrollPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface CreateOffCyclePayrollProps extends BaseComponentInterface {
  companyId: string
}

export function CreateOffCyclePayroll(props: CreateOffCyclePayrollProps) {
  return (
    <BaseComponent {...props}>
      <Root />
    </BaseComponent>
  )
}

function Root() {
  useI18n('Payroll.CreateOffCyclePayroll')
  const { onEvent } = useBase()

  const handleContinue = () => {
    onEvent(componentEvents.OFF_CYCLE_CREATED, {})
  }

  return <CreateOffCyclePayrollPresentation onContinue={handleContinue} />
}
