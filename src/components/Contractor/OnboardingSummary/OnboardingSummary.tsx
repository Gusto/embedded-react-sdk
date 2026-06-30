import { useTranslation } from 'react-i18next'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for {@link OnboardingSummary}.
 *
 * @public
 */
export interface OnboardingSummaryProps extends BaseComponentInterface<'Contractor.OnboardingSummary'> {
  /** UUID of the contractor who completed self-onboarding. */
  contractorId: string
}

/**
 * Confirmation screen shown at the end of the contractor self-onboarding flow.
 * Lets the contractor know their information has been submitted and emits
 * `contractor/selfOnboarding/done` when they acknowledge it.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/selfOnboarding/done` | Fired when the contractor acknowledges completion and clicks the Done button | `{ contractorId: string }` |
 *
 * @public
 */
export function OnboardingSummary(props: OnboardingSummaryProps) {
  useI18n('Contractor.OnboardingSummary')
  useComponentDictionary('Contractor.OnboardingSummary', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ contractorId, className }: OnboardingSummaryProps) => {
  const { onEvent } = useBase()
  const { t } = useTranslation('Contractor.OnboardingSummary')
  const Components = useComponentContext()

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          <Components.Heading as="h2" textAlign="center">
            {t('subtitle')}
          </Components.Heading>
          <Components.Text textAlign="center">{t('description')}</Components.Text>
        </Flex>
        <ActionsLayout justifyContent="center">
          <Components.Button
            variant="secondary"
            onClick={() => {
              onEvent(componentEvents.CONTRACTOR_SELF_ONBOARDING_DONE, { contractorId })
            }}
          >
            {t('doneCta')}
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
