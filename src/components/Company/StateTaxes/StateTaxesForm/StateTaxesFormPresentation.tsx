import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import type { TaxRequirementsState } from '@gusto/embedded-api/models/components/taxrequirementsstate'
import { QuestionInput } from '@/components/Common/TaxInputs/TaxInputs'
import { useLocaleDateFormatter } from '@/contexts/LocaleProvider/useLocale'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import type { STATES_ABBR } from '@/shared/constants'
import { useI18n } from '@/i18n/I18n'

interface StateTaxesFormPresentationProps {
  stateTaxRequirements: TaxRequirementsState
  isPending: boolean
  state: string
  handleCancel: () => void
}

export const StateTaxesFormPresentation = ({
  stateTaxRequirements,
  isPending,
  state,
  handleCancel,
}: StateTaxesFormPresentationProps) => {
  useI18n('Company.StateTaxes')
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })
  const dateFormatter = useLocaleDateFormatter()
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      <header>
        <Components.Heading as="h2">
          {t('title', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}
        </Components.Heading>
      </header>

      {stateTaxRequirements.requirementSets?.map(({ requirements, label, effectiveFrom, key }) => (
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
                  key: `${key}.${requirement.key as string}`,
                }}
                questionType={requirement.metadata?.type ?? 'Text'}
                key={requirement.key}
              />
            )
          })}
        </Fragment>
      ))}

      <ActionsLayout>
        <Components.Button variant="secondary" onClick={handleCancel}>
          {t('cancelCta')}
        </Components.Button>
        <Components.Button variant="primary" type="submit" isDisabled={isPending}>
          {t('saveCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
