import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { employeeListStateMachine } from './employeeListStateMachine'
import {
  EmployeeListContextual,
  type EmployeeListFlowContextInterface,
  type EmployeeListFlowProps,
} from './EmployeeListFlowComponents'
import { Flow } from '@/components/Flow/Flow'

/**
 * Hub for viewing and managing all employees, including onboarding new ones.
 *
 * @remarks
 * Drop-in entry point for managing all employees in a company. Begins on the
 * management employee list and routes into {@link DashboardFlow},
 * {@link TerminationFlow}, or {@link EmployeeOnboarding.OnboardingExecutionFlow | OnboardingExecutionFlow} based on the
 * action the admin invokes on a row (or the "Add employee" CTA). A "Back to
 * employees" header is added to each sub-flow so the admin can return to the
 * list at any time.
 *
 * The flow forwards every event emitted by its sub-components to `onEvent`;
 * see the events table on each sub-component for the full set of events and
 * payloads observable from this flow.
 *
 * @components
 * - {@link EmployeeList}
 * - {@link DashboardFlow}
 * - {@link TerminationFlow}
 * - {@link EmployeeOnboarding.OnboardingExecutionFlow | OnboardingExecutionFlow}
 *
 * @param props - See {@link EmployeeListFlowProps}.
 * @returns The employee list workflow with internal navigation to the dashboard, termination, and onboarding flows.
 * @public
 * @group Flow Components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { EmployeeManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <EmployeeManagement.EmployeeListFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export const EmployeeListFlow = ({ companyId, onEvent }: EmployeeListFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'list',
        employeeListStateMachine,
        (initialContext: EmployeeListFlowContextInterface) => ({
          ...initialContext,
          component: EmployeeListContextual,
          companyId,
        }),
      ),
    [companyId],
  )
  return <Flow machine={machine} onEvent={onEvent} />
}
