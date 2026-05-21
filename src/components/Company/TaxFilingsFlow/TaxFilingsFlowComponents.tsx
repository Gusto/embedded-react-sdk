import { mockTaxFilings } from './taxFilingsMockData'
import { TaxFilingsList } from './TaxFilingsList'
import { TaxFilingDetail } from './TaxFilingDetail'
import type { BaseComponentInterface } from '@/components/Base'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { taxFilingsEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface TaxFilingsFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface TaxFilingsFlowContextInterface extends FlowContextInterface {
  companyId?: string
  selectedFilingUuid: string | null
}

export function TaxFilingsListContextual() {
  const { onEvent } = useFlow<TaxFilingsFlowContextInterface>()

  return (
    <TaxFilingsList
      filings={mockTaxFilings}
      onSelectFiling={uuid => {
        onEvent(taxFilingsEvents.TAX_FILING_SELECTED, uuid)
      }}
    />
  )
}

export function TaxFilingDetailContextual() {
  const { onEvent, selectedFilingUuid } = useFlow<TaxFilingsFlowContextInterface>()
  const uuid = ensureRequired(selectedFilingUuid)
  const filing = mockTaxFilings.find(f => f.uuid === uuid)

  if (!filing) return null

  return (
    <TaxFilingDetail
      filing={filing}
      onBack={() => {
        onEvent(taxFilingsEvents.TAX_FILING_BACK)
      }}
    />
  )
}
