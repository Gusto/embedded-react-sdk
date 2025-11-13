import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex } from '@/components/Common/Flex/Flex'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

interface ConfirmWireDetailsFormProps
  extends BaseComponentInterface<'Payroll.ConfirmWireDetailsForm'> {
  companyId: string
  wireInId?: string
  onEvent: OnEventType<EventType, unknown>
}

export function ConfirmWireDetailsForm(props: ConfirmWireDetailsFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, wireInId, dictionary, onEvent }: ConfirmWireDetailsFormProps) => {
  useComponentDictionary('Payroll.ConfirmWireDetailsForm', dictionary)
  useI18n('Payroll.ConfirmWireDetailsForm')
  const { t } = useTranslation('Payroll.ConfirmWireDetailsForm')
  const { Button } = useComponentContext()

  const handleSubmit = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_DONE)
  }

  const handleCancel = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <h2>{t('title')}</h2>

      {/* TODO: Form fields will be implemented in subsequent ticket */}

      <Flex gap={12} justifyContent="flex-end">
        <Button variant="secondary" onClick={handleCancel}>
          {t('cta.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('cta.submit')}
        </Button>
      </Flex>
    </Flex>
  )
}
