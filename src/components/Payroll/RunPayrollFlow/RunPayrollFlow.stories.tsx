import { action } from '@ladle/react'
import { RunPayrollFlow } from './RunPayrollFlow'

export default {
  title: 'Domain/Payroll/Flow',
}
/*
TODO:
* Block all the things
* use onEvent for all handlers (?)
* re-enable Flow Story by allowing composition of Block or Presentational components?
  * (RunPayroll is the compositional unit, RunPayrollFlow is the outer interface?)
*/
export const RunPayrollFlowStory = () => {
  return <RunPayrollFlow companyId="abcdef" onEvent={event => action(event)} />
}
