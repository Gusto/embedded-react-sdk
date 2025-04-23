import * as v from 'valibot'
// import { useTranslation } from 'react-i18next'
import { Flex, TextInputField } from '@/components/Common'

export const StateFormSchema = v.object({
  states: v.record(v.string(), v.record(v.string(), v.unknown())),
})

export type StateFormInputs = v.InferInput<typeof StateFormSchema>

export function Form() {
  // const { t } = useTranslation('Company.StateTaxes')

  return (
    <Flex flexDirection="column" gap={20}>
      <TextInputField name="street1" isRequired label={'foo'} errorMessage={'foo failed'} />
    </Flex>
  )
}
