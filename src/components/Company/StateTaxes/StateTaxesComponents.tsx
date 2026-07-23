import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import { TaxRateManagement } from './TaxRateManagement/TaxRateManagement'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface StateTaxesContextInterface extends FlowContextInterface {
  /** UUID of the company whose state taxes are being managed. */
  companyId: string
  /** Two-letter state code currently being edited, when in the form view. */
  state?: string
  /** Current step component rendered by the flow machine. */
  component: React.ComponentType | null
  /** Controls visibility of the Continue button in the state tax list. */
  showContinueButton: boolean
}

/** @internal */
export function StateTaxesListContextual() {
  const { companyId, onEvent, showContinueButton } = useFlow<StateTaxesContextInterface>()
  return (
    <StateTaxesList
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      showContinueButton={showContinueButton}
    />
  )
}

/** @internal */
export function StateTaxesFormContextual() {
  const { companyId, state, onEvent } = useFlow<StateTaxesContextInterface>()
  return (
    <StateTaxesForm
      companyId={ensureRequired(companyId)}
      state={ensureRequired(state)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function TaxRateManagementContextual() {
  const { companyId, state, onEvent } = useFlow<StateTaxesContextInterface>()
  return (
    <TaxRateManagement
      companyId={ensureRequired(companyId)}
      state={ensureRequired(state)}
      onEvent={onEvent}
    />
  )
}
