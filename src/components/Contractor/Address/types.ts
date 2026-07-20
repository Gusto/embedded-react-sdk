import type { ContractorAddressFormData } from './shared/useContractorAddressForm'
import type { RequireAtLeastOne } from '@/types/Helpers'

/**
 * Pre-fill values accepted by {@link Address}. At least one of `street1`, `street2`, `city`, `state`, or `zip` must be provided.
 *
 * @public
 */
export type AddressDefaultValues = RequireAtLeastOne<ContractorAddressFormData>
