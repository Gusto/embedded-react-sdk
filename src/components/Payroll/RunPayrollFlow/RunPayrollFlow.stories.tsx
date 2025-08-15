import { action } from '@ladle/react'
import { RunPayrollFlow } from './RunPayrollFlow'

export default {
  title: 'Domain/Payroll/Flow',
}
/*
TODO:
* re-enable Flow Story by allowing composition of Block or Presentational components?
  * (RunPayroll is the compositional unit, RunPayrollFlow is the outer interface?)
*/
export const RunPayrollFlowStory = () => {
  return <RunPayrollFlow companyId="abcdef" onEvent={action} />
}
