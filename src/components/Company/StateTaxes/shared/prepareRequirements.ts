import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'

/**
 * Resolves each requirement's `applicableIf` constraints against non-editable (system/agency-set)
 * siblings, and drops requirements that can never become applicable — mirroring gws-flows'
 * `TaxRequirements::Edit.prepare_requirements`, which performs this same resolution server-side
 * before Rails renders its own edit view.
 *
 * @remarks
 * A constraint referencing an editable sibling is left untouched, since it can only be resolved
 * dynamically against the user's current form input (see {@link isRequirementApplicable}). A
 * constraint referencing a non-editable sibling is resolved once here, against that sibling's
 * fetched `value`, since a non-editable value can never change over the lifetime of the form:
 * - If the sibling's value satisfies the constraint, the constraint is dropped (the requirement
 *   is always applicable).
 * - If it doesn't, the whole requirement is dropped — it can never become applicable.
 *
 * Non-editable requirements are dropped unconditionally, since they never become form fields.
 *
 * @internal
 */
export function prepareRequirements(requirements: TaxRequirement[]): TaxRequirement[] {
  return requirements.flatMap(requirement => {
    if (requirement.editable === false) return []

    const constraints = requirement.applicableIf ?? []
    const resolvedConstraints: typeof constraints = []

    for (const constraint of constraints) {
      const sibling = requirements.find(candidate => candidate.key === constraint.key)

      if (!sibling || sibling.editable !== false) {
        resolvedConstraints.push(constraint)
        continue
      }

      if (sibling.value === constraint.value) continue

      return []
    }

    return [{ ...requirement, applicableIf: resolvedConstraints }]
  })
}

/**
 * Whether a requirement set has anything left to edit once {@link prepareRequirements} resolves
 * non-editable-sibling constraints and drops non-editable/unsatisfiable requirements — mirroring
 * gws-flows' `TaxRequirements::Edit.set_editable?`.
 *
 * @internal
 */
export function isRequirementSetEditable(requirements: TaxRequirement[]): boolean {
  return prepareRequirements(requirements).length > 0
}
