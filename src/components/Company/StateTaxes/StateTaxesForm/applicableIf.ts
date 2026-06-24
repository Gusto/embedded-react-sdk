import type { TaxRequirement } from '@gusto/embedded-api-v-2025-11-15/models/components/taxrequirement'
import { toRhfKey } from './rhfKey'

export type StateTaxesFormValues = Record<string, Record<string, unknown> | undefined>

/** @internal */
export function isRequirementApplicable(
  requirement: TaxRequirement,
  setKey: string,
  formValues: StateTaxesFormValues,
): boolean {
  const constraints = requirement.applicableIf
  if (!constraints || constraints.length === 0) return true

  const setValues = formValues[setKey]
  if (!setValues) return false

  return constraints.every(({ key, value }) => {
    if (!key) return true
    return setValues[toRhfKey(key)] === value
  })
}
