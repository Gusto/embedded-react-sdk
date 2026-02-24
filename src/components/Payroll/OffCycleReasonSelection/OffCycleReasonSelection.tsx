import { useEffect, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
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
  const methods = useForm<{ reason: OffCycleReason | '' }>({
    defaultValues: { reason: '' },
  })

  const selectedReason = useWatch({ control: methods.control, name: 'reason' })
  const previousReasonRef = useRef(selectedReason)

  useEffect(() => {
    if (selectedReason && selectedReason !== previousReasonRef.current) {
      previousReasonRef.current = selectedReason
      const defaults = OFF_CYCLE_REASON_DEFAULTS[selectedReason]
      onEvent(componentEvents.OFF_CYCLE_SELECT_REASON, {
        reason: selectedReason,
        defaults,
      })
    }
  }, [selectedReason, onEvent])

  return (
    <FormProvider {...methods}>
      <OffCycleReasonSelectionPresentation name="reason" />
    </FormProvider>
  )
}
