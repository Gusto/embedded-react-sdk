import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useTaxes } from './useTaxes'
import type { STATES_ABBR } from '@/shared/constants'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const StateFormSchema = z.object({
  states: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
})

export type StateFormPayload = z.output<typeof StateFormSchema>

export const StateForm = () => {
  const Components = useComponentContext()
  const { employeeStateTaxes, isAdmin } = useTaxes()
  const { t } = useTranslation('Employee.Taxes')
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  return employeeStateTaxes.map(({ state, questions }) => (
    <Fragment key={state}>
      <Components.Heading as="h2">
        {t('stateTaxesTitle', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}
      </Components.Heading>
      {questions?.map(question => {
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
          />
        )
      })}
    </Fragment>
  ))
}
