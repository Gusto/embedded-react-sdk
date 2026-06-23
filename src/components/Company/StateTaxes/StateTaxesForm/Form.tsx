import { useStateTaxesForm } from './context'
import { toRhfKey } from './rhfKey'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { Flex } from '@/components/Common/Flex/Flex'

/** @internal */
export function Form() {
  const { stateTaxRequirements } = useStateTaxesForm()

  return (
    <Flex flexDirection="column" gap={20}>
      {stateTaxRequirements.requirementSets?.flatMap(({ requirements, key }) =>
        requirements?.map(requirement => (
          <QuestionInput
            key={`${key}.${requirement.key}`}
            requirement={{
              ...requirement,
              key: `${key}.${toRhfKey(requirement.key as string)}`,
            }}
            questionType={requirement.metadata?.type ?? 'Text'}
          />
        )),
      )}
    </Flex>
  )
}
