import { useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { ContractorList, type ContractorListTab } from './ContractorList'

export interface ContractorTabFixtures {
  active: Contractor[]
  onboarding: Contractor[]
  dismissed: Contractor[]
}

/**
 * Renders ContractorList for a state demo: holds tab state locally and
 * swaps between fixture sets for each tab. The View takes contractors
 * via props — no MSW, no fetching.
 */
export function ContractorListDemo({ byTab }: { byTab: ContractorTabFixtures }) {
  const [tab, setTab] = useState<ContractorListTab>('active')
  const contractors =
    tab === 'active' ? byTab.active : tab === 'onboarding' ? byTab.onboarding : byTab.dismissed
  return <ContractorList contractors={contractors} selectedTab={tab} onSelectTab={setTab} />
}
