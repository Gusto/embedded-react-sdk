import { useState } from 'react'
import { OFF_CYCLE_REASON_DEFAULTS, type OffCycleReason } from './types'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType } from '@/shared/constants'
import { useI18n } from '@/i18n'

export interface UseOffCycleReasonSelectionParams {
  onEvent: OnEventType<EventType, unknown>
}

export interface UseOffCycleReasonSelectionReturn {
  data: {
    selectedReason: OffCycleReason | null
  }
  actions: {
    onReasonChange: (reason: OffCycleReason) => void
  }
  meta: {
    isPending: false
  }
}

export function useOffCycleReasonSelection({
  onEvent,
}: UseOffCycleReasonSelectionParams): UseOffCycleReasonSelectionReturn {
  useI18n('Payroll.OffCycleReasonSelection')

  const [selectedReason, setSelectedReason] = useState<OffCycleReason | null>(null)

  const onReasonChange = (reason: OffCycleReason) => {
    setSelectedReason(reason)
    const defaults = OFF_CYCLE_REASON_DEFAULTS[reason]
    onEvent(componentEvents.OFF_CYCLE_SELECT_REASON, {
      reason,
      defaults,
    })
  }

  return {
    data: {
      selectedReason,
    },
    actions: {
      onReasonChange,
    },
    meta: {
      isPending: false,
    },
  }
}
