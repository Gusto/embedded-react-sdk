import { PaystubsCard } from './PaystubsCard'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaystubsProps extends CommonComponentInterface<'Employee.Management.Paystubs'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Paystubs management block. The surface is read-only and has no edit
 * transitions — the only interaction is a per-row PDF download that the
 * card handles as a side effect (opens the PDF in a new tab). The block
 * therefore renders the card directly inside the error boundary; there is
 * no robot3 state machine or `Flow` orchestration because there is
 * nothing to orchestrate. If Paystubs ever grows an edit / review state,
 * adopt the `Profile` / `PaymentMethod` shape (machine + contextual
 * adapter + `Flow`).
 */
export function Paystubs({
  dictionary,
  FallbackComponent,
  employeeId,
  onEvent,
}: PaystubsProps & BaseComponentInterface<'Employee.Management.Paystubs'>) {
  useI18n('Employee.Management.Paystubs')
  useComponentDictionary('Employee.Management.Paystubs', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Paystubs"
      FallbackComponent={FallbackComponent}
    >
      <PaystubsCard employeeId={employeeId} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
