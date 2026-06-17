import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { useStateTaxesForm } from './context'
import { toRhfKey } from './rhfKey'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { useLocaleDateFormatter } from '@/contexts/LocaleProvider/useLocale'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export function Form() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const dateFormatter = useLocaleDateFormatter()
  const { stateTaxRequirements } = useStateTaxesForm()
  const Components = useComponentContext()

  return stateTaxRequirements.requirementSets?.map(
    ({ requirements, label, effectiveFrom, key }) => (
      <Fragment key={key}>
        <div>
          <Components.Heading as="h3">{label}</Components.Heading>
          {effectiveFrom && (
            <Components.Text size="sm">
              {t('effectiveFromLabel', { date: dateFormatter.format(new Date(effectiveFrom)) })}
            </Components.Text>
          )}
        </div>
        {requirements?.map(requirement => {
          return (
            <QuestionInput
              requirement={{
                ...requirement,
                key: `${key}.${toRhfKey(requirement.key as string)}`,
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
