import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { AutoPilotDialogPresentation } from './AutoPilotDialogPresentation'
import { useAutoPilotDialog } from './useAutoPilotDialog'
import type { EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/** @internal */
export interface AutoPilotDialogProps {
  companyId: string
  schedule: PayScheduleShow
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
export function AutoPilotDialog({ companyId, schedule, onEvent }: AutoPilotDialogProps) {
  const {
    nextEnabled,
    setNextEnabled,
    blockers,
    isEnableBlocked,
    isSaving,
    hasGenericError,
    onSave,
    onClose,
  } = useAutoPilotDialog({ companyId, schedule, onEvent })

  return (
    <AutoPilotDialogPresentation
      scheduleName={schedule.customName ?? schedule.name ?? ''}
      blockers={blockers}
      isEnableBlocked={isEnableBlocked}
      nextEnabled={nextEnabled}
      isSaving={isSaving}
      hasGenericError={hasGenericError}
      onToggle={setNextEnabled}
      onSave={() => void onSave()}
      onClose={onClose}
    />
  )
}
