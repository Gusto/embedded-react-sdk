import { Fragment } from 'react/jsx-runtime'
import { useFormContext, useWatch } from 'react-hook-form'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { getUniqueRhfKey } from './rhfKey'
import { isRequirementApplicable, type StateTaxesFormValues } from './applicableIf'
import { prepareRequirements } from './prepareRequirements'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'

interface RequirementFieldsProps {
  /**
   * Requirements to render as inputs, nested under `requirementSetKey` in the form's RHF path.
   * Non-editable requirements, and requirements resolved as never-applicable against a
   * non-editable sibling, are dropped via {@link prepareRequirements} before rendering.
   */
  requirements: TaxRequirement[] | undefined
  /** RHF path segment the requirements are nested under, e.g. `taxrates` or `fields`. */
  requirementSetKey: string
}

/**
 * Renders one form field per editable, currently-applicable requirement, filtering
 * out requirements with no `key` (the API doesn't guarantee one, and without it there's no stable
 * form path to register) and requirements whose `applicableIf` constraints aren't satisfied by
 * the form's current values.
 *
 * @internal
 */
export function RequirementFields({ requirements, requirementSetKey }: RequirementFieldsProps) {
  const { control } = useFormContext()
  const watchedValues = useWatch({ control }) as StateTaxesFormValues
  const preparedRequirements = prepareRequirements(requirements ?? [])

  return (
    <>
      {preparedRequirements.flatMap((requirement, index) => {
        if (!requirement.key) return []
        if (!isRequirementApplicable(requirement, requirementSetKey, watchedValues)) return []
        return [
          <Fragment key={`${requirement.key}-${index}`}>
            <QuestionInput
              requirement={{
                ...requirement,
                key: `${requirementSetKey}.${getUniqueRhfKey(requirement, index, preparedRequirements)}`,
              }}
              questionType={requirement.metadata?.type ?? 'Text'}
            />
          </Fragment>,
        ]
      })}
    </>
  )
}
