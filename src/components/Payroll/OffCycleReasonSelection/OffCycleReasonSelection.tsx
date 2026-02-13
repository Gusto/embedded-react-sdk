import { OffCycleReasonSelectionPresentation } from './OffCycleReasonSelectionPresentation'
import { useOffCycleReasonSelection } from './useOffCycleReasonSelection'
import { type OffCycleReasonSelectionProps } from './types'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary } from '@/i18n'

export function OffCycleReasonSelection(props: OffCycleReasonSelectionProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ dictionary }: OffCycleReasonSelectionProps) {
  useComponentDictionary('Payroll.OffCycleReasonSelection', dictionary)

  const { onEvent } = useBase()
  const { data, actions, meta } = useOffCycleReasonSelection({ onEvent })

  return <OffCycleReasonSelectionPresentation {...data} {...actions} {...meta} />
}
