import { useEffect, useMemo, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesPreviewAssignmentMutation } from '@gusto/embedded-api/react-query/paySchedulesPreviewAssignment'
import { usePaySchedulesAssignMutation } from '@gusto/embedded-api/react-query/paySchedulesAssign'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { AssignmentTypeStepPresentation } from './AssignmentTypeStepPresentation'
import { AssignmentScheduleStepPresentation } from './AssignmentScheduleStepPresentation'
import { AssignmentCompensationStepPresentation } from './AssignmentCompensationStepPresentation'
import { AssignmentReviewStepPresentation } from './AssignmentReviewStepPresentation'
import type {
  PayScheduleAssignmentContextInterface,
  SupportedAssignmentType,
} from './usePayScheduleAssignment'
import { PayScheduleForm } from '@/components/Company/PaySchedule/PayScheduleForm'
import { useFlow } from '@/components/Flow/useFlow'
import { useBase, BaseLayout } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

/**
 * The assignment the user built, already collapsed to the type that actually gets submitted.
 * Doubles as the request body and as the `assigned` event payload.
 *
 * @internal
 */
export type AssignmentSelection =
  | {
      type: typeof PayScheduleAssignmentBodyType.Single
      defaultPayScheduleUuid: string
    }
  | {
      type: typeof PayScheduleAssignmentBodyType.HourlySalaried
      hourlyPayScheduleUuid: string
      salariedPayScheduleUuid: string
    }

/** @internal */
export type EventPayloads = {
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED]: { type: SupportedAssignmentType }
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED]:
    | { defaultPayScheduleUuid: string }
    | { hourlyPayScheduleUuid: string; salariedPayScheduleUuid: string }
  [componentEvents.PAY_SCHEDULE_CREATED]: { paySchedule: PayScheduleShow }
  [componentEvents.PAY_SCHEDULE_ASSIGNED]: AssignmentSelection & {
    employeeChanges: PayScheduleAssignmentEmployeeChange[]
  }
}

/** @internal */
export function AssignmentTypeStep() {
  const { assignmentType, onEvent } = useFlow<PayScheduleAssignmentContextInterface>()

  return (
    <AssignmentTypeStepPresentation
      defaultType={assignmentType}
      onBack={() => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_CANCEL)
      }}
      onContinue={type => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED, { type })
      }}
    />
  )
}

/** @internal */
export function AssignmentScheduleStep() {
  const {
    companyId,
    assignmentType,
    defaultPayScheduleUuid,
    hourlyPayScheduleUuid,
    salariedPayScheduleUuid,
    onEvent,
  } = useFlow<PayScheduleAssignmentContextInterface>()
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({
    companyId: ensureRequired(companyId),
  })
  const schedules = paySchedules.payScheduleShowResponse ?? []
  const activeSchedule = schedules.find(s => s.active)

  if (assignmentType === PayScheduleAssignmentBodyType.HourlySalaried) {
    return (
      <AssignmentCompensationStepPresentation
        schedules={schedules}
        hourlyPayScheduleUuid={hourlyPayScheduleUuid ?? activeSchedule?.uuid}
        salariedPayScheduleUuid={salariedPayScheduleUuid ?? activeSchedule?.uuid}
        onBack={() => {
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK)
        }}
        onAddPaySchedule={() => {
          onEvent(componentEvents.PAY_SCHEDULE_CREATE)
        }}
        onContinue={selection => {
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED, selection)
        }}
      />
    )
  }

  return (
    <AssignmentScheduleStepPresentation
      schedules={schedules}
      defaultPayScheduleUuid={defaultPayScheduleUuid ?? activeSchedule?.uuid}
      onBack={() => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK)
      }}
      onAddPaySchedule={() => {
        onEvent(componentEvents.PAY_SCHEDULE_CREATE)
      }}
      onContinue={uuid => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED, {
          defaultPayScheduleUuid: uuid,
        })
      }}
    />
  )
}

/** @internal */
export function AssignmentCreateScheduleStep() {
  const { companyId, onEvent } = useFlow<PayScheduleAssignmentContextInterface>()

  return <PayScheduleForm companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function AssignmentReviewStep() {
  const {
    companyId,
    assignmentType,
    defaultPayScheduleUuid,
    hourlyPayScheduleUuid,
    salariedPayScheduleUuid,
    onEvent,
  } = useFlow<PayScheduleAssignmentContextInterface>()
  const { baseSubmitHandler, error } = useBase()
  const [employeeChanges, setEmployeeChanges] = useState<
    PayScheduleAssignmentEmployeeChange[] | null
  >(null)
  const { mutateAsync: previewAssignment, isPending: isPreviewLoading } =
    usePaySchedulesPreviewAssignmentMutation()
  const { mutateAsync: assignSchedules, isPending: isAssigning } = usePaySchedulesAssignMutation()

  const assignment: AssignmentSelection = useMemo(() => {
    if (assignmentType === PayScheduleAssignmentBodyType.HourlySalaried) {
      const hourly = ensureRequired(hourlyPayScheduleUuid)
      const salaried = ensureRequired(salariedPayScheduleUuid)

      // One schedule for both compensation types is a single-schedule assignment. Collapsing
      // here rather than at submit keeps the previewed changes identical to what gets sent.
      if (hourly === salaried) {
        return {
          type: PayScheduleAssignmentBodyType.Single,
          defaultPayScheduleUuid: hourly,
        }
      }

      return {
        type: PayScheduleAssignmentBodyType.HourlySalaried,
        hourlyPayScheduleUuid: hourly,
        salariedPayScheduleUuid: salaried,
      }
    }

    return {
      type: PayScheduleAssignmentBodyType.Single,
      defaultPayScheduleUuid: ensureRequired(defaultPayScheduleUuid),
    }
  }, [assignmentType, defaultPayScheduleUuid, hourlyPayScheduleUuid, salariedPayScheduleUuid])

  useEffect(() => {
    void baseSubmitHandler(undefined, async () => {
      const response = await previewAssignment({
        request: { companyId: ensureRequired(companyId), payScheduleAssignmentBody: assignment },
      })
      setEmployeeChanges(response.payScheduleAssignmentPreview?.employeeChanges ?? [])
    })
  }, [companyId, assignment, previewAssignment, baseSubmitHandler])

  // The enclosing BaseComponent's own BaseLayout already renders `error` for this whole
  // component tree, so surface only the loading state here to avoid rendering it twice.
  if (error) {
    return null
  }
  if (isPreviewLoading || !employeeChanges) {
    return <BaseLayout isLoading />
  }

  return (
    <AssignmentReviewStepPresentation
      employeeChanges={employeeChanges}
      isSubmitting={isAssigning}
      onBack={() => {
        onEvent(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK)
      }}
      onSubmit={() => {
        void baseSubmitHandler(undefined, async () => {
          await assignSchedules({
            request: {
              companyId: ensureRequired(companyId),
              payScheduleAssignmentBody: assignment,
            },
          })
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNED, { ...assignment, employeeChanges })
        })
      }}
    />
  )
}
