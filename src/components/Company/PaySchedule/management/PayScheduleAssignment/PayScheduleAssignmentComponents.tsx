import { useEffect, useState } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesPreviewAssignmentMutation } from '@gusto/embedded-api/react-query/paySchedulesPreviewAssignment'
import { usePaySchedulesAssignMutation } from '@gusto/embedded-api/react-query/paySchedulesAssign'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleAssignmentBody } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { AssignmentTypeStepPresentation } from './AssignmentTypeStepPresentation'
import { AssignmentScheduleStepPresentation } from './AssignmentScheduleStepPresentation'
import { AssignmentReviewStepPresentation } from './AssignmentReviewStepPresentation'
import type { PayScheduleAssignmentContextInterface } from './usePayScheduleAssignment'
import { PayScheduleForm } from '@/components/Company/PaySchedule/PayScheduleForm'
import { useFlow } from '@/components/Flow/useFlow'
import { useBase, BaseLayout } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

/** @internal */
export type EventPayloads = {
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED]: { type: PayScheduleAssignmentBodyType }
  [componentEvents.PAY_SCHEDULE_ASSIGNMENT_SCHEDULE_SELECTED]: { defaultPayScheduleUuid: string }
  [componentEvents.PAY_SCHEDULE_CREATED]: { paySchedule: PayScheduleShow }
  [componentEvents.PAY_SCHEDULE_ASSIGNED]: {
    type: PayScheduleAssignmentBodyType
    defaultPayScheduleUuid: string
    employeeChanges: PayScheduleAssignmentEmployeeChange[]
  }
}

/** @internal */
export function AssignmentTypeStep() {
  const { assignmentType, onEvent } = useFlow<PayScheduleAssignmentContextInterface>()

  return (
    <AssignmentTypeStepPresentation
      defaultType={
        assignmentType === PayScheduleAssignmentBodyType.Single ? assignmentType : undefined
      }
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
  const { companyId, defaultPayScheduleUuid, onEvent } =
    useFlow<PayScheduleAssignmentContextInterface>()
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({
    companyId: ensureRequired(companyId),
  })
  const schedules = paySchedules.payScheduleShowResponse ?? []
  const activeSchedule = schedules.find(s => s.active)

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
  const { companyId, assignmentType, defaultPayScheduleUuid, onEvent } =
    useFlow<PayScheduleAssignmentContextInterface>()
  const { baseSubmitHandler, error } = useBase()
  const [employeeChanges, setEmployeeChanges] = useState<
    PayScheduleAssignmentEmployeeChange[] | null
  >(null)
  const { mutateAsync: previewAssignment, isPending: isPreviewLoading } =
    usePaySchedulesPreviewAssignmentMutation()
  const { mutateAsync: assignSchedules, isPending: isAssigning } = usePaySchedulesAssignMutation()

  const payScheduleAssignmentBody: PayScheduleAssignmentBody = {
    type: assignmentType ?? PayScheduleAssignmentBodyType.Single,
    defaultPayScheduleUuid,
  }

  useEffect(() => {
    void baseSubmitHandler(undefined, async () => {
      const response = await previewAssignment({
        request: { companyId: ensureRequired(companyId), payScheduleAssignmentBody },
      })
      setEmployeeChanges(response.payScheduleAssignmentPreview?.employeeChanges ?? [])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, assignmentType, defaultPayScheduleUuid])

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
            request: { companyId: ensureRequired(companyId), payScheduleAssignmentBody },
          })
          onEvent(componentEvents.PAY_SCHEDULE_ASSIGNED, {
            type: payScheduleAssignmentBody.type,
            defaultPayScheduleUuid: ensureRequired(defaultPayScheduleUuid),
            employeeChanges,
          })
        })
      }}
    />
  )
}
