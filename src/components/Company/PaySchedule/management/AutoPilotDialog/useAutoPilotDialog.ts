import { useState } from 'react'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import { normalizeToSDKError } from '@/types/sdkError'

interface UseAutoPilotDialogProps {
  companyId: string
  schedule: PayScheduleShow
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
export function useAutoPilotDialog({ companyId, schedule, onEvent }: UseAutoPilotDialogProps) {
  const [nextEnabled, setNextEnabled] = useState(Boolean(schedule.autoPayroll))
  const [hasGenericError, setHasGenericError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const { mutateAsync: updatePaySchedule, isPending: isSaving } = usePaySchedulesUpdateMutation()

  // The list call never returns `autoPayrollEnablementBlockers` -- only the show call does.
  // Blockers only gate enabling, so skip the fetch entirely when the schedule is already on.
  const shouldCheckBlockers = !schedule.autoPayroll
  const {
    data: scheduleDetails,
    isLoading: isLoadingBlockers,
    isError: hasBlockersError,
  } = usePaySchedulesGet(
    { companyId, payScheduleId: schedule.uuid },
    { enabled: shouldCheckBlockers },
  )

  const blockers = scheduleDetails?.payScheduleShow?.autoPayrollEnablementBlockers ?? []
  // Named blockers only gate enabling; a schedule already enabled can always be disabled.
  // A failed eligibility check also blocks enabling -- we can't confirm blockers are clear,
  // so default to the safe outcome instead of letting the user bypass an unchecked blocker.
  const isEnableBlocked =
    shouldCheckBlockers && (isLoadingBlockers || hasBlockersError || blockers.length > 0)

  const hasChanges = nextEnabled !== Boolean(schedule.autoPayroll)

  const onSave = async () => {
    if (!hasChanges) {
      onEvent(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
      return
    }

    setHasGenericError(false)
    setErrorMessage(undefined)

    try {
      await updatePaySchedule({
        request: {
          companyId,
          payScheduleId: schedule.uuid,
          payScheduleUpdateRequest: {
            version: schedule.version,
            autoPayroll: nextEnabled,
          },
        },
      })
      onEvent(
        nextEnabled
          ? componentEvents.PAY_SCHEDULE_AUTO_PILOT_ENABLED
          : componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISABLED,
        null,
      )
    } catch (err) {
      // The API returns this as a single error keyed `auto_payroll` with a human-readable
      // message (e.g. which blocker tripped). Fall back to the canned copy only when the
      // error can't be parsed into that shape at all.
      setErrorMessage(normalizeToSDKError(err).fieldErrors[0]?.message)
      setHasGenericError(true)
    }
  }

  const onClose = () => {
    onEvent(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
  }

  return {
    nextEnabled,
    setNextEnabled,
    blockers,
    isEnableBlocked,
    isLoadingBlockers: shouldCheckBlockers && isLoadingBlockers,
    isSaving,
    hasGenericError,
    errorMessage,
    onSave,
    onClose,
  }
}
