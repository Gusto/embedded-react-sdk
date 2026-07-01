import type { Contractor } from '@gusto/embedded-api-v-2026-02-01/models/components/contractor'
import { ContractorDetails } from './ContractorDetails'

export interface ContractorDetailsDemoProps {
  contractor: Contractor
  /** When true, render the Edit button with a no-op handler. */
  editable?: boolean
}

/**
 * Renders ContractorDetails for state demos. The component is purely
 * presentational and doesn't use `useBase`, so no BaseComponent wrapper
 * is needed.
 */
export function ContractorDetailsDemo({ contractor, editable }: ContractorDetailsDemoProps) {
  return <ContractorDetails contractor={contractor} onEdit={editable ? () => {} : undefined} />
}
