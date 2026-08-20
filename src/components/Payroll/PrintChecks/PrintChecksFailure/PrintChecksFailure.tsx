import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { ActionsLayout, Flex } from '@/components/Common'
import { printChecksEvents, type EventType } from '@/shared/constants'

interface PrintChecksFailureProps extends BaseComponentInterface<'Payroll.PrintChecksFailure'> {
  errorMessage?: string
}

/** @internal */
export function PrintChecksFailure(props: PrintChecksFailureProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ dictionary, errorMessage, onEvent }: PrintChecksFailureProps) => {
  useComponentDictionary('Payroll.PrintChecksFailure', dictionary)
  useI18n('Payroll.PrintChecksFailure')
  const { t } = useTranslation('Payroll.PrintChecksFailure')
  const { Alert, Button } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      <Alert status="error" disableScrollIntoView label={t('failedTitle')}>
        {errorMessage}
      </Alert>
      <Button
        variant="secondary"
        onClick={() => {
          onEvent(printChecksEvents.PRINT_CHECKS_RETRY)
        }}
      >
        {t('retryCta')}
      </Button>
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.PrintChecksFailure')
  const { t } = useTranslation('Payroll.PrintChecksFailure')
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
PrintChecksFailure.Footer = Footer
