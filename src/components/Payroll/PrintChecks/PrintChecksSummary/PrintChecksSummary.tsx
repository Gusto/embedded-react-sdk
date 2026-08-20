import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { ActionsLayout, Flex } from '@/components/Common'
import { printChecksEvents, type EventType } from '@/shared/constants'

interface PrintChecksSummaryProps extends BaseComponentInterface<'Payroll.PrintChecksSummary'> {
  documentUrl?: string
}

/** @internal */
export function PrintChecksSummary(props: PrintChecksSummaryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ dictionary, documentUrl }: PrintChecksSummaryProps) => {
  useComponentDictionary('Payroll.PrintChecksSummary', dictionary)
  useI18n('Payroll.PrintChecksSummary')
  const { t } = useTranslation('Payroll.PrintChecksSummary')
  const { Heading, Text, Link } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      <Heading as="h2">{t('succeededTitle')}</Heading>
      <Text variant="supporting">{t('succeededDescription')}</Text>
      {documentUrl && (
        <Link href={documentUrl} target="_blank" rel="noreferrer">
          {t('viewChecksCta')}
        </Link>
      )}
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.PrintChecksSummary')
  const { t } = useTranslation('Payroll.PrintChecksSummary')
  const { Button } = useComponentContext()

  return (
    <ActionsLayout>
      <Button
        variant="secondary"
        onClick={() => {
          onEvent(printChecksEvents.PRINT_CHECKS_CLOSE)
        }}
      >
        {t('closeCta')}
      </Button>
    </ActionsLayout>
  )
}
PrintChecksSummary.Footer = Footer
