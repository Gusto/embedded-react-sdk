import { PayrollConfigurationBlock } from '../PayrollConfiguration/PayrollConfigurationBlock'
import { PayrollListBlock } from '../PayrollList/PayrollListBlock'
import { PayrollOverviewBlock } from '../PayrollOverview/PayrollOverviewBlock'
import { RunPayroll } from './RunPayroll'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

interface RunPayrollFlowProps extends BaseComponentInterface {
  companyId: string
}

export const RunPayrollFlow = ({ companyId, onEvent }: RunPayrollFlowProps) => {
  return (
    <BaseComponent onEvent={onEvent}>
      <RunPayroll
        companyId={companyId}
        Configuration={PayrollConfigurationBlock}
        List={PayrollListBlock}
        Overview={PayrollOverviewBlock}
        onEvent={onEvent}
      />
    </BaseComponent>
  )
}
