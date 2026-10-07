import { createMachine } from 'robot3'
import { useEffect, useMemo } from 'react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payScheduleAssignmentStateMachine } from './payScheduleAssignmentStateMachine'
import { AssignmentTypeStep } from './PayScheduleAssignmentComponents'
import type { PayScheduleAssignmentContextInterface } from './usePayScheduleAssignment'
import { stripNullAssignmentPreviewFields } from './stripNullAssignmentPreviewFields'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Props for {@link PayScheduleAssignment}.
 *
 * @alpha
 */
export interface PayScheduleAssignmentProps extends BaseComponentInterface<'Company.Management.PayScheduleAssignment'> {
  /** Company whose pay schedule assignment is managed. */
  companyId: string
}

/**
 * Assigns a company's employees to a pay schedule.
 *
 * @remarks
 * Walks through choosing an assignment type, picking (or creating) a pay schedule, and reviewing
 * the employees and transition payrolls affected before submitting. Two assignment types are
 * supported: one schedule for everyone (`single`), or separate schedules for hourly and salaried
 * employees (`hourly_salaried`). Picking the same schedule for both compensation types is
 * submitted as `single`. Can be mounted directly or launched from
 * `CompanyManagement.PaySchedule`'s Manage action.
 *
 * The internal step-to-step selection events (assignment type chosen, schedule picked) also
 * bubble through `onEvent` as a side effect of how the underlying `Flow` re-emits every event —
 * they carry no information a host needs mid-flow, since `assigned` reports the final outcome,
 * so they're intentionally left out of the table below.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `paySchedule/create` | The user chose to add a new pay schedule from the picker step | — |
 * | `paySchedule/created` | A new pay schedule was created from the picker step | `{ paySchedule: PayScheduleShow }` |
 * | `paySchedule/management/assignment/cancel` | The user backed out of the flow entirely, from the first step | — |
 * | `paySchedule/management/assignment/assigned` | The assignment was submitted successfully | `{ employeeChanges: PayScheduleAssignmentEmployeeChange[] }` plus either `{ type: 'single'; defaultPayScheduleUuid: string }` or `{ type: 'hourly_salaried'; hourlyPayScheduleUuid: string; salariedPayScheduleUuid: string }` |
 *
 * @alpha
 */
export const PayScheduleAssignment = ({
  companyId,
  dictionary,
  ...props
}: PayScheduleAssignmentProps) => {
  useUnstableFeature('managePaySchedules', { throwIfDisabled: true })

  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} dictionary={dictionary} />
    </BaseComponent>
  )
}

function Root({ companyId, dictionary }: Omit<PayScheduleAssignmentProps, BaseComponentKeys>) {
  useI18n('Company.Management.PayScheduleAssignment')
  useComponentDictionary('Company.Management.PayScheduleAssignment', dictionary)
  // AssignmentCreateScheduleStep reuses the onboarding PayScheduleForm, whose translations live
  // under its own namespace and are otherwise never loaded from this flow.
  useI18n('Company.PaySchedule')
  const { onEvent } = useBase()

  // Temporary: patch the assignment-preview response before the SDK validates it, and log
  // request/error details for debugging. See stripNullAssignmentPreviewFields for why —
  // remove both alongside it once the OAS is fixed upstream.
  const client = useGustoEmbeddedContext()
  useEffect(() => {
    const hooks = client._options.hooks
    if (!hooks) return
    hooks.registerAfterSuccessHook(stripNullAssignmentPreviewFields)

    return () => {
      // Remove only the single instance this effect registered — filtering the array would
      // also drop another concurrently-mounted instance's registration of the same hook.
      const index = hooks.afterSuccessHooks.indexOf(stripNullAssignmentPreviewFields)
      if (index !== -1) {
        hooks.afterSuccessHooks.splice(index, 1)
      }
    }
  }, [client])

  const machine = useMemo(
    () =>
      createMachine(
        'assignmentType',
        payScheduleAssignmentStateMachine,
        (initialContext: PayScheduleAssignmentContextInterface) => ({
          ...initialContext,
          component: AssignmentTypeStep,
          companyId,
        }),
      ),
    [companyId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
