import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
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

/**
 * Presents the reason selection UI for choosing between a bonus and correction off-cycle payment.
 *
 * @remarks
 * Selecting a reason emits the recommended deduction and withholding defaults alongside the chosen value
 * so a surrounding form can update its state to match.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `offCycle/selectReason` | Fired when the user selects a reason | {@link SelectReasonPayload} |
 *
 * @param props - Component props including `companyId` and standard `onEvent`/`dictionary` handlers.
 * @returns The rendered reason selection UI.
 * @public
 */
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
  const methods = useForm<{ reason: OffCycleReason | '' }>({
    defaultValues: { reason: '' },
  })

  const handleReasonChange = useCallback(
    (reason: OffCycleReason) => {
      const defaults = OFF_CYCLE_REASON_DEFAULTS[reason]
      onEvent(componentEvents.OFF_CYCLE_SELECT_REASON, {
        reason,
        defaults,
      })
    },
    [onEvent],
  )

  return (
    <FormProvider {...methods}>
      <OffCycleReasonSelectionPresentation name="reason" onChange={handleReasonChange} />
    </FormProvider>
  )
}
