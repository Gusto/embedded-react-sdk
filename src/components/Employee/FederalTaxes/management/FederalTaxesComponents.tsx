import { FederalTaxesCard } from './FederalTaxesCard'
import { FederalTaxesEditForm } from './FederalTaxesEditForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface FederalTaxesContextInterface extends FlowContextInterface {
  employeeId?: string
}

export function FederalTaxesCardContextual() {
  const { employeeId, onEvent } = useFlow<FederalTaxesContextInterface>()
  return <FederalTaxesCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function FederalTaxesEditFormContextual() {
  const { employeeId, onEvent } = useFlow<FederalTaxesContextInterface>()
  return <FederalTaxesEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
