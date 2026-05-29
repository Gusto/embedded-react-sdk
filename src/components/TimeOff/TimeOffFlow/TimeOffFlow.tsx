import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { timeOffMachine, TIME_OFF_SYNCED_STEP_NAMES } from './timeOffStateMachine'
import type { TimeOffFlowProps, TimeOffFlowContextInterface } from './TimeOffFlowComponents'
import { PolicyListContextual } from './TimeOffFlowComponents'
import { Flow, type FlowHistorySyncConfig } from '@/components/Flow/Flow'

const TIME_OFF_HISTORY_SYNC: FlowHistorySyncConfig = {
  validStateNames: TIME_OFF_SYNCED_STEP_NAMES,
  terminalStateNames: [],
  // After a policy is created, the detail view replaces the add-employees step
  // in history so the back button doesn't return the user to an empty form
  // for a policy that already exists.
  replaceStateTransitions: [
    { from: 'addEmployeesToPolicy', to: 'viewTimeOffPolicyDetail' },
    { from: 'addEmployeesHoliday', to: 'viewHolidayEmployees' },
  ],
}

export const TimeOffFlow = ({ companyId, onEvent }: TimeOffFlowProps) => {
  const timeOffFlow = useMemo(
    () =>
      createMachine(
        'policyList',
        timeOffMachine,
        (initialContext: TimeOffFlowContextInterface) => ({
          ...initialContext,
          component: PolicyListContextual,
          companyId,
        }),
      ),
    [companyId],
  )
  return <Flow machine={timeOffFlow} onEvent={onEvent} historySync={TIME_OFF_HISTORY_SYNC} />
}
