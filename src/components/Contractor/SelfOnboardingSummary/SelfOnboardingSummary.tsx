import { useTranslation } from 'react-i18next'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'

interface SelfOnboardingSummaryProps extends CommonComponentInterface<'Contractor.SelfOnboardingSummary'> {
  contractorId: string
}

export function SelfOnboardingSummary(props: SelfOnboardingSummaryProps & BaseComponentInterface) {
  useI18n('Contractor.SelfOnboardingSummary')
  useComponentDictionary('Contractor.SelfOnboardingSummary', props.dictionary)

  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ className }: SelfOnboardingSummaryProps) => {
  const { onEvent } = useBase()
  const { t } = useTranslation('Contractor.SelfOnboardingSummary')
  const Components = useComponentContext()

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          <Components.Heading as="h2" textAlign="center">
            {t('title')}
          </Components.Heading>
          <Components.Text>{t('description')}</Components.Text>
          <ActionsLayout justifyContent="center">
            <Components.Button
              variant="secondary"
              onClick={() => {
                onEvent(componentEvents.CONTRACTOR_SUBMIT_DONE)
              }}
            >
              {t('doneCta')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Flex>
    </section>
  )
}
