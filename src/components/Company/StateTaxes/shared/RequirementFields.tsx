import { Fragment } from 'react/jsx-runtime'
import { useFormContext, useWatch } from 'react-hook-form'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { getUniqueRhfKey } from './rhfKey'
import { isRequirementApplicable, type StateTaxesFormValues } from './applicableIf'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'

interface RequirementFieldsProps {
  /** Requirements to render as inputs, nested under `setKey` in the form's RHF path. */
  requirements: TaxRequirement[] | undefined
  /** RHF path segment the requirements are nested under, e.g. `taxrates` or `fields`. */
  setKey: string
}

/**
 * Renders one form field per editable, currently-applicable requirement, filtering
 * out non-editable requirements and requirements whose `applicableIf` constraints
 * aren't satisfied by the form's current values.
 *
 * @internal
 */
export function RequirementFields({ requirements, setKey }: RequirementFieldsProps) {
  const { control } = useFormContext()
  const watchedValues = useWatch({ control }) as StateTaxesFormValues

  return (
    <>
      {requirements?.flatMap((requirement, index) => {
        if (requirement.editable === false) return []
        if (!isRequirementApplicable(requirement, setKey, watchedValues)) return []
        return [
          <Fragment key={`${requirement.key ?? 'requirement'}-${index}`}>
            <QuestionInput
              requirement={{
                ...requirement,
                key: `${setKey}.${getUniqueRhfKey(requirement, index, requirements)}`,
              }}
              questionType={requirement.metadata?.type ?? 'Text'}
            />
          </Fragment>,
        ]
      })}
    </>
  )
}
