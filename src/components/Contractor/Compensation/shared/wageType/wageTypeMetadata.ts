import type { ContractorWageType } from '@gusto/embedded-api/models/components/contractor'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import type { FieldMetadata } from '@/partner-hook-utils/types'

/**
 * Builds the `wageType` field metadata with Fixed/Hourly options in the given order.
 *
 * @param base - Derived base metadata for the `wageType` field.
 * @param order - The order in which the wage type options are listed.
 * @returns The field metadata extended with `options` and `entries`.
 * @internal
 */
export function buildWageTypeFieldMetadata(
  base: FieldMetadata,
  order: Array<(typeof ContractorWageType)[keyof typeof ContractorWageType]>,
) {
  return withOptions(
    base,
    order.map(value => ({ value, label: value })),
    order,
  )
}
