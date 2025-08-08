import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import { useStateTaxes } from './useStateTaxes'
import type { STATES_ABBR } from '@/shared/constants'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Form() {
  const Components = useComponentContext()
  const { employeeStateTaxes, isAdmin } = useStateTaxes()
  const { t } = useTranslation('Employee.Taxes')
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  return (
    <>
      {employeeStateTaxes.map(({ state, questions }) =>
        Array.isArray(questions) && (isAdmin || questions.find(q => !q.isQuestionForAdminOnly)) ? (
          <Fragment key={state}>
            <Components.Heading as="h2">
              {t('stateTaxesTitle', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}
            </Components.Heading>
            {questions.map(question => {
              if (question.isQuestionForAdminOnly && !isAdmin) return null
              return (
                <QuestionInput
                  question={{
                    ...question,
                    key: `states.${state}.${snakeCaseToCamelCase(question.key)}`,
                  }}
                  questionType={
                    question.key === 'fileNewHireReport' ? 'Radio' : question.inputQuestionFormat.type
                  }
                  key={question.key}
                />
              )
            })}
          </Fragment>
        ) : null,
      )}
    </>
  )
}
