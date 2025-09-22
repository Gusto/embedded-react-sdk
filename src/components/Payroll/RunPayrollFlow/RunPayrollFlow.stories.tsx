import { action } from '@ladle/react'
import { RunPayroll } from './RunPayroll'

export default {
  title: 'Domain/Payroll/Flow',
}

export const RunPayrollFlowStory = () => {
  return (
    <RunPayroll
      companyId=""
      Configuration={() => <></>}
      List={() => <></>}
      onEvent={action}
      Overview={() => <></>}
      EditEmployee={() => <></>}
    />
  )
}
