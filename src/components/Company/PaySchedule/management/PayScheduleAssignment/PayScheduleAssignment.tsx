import { createMachine, type Machine, type SendFunction } from 'robot3'
import { useMachine } from 'react-robot'
import { Suspense, useEffect, useMemo, useState } from 'react'
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
import { assignmentDraftUpdated } from './usePayScheduleAssignment'
import type { AssignmentDraft } from './usePayScheduleAssignment'
import { Flex } from '@/components/Common/Flex'
import { FlowContext } from '@/components/Flow/useFlow'
import type { EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

type AssignmentSeed = Pick<
  PayScheduleAssignmentContextInterface,
  'assignmentType' | 'defaultPayScheduleUuid' | 'hourlyPayScheduleUuid' | 'salariedPayScheduleUuid'
>

function toSupportedType(
  type: PayScheduleAssignmentType | null | undefined,
): SupportedAssignmentType | undefined {
  switch (type) {
    case PayScheduleAssignmentType.Single:
    case PayScheduleAssignmentType.HourlySalaried:
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
 * reassignment. Two assignment types are
 * supported: one schedule for everyone (`single`), or separate schedules for hourly and salaried
 * employees (`hourly_salaried`). Picking the same schedule for both compensation types is
 * submitted as `single`. Can be mounted directly or launched from
 * `CompanyManagement.PaySchedule`'s Manage action.
 *
 * Step selection events also bubble through `onEvent`; the `assigned` event reports the
 * final outcome. Draft updates stay internal to this flow.
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

  return <PayScheduleAssignmentFlow machine={machine} companyId={companyId} onEvent={onEvent} />
}

/**
 * Runs assignment transitions while keeping draft updates inside the flow.
 *
 * @param props - Assignment machine and public event callback.
 * @returns The current assignment step.
 * @internal
 */
export function PayScheduleAssignmentFlow({
  machine,
  companyId,
  onEvent,
}: {
  companyId: string
  machine: Machine<object, PayScheduleAssignmentContextInterface>
  onEvent: OnEventType<EventType, unknown>
}) {
  const { LoadingIndicator } = useBase()
  const [current, send] = useMachine(machine, {
    onEvent: handleEvent,
    updateDraft,
    companyId,
    component: null,
  })
  const sendEvent = send as SendFunction<string>
  function handleEvent(type: EventType, payload: unknown) {
    sendEvent({ type, payload })
    onEvent(type, payload)
  }
  function updateDraft(payload: AssignmentDraft) {
    sendEvent({ type: assignmentDraftUpdated, payload })
  }
  const Component = current.context.component
  return (
    <Flex>
      <FlowContext.Provider value={current.context}>
        <Flex flexDirection="column" gap={32}>
          <Suspense fallback={<LoadingIndicator />}>{Component && <Component />}</Suspense>
        </Flex>
      </FlowContext.Provider>
    </Flex>
  )
}
