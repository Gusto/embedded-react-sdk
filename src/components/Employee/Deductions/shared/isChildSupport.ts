import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'

/**
 * Recognizes child support by its garnishment type or order details.
 *
 * @param deduction - The deduction to identify.
 * @returns Whether the deduction is child support.
 * @internal
 */
export function isChildSupport(
  deduction: Pick<Garnishment, 'garnishmentType' | 'childSupport'>,
): boolean {
  return deduction.garnishmentType === 'child_support' || Boolean(deduction.childSupport)
}
