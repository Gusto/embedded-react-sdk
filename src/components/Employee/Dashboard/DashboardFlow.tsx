import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { dashboardStateMachine } from './dashboardStateMachine'
import { type DashboardContextInterface, DashboardViewContextual } from './DashboardComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface DashboardFlowProps extends BaseComponentInterface {
  employeeId: string
}

export const DashboardFlow = ({ employeeId, onEvent }: DashboardFlowProps) => {
  const dashboardMachine = useMemo(
    () =>
      createMachine(
        'index',
        dashboardStateMachine,
        (initialContext: DashboardContextInterface) => ({
          ...initialContext,
          component: DashboardViewContextual,
          employeeId,
        }),
      ),
    [employeeId],
  )

  return <Flow machine={dashboardMachine} onEvent={onEvent} />
}
