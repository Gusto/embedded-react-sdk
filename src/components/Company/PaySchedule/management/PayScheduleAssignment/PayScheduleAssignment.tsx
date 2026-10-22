import { createMachine } from 'robot3'
import { useEffect, useMemo, useState } from 'react'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { usePaySchedulesGetAssignmentsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import { PayScheduleAssignmentType } from '@gusto/embedded-api/models/components/payscheduleassignment'
import type { PayScheduleAssignment as PayScheduleAssignmentEntity } from '@gusto/embedded-api/models/components/payscheduleassignment'
import { payScheduleAssignmentStateMachine } from './payScheduleAssignmentStateMachine'
import { AssignmentTypeStep } from './PayScheduleAssignmentComponents'
import type {
  PayScheduleAssignmentContextInterface,
  SupportedAssignmentType,
} from './usePayScheduleAssignment'
import { stripNullAssignmentPreviewFields } from './stripNullAssignmentPreviewFields'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

type AssignmentSeed = Pick<
  PayScheduleAssignmentContextInterface,
  | 'assignmentType'
  | 'defaultPayScheduleUuid'
  | 'hourlyPayScheduleUuid'
  | 'salariedPayScheduleUuid'
  | 'departments'
>

function toSupportedType(
  type: PayScheduleAssignmentType | null | undefined,
): SupportedAssignmentType | undefined {
  switch (type) {
    case PayScheduleAssignmentType.Single:
    case PayScheduleAssignmentType.HourlySalaried:
    case PayScheduleAssignmentType.ByDepartment:
      return type
    default:
      return undefined
  }
}

/**
 * Builds the flow's starting context from the company's current assignment, so the flow opens
 * on what's already configured instead of proposing a change the user didn't ask for. The type
 * and the uuids have to travel together — without the type, the type step's first Continue
 * counts as a type change and clears the uuids.
 */
function toAssignmentSeed(assignment: PayScheduleAssignmentEntity | undefined): AssignmentSeed {
  const assignmentType = toSupportedType(assignment?.type)

  if (!assignmentType) {
    return {}
  }

  return {
    assignmentType,
    defaultPayScheduleUuid: assignment?.defaultPayScheduleUuid ?? undefined,
    hourlyPayScheduleUuid: assignment?.hourlyPayScheduleUuid ?? undefined,
    salariedPayScheduleUuid: assignment?.salariedPayScheduleUuid ?? undefined,
    departments: assignment?.departments?.flatMap(({ departmentUuid, payScheduleUuid }) =>
      departmentUuid && payScheduleUuid ? [{ departmentUuid, payScheduleUuid }] : [],
    ),
  }
}

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
 * the employees and transition payrolls affected before submitting. Opens on the company's
 * current assignment, so submitting without changing anything is a no-op rather than a
 * reassignment. Supports one schedule for everyone (`single`), separate schedules for hourly
 * and salaried employees (`hourly_salaried`), or schedules by department (`by_department`),
 * including a default for employees without a department. Selecting one schedule for every
 * group is submitted as `single`. Can be mounted directly or launched from
 * `CompanyManagement.PaySchedule`'s Manage action.
 *
 * Step selection events also bubble through `onEvent`; the `assigned` event reports the
 * final outcome. Adding a pay schedule can include the current selections in its event payload.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `paySchedule/create` | The user chose to add a new pay schedule from the picker step | Optional current selections: `{ defaultPayScheduleUuid?: string; hourlyPayScheduleUuid?: string; salariedPayScheduleUuid?: string; departments?: { departmentUuid: string; payScheduleUuid: string }[] }` |
 * | `paySchedule/created` | A new pay schedule was created from the picker step | `{ paySchedule: PayScheduleShow }` |
 * | `paySchedule/management/assignment/cancel` | The user backed out of the flow entirely, from the first step | — |
 * | `paySchedule/management/assignment/assigned` | The assignment was submitted successfully | `{ employeeChanges: PayScheduleAssignmentEmployeeChange[] }` plus either `{ type: 'single'; defaultPayScheduleUuid: string }` or `{ type: 'hourly_salaried'; hourlyPayScheduleUuid: string; salariedPayScheduleUuid: string }` or `{ type: 'by_department'; defaultPayScheduleUuid: string; departments: { departmentUuid: string; payScheduleUuid: string }[] }` |
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

  const { data: assignments } = usePaySchedulesGetAssignmentsSuspense({ companyId })

  /**
   * Freeze the company's current assignment as the flow's starting point. Submitting the flow
   * invalidates the whole SDK namespace, so this query refetches mid-submit — recomputing the
   * seed would re-seat the machine back to the first step and orphan its interpreter.
   */
  const [seed] = useState(() => toAssignmentSeed(assignments.payScheduleAssignment))

  const machine = useMemo(
    () =>
      createMachine(
        'assignmentType',
        payScheduleAssignmentStateMachine,
        (initialContext: PayScheduleAssignmentContextInterface) => ({
          ...initialContext,
          component: AssignmentTypeStep,
          companyId,
          ...seed,
        }),
      ),
    [companyId, seed],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
