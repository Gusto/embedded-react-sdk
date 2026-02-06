import { useState } from 'react'
import { OffCycleReasonSelectionPresentation } from './OffCycleReasonSelectionPresentation'
import {
  OFF_CYCLE_REASON_DEFAULTS,
  type OffCycleReason,
  type OffCycleReasonSelectionProps,
} from './types'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export function OffCycleReasonSelection(props: OffCycleReasonSelectionProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ dictionary }: OffCycleReasonSelectionProps) {
  useComponentDictionary('Payroll.OffCycleReasonSelection', dictionary)
  useI18n('Payroll.OffCycleReasonSelection')

  const { onEvent } = useBase()
  const [selectedReason, setSelectedReason] = useState<OffCycleReason | null>(null)

  const handleReasonChange = (reason: OffCycleReason) => {
    setSelectedReason(reason)
    const defaults = OFF_CYCLE_REASON_DEFAULTS[reason]
    onEvent(componentEvents.OFF_CYCLE_SELECT_REASON, {
      reason,
      defaults,
    })
  }

  return (
    <OffCycleReasonSelectionPresentation
      selectedReason={selectedReason}
      onReasonChange={handleReasonChange}
    />
  )
}
