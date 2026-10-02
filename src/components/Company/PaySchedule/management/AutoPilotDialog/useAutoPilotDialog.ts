import { useState } from 'react'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

interface UseAutoPilotDialogProps {
  companyId: string
  schedule: PayScheduleShow
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
export function useAutoPilotDialog({ companyId, schedule, onEvent }: UseAutoPilotDialogProps) {
  const [nextEnabled, setNextEnabled] = useState(Boolean(schedule.autoPayroll))
  const [hasGenericError, setHasGenericError] = useState(false)
  const { mutateAsync: updatePaySchedule, isPending: isSaving } = usePaySchedulesUpdateMutation()

  const blockers = schedule.autoPayrollEnablementBlockers ?? []
  // Named blockers only gate enabling; a schedule already enabled can always be disabled.
  const isEnableBlocked = blockers.length > 0 && !schedule.autoPayroll

  const hasChanges = nextEnabled !== Boolean(schedule.autoPayroll)

  const onSave = async () => {
    if (!hasChanges) {
      onEvent(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
      return
    }

    setHasGenericError(false)

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
    } catch {
      // Some save-time failures carry no discriminable key, so they can't be classified.
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
    isSaving,
    hasGenericError,
    onSave,
    onClose,
  }
}
