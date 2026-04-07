import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { dashboardStateMachine } from './dashboardStateMachine'
import { type DashboardContextInterface, DashboardViewContextual } from './DashboardComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface DashboardProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}

export const Dashboard = ({ companyId, employeeId, onEvent }: DashboardProps) => {
  const dashboardMachine = useMemo(
    () =>
      createMachine(
        'index',
        dashboardStateMachine,
        (initialContext: DashboardContextInterface) => ({
          ...initialContext,
          component: DashboardViewContextual,
          companyId,
          employeeId,
        }),
      ),
    [companyId, employeeId],
  )

  return <Flow machine={dashboardMachine} onEvent={onEvent} />
}
