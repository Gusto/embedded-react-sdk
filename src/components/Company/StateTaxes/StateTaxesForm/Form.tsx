import * as v from 'valibot'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { useStateTaxesForm } from './context'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { useLocaleDateFormatter } from '@/contexts/LocaleProvider/useLocale'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const StateFormSchema = v.record(v.string(), v.record(v.string(), v.unknown()))

export type StateFormInputs = v.InferInput<typeof StateFormSchema>

export function Form() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const dateFormatter = useLocaleDateFormatter()
  const { stateTaxRequirements } = useStateTaxesForm()
  const Components = useComponentContext()

  return stateTaxRequirements.requirementSets?.map(
    ({ requirements, label, effectiveFrom, key }) => (
      <Fragment key={key}>
        <div>
          <Components.Heading as="h4">{label}</Components.Heading>
          {effectiveFrom && (
            <p className="lightText">
              {t('effectiveFromLabel', { date: dateFormatter.format(new Date(effectiveFrom)) })}
            </p>
          )}
        </div>
        {requirements?.map(requirement => {
          return (
            <QuestionInput
              requirement={{
                ...requirement,
                key: `${key}.${requirement.key as string}`,
              }}
              questionType={requirement.metadata?.type ?? 'Text'}
              key={requirement.key}
            />
          )
        })}
      </Fragment>
    ),
  )
}
