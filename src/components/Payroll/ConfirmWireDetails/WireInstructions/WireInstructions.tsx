import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

interface WireInstructionsProps extends BaseComponentInterface<'Payroll.WireInstructions'> {
  companyId: string
  wireInId?: string
  onEvent: OnEventType<EventType, unknown>
}

export function WireInstructions(props: WireInstructionsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, wireInId, dictionary, onEvent }: WireInstructionsProps) => {
  useComponentDictionary('Payroll.WireInstructions', dictionary)
  useI18n('Payroll.WireInstructions')
  const { t } = useTranslation('Payroll.WireInstructions')
  const { Button } = useComponentContext()

  const handleConfirm = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE)
  }

  const handleClose = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <h2>{t('title')}</h2>

      {/* TODO: Wire instructions content will be implemented in subsequent ticket */}

      <Flex gap={12} justifyContent="flex-end">
        <Button variant="secondary" onClick={handleClose}>
          {t('cta.close')}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {t('cta.confirm')}
        </Button>
      </Flex>
    </Flex>
  )
}
