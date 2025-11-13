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
  const { Button, Select } = useComponentContext()

  const handleConfirm = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE)
  }

  const handleClose = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_CANCEL)
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <h2>{t('title')}</h2>

      {/* TODO: Wire instructions content will be implemented in subsequent ticket */}
      {/*/  if (wireInId) { show for single and default  selected */}
      {/* if no wire ID then hit api and show new requests 
     if more than one - show dropdown else show one */}

      {/*  inputs have select dropdown - use the one from component context (select) 
     when using the select, make sure to wire up the onChange*/}

      <Flex gap={12} justifyContent="flex-end">
        <Select
          label="Select a wire instruction"
          options={[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ]}
          onChange={(selectedId: string) => {
            onEvent(payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT, {
              selectedId,
            })
          }}
        />
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
