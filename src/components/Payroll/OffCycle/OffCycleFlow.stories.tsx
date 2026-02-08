import { useState } from 'react'
import { fn } from 'storybook/test'
import { OffCycleFlow } from './OffCycleFlow'

export default {
  title: 'Domain/Payroll/OffCycle/OffCycleFlow',
}

export const Default = () => {
  const [isFlowActive, setIsFlowActive] = useState(false)

  if (!isFlowActive) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      <button onClick={() => setIsFlowActive(true)}>Start Off-Cycle Payroll</button>
    )
  }

  return <OffCycleFlow companyId="test-company-uuid" onEvent={fn().mockName('onEvent')} />
}
