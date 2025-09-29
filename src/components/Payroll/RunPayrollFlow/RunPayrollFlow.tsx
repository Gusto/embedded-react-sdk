import { PayrollLanding } from '../PayrollLanding/PayrollLanding'
import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
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
        Landing={PayrollLanding}
        Overview={PayrollOverview}
        EditEmployee={PayrollEditEmployee}
        onEvent={onEvent}
      />
    </BaseComponent>
  )
}
