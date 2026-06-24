import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { timeOffMachine } from './timeOffStateMachine'
import type { TimeOffFlowProps, TimeOffFlowContextInterface } from './TimeOffFlowComponents'
import { PolicyListContextual } from './TimeOffFlowComponents'
import { Flow } from '@/components/Flow/Flow'

/**
 * End-to-end workflow for creating and managing a company's sick, vacation, and holiday time off policies.
 *
 * @remarks
 * Composes the time off list, policy-type selection, configuration, settings, employee assignment, and policy detail screens into a single multi-step flow. Sick and vacation policies share a common creation path (configure → settings → add employees); holiday policies follow a separate path (select federal holidays → add employees). All policy types can be viewed, edited, and removed from the unified policy list.
 *
 * The flow emits these events as users navigate:
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/createPolicy` | User initiates policy creation | — |
 * | `timeOff/viewPolicy` | User selects a policy to view | `{ policyId: string, policyType: string }` |
 * | `timeOff/policyTypeSelected` | User selects a policy type | `{ policyType: 'sick' \| 'vacation' \| 'holiday' }` |
 * | `timeOff/policyDetails/done` | Policy details form is submitted | `{ policyId: string, accrualMethod: string }` |
 * | `timeOff/policySettings/done` | Policy settings are saved | TimeOffPolicy response |
 * | `timeOff/policySettings/back` | User navigates back from settings | — |
 * | `timeOff/addEmployees/done` | Employees are added to a sick/vacation policy | TimeOffPolicy response |
 * | `timeOff/addEmployees/back` | User navigates back from employee selection | — |
 * | `timeOff/holidaySelection/done` | Holiday selection completed (create) | — |
 * | `timeOff/holidaySelection/editDone` | Holiday selection completed (edit) | — |
 * | `timeOff/holidayAddEmployees/done` | Employees added to holiday policy | HolidayPayPolicy response |
 * | `timeOff/backToList` | User navigates back to the policy list | — |
 * | `timeOff/editPolicy` | User edits a sick/vacation policy | `{ policyId: string }` |
 * | `timeOff/changeSettings` | User edits policy settings | `{ policyId: string }` |
 * | `timeOff/addEmployeesToPolicy` | User adds employees from a policy detail | `{ policyId: string }` |
 * | `timeOff/holidayAddEmployees` | User adds employees from holiday detail | — |
 * | `timeOff/editHolidayPolicy` | User edits the holiday policy | — |
 * | `timeOff/viewHolidayEmployees` | User switches to the holiday employees tab | — |
 * | `timeOff/viewHolidaySchedule` | User switches to the holiday schedule tab | — |
 * | `timeOff/policyCreate/error` | Policy creation fails | `{ alert?: { type, title, content? } }` |
 * | `timeOff/policySettings/error` | Policy settings update fails | `{ alert?: { type, title, content? } }` |
 * | `timeOff/addEmployees/error` | Adding employees to a policy fails | `{ alert?: { type, title, content? } }` |
 * | `timeOff/holidayCreate/error` | Holiday policy creation fails | `{ alert?: { type, title, content? } }` |
 * | `timeOff/holidayAddEmployees/error` | Adding employees to the holiday policy fails | `{ alert?: { type, title, content? } }` |
 * | `CANCEL` | User cancels the current step | — |
 *
 * Only one holiday policy can exist per company; the policy-type selector disables the holiday option once one is configured.
 *
 * @components
 * - {@link PolicyList}
 * - {@link PolicyTypeSelector}
 * - {@link PolicyConfigurationForm}
 * - {@link PolicySettings}
 * - {@link AddEmployeesToPolicy}
 * - {@link TimeOffPolicyDetail}
 * - {@link HolidaySelectionForm}
 * - {@link AddEmployeesHoliday}
 * - {@link ViewHolidayEmployees}
 * - {@link ViewHolidaySchedule}
 *
 * @param props - {@link TimeOffFlowProps} with the company identifier and event handler.
 * @returns The composed time off policy management flow.
 * @public
 */
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
  return <Flow machine={timeOffFlow} onEvent={onEvent} />
}
