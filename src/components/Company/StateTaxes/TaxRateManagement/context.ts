import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'
import { createCompoundContext } from '@/components/Base'

/**
 * A state's effective-dated requirement sets for a single key, grouped for history display,
 * plus any future-dated candidate sets available to schedule against.
 *
 * @internal
 */
export interface TaxRateKeyGroup {
  key: string
  label?: string
  sets: TaxRequirementSet[]
  candidateSets: TaxRequirementSet[]
}

interface TaxRateManagementContextType {
  state: string
  groups: TaxRateKeyGroup[]
  isPendingUpdate: boolean
  handleCancel: () => void
  handleAddRate: (
    key: string,
    effectiveFrom: string,
    requirements: { key: string; value: string }[],
  ) => Promise<boolean>
}

const [useTaxRateManagement, TaxRateManagementProvider] =
  createCompoundContext<TaxRateManagementContextType>('TaxRateManagementContext')

export { useTaxRateManagement, TaxRateManagementProvider }
