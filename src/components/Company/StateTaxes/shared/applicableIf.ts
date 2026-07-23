import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { toRhfKey } from './rhfKey'

/**
 * Map of `applicable_if` set key to its values, keyed by RHF-encoded field key.
 * Internal shape used by {@link isRequirementApplicable}.
 *
 * @internal
 */
export type StateTaxesFormValues = Record<string, Record<string, unknown> | undefined>

/** @internal */
export function isRequirementApplicable(
  requirement: TaxRequirement,
  requirementSetKey: string,
  formValues: StateTaxesFormValues,
): boolean {
  const constraints = requirement.applicableIf
  if (!constraints || constraints.length === 0) return true

  const setValues = formValues[requirementSetKey]
  if (!setValues) return false

  return constraints.every(({ key, value }) => {
    if (!key) return true
    return setValues[toRhfKey(key)] === value
  })
}
