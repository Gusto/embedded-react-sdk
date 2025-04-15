import { Fragment } from 'react/jsx-runtime'
import { useFormContext, type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api/models/components/employeestatetaxquestion'
import { useTaxes } from './useTaxes'
import { TaxInputs } from '@/components/Common'
import type { STATES_ABBR } from '@/shared/constants'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

export const StateFormSchema = v.object({
  states: v.record(v.string(), v.record(v.string(), v.unknown())),
})

export type StateFormPayload = v.InferOutput<typeof StateFormSchema>

function QuestionInput({
  question,
  control,
  questionType,
}: {
  question: EmployeeStateTaxQuestion
  control: Control
  questionType: string
}) {
  switch (questionType) {
    case 'Date':
      return <TaxInputs.DateField question={question} control={control} />
    case 'Radio':
      return <TaxInputs.RadioInput question={question} control={control} />
    case 'Autocomplete': //TODO: Need an example Autocomplete response to implement this component. For now falling back to Text
    case 'Text':
      return <TaxInputs.TextInput question={question} control={control} />
    case 'Select':
      return <TaxInputs.SelectInput question={question} control={control} />
    case 'Number':
      return <TaxInputs.NumberInput question={question} control={control} />
    case 'Currency':
      return <TaxInputs.NumberInput question={question} isCurrency control={control} />
    default:
      return null
  }
}

export const StateForm = () => {
  const { employeeStateTaxes, isAdmin } = useTaxes()
  const { control } = useFormContext()
  const { t } = useTranslation('Employee.Taxes')
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  return employeeStateTaxes.map(({ state, questions }) => (
    <Fragment key={state}>
      <h2>{t('stateTaxesTitle', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}</h2>
      {questions.map(question => {
        // @ts-expect-error TODO: This is an issue with the schema, the isQuestionForAdminOnly field is not defined
        if (question.isQuestionForAdminOnly && !isAdmin) return null
        return (
          <QuestionInput
            question={{
              ...question,
              key: `states.${state}.${snakeCaseToCamelCase(question.key)}`, // Its important not to convert state as it must maintain two capital letters
            }}
            questionType={
              question.key === 'fileNewHireReport' ? 'Radio' : question.inputQuestionFormat.type
            }
            key={question.key}
            control={control}
          />
        )
      })}
    </Fragment>
  ))
}
