import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import type { StateTaxesStateData } from './stateTaxesReducer'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface StateTaxesContextInterface {
  companyId: string
  stateData: StateTaxesStateData
  onEvent: OnEventType<EventType, unknown>
}

export function StateTaxesListContextual({ companyId, onEvent }: StateTaxesContextInterface) {
  return <StateTaxesList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function StateTaxesFormContextual({
  companyId,
  stateData,
  onEvent,
}: StateTaxesContextInterface) {
  return (
    <StateTaxesForm
      companyId={ensureRequired(companyId)}
      state={ensureRequired(stateData.selectedState)}
      onEvent={onEvent}
    />
  )
}
