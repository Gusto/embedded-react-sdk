import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { PayrollList } from '../PayrollList/PayrollList'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { RunPayroll } from './RunPayroll'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

interface RunPayrollFlowProps extends BaseComponentInterface {
  companyId: string
}

export const RunPayrollFlow = ({ companyId, onEvent, ...baseProps }: RunPayrollFlowProps) => {
  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      <RunPayroll
        companyId={companyId}
        Configuration={PayrollConfiguration}
        List={PayrollList}
        Overview={PayrollOverview}
        onEvent={onEvent}
      />
    </BaseComponent>
  )
}
