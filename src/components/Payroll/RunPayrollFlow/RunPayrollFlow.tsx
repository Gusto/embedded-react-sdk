import { PayrollLanding } from '../PayrollLanding/PayrollLanding'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

interface RunPayrollFlowProps extends BaseComponentInterface {
  companyId: string
}

export const RunPayrollFlow = ({ companyId, onEvent, ...baseProps }: RunPayrollFlowProps) => {
  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      <PayrollLanding companyId={companyId} onEvent={onEvent} />
    </BaseComponent>
  )
}
