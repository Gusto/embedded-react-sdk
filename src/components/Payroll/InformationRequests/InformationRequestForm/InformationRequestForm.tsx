import { useTranslation } from 'react-i18next'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { informationRequestEvents, type EventType } from '@/shared/constants'

const INFORMATION_REQUEST_FORM_ID = 'gusto-sdk-information-request-form'

interface InformationRequestFormProps extends BaseComponentInterface<'Payroll.InformationRequestForm'> {
  requestId: string
  onEvent: OnEventType<EventType, unknown>
}

export function InformationRequestForm(props: InformationRequestFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ dictionary }: InformationRequestFormProps) {
  useComponentDictionary('Payroll.InformationRequestForm', dictionary)
  useI18n('Payroll.InformationRequestForm')
  const { t } = useTranslation('Payroll.InformationRequestForm')
  const { Heading, Text } = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()

  // TODO: Wire up form submission with API call using the custom RFI submission endpoint created in SC-56
  const onSubmit = async () => {
    // TODO: remove this lint ignore once we wire this up and await the api call
    // eslint-disable-next-line @typescript-eslint/require-await
    await baseSubmitHandler({}, async () => {
      // TODO: Call API submission endpoint here
      onEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_DONE)
    })
  }

  return (
    <Flex flexDirection="column" gap={16}>
      <Heading as="h2">{t('title')}</Heading>
      <Text>Placeholder: Form content will be rendered here</Text>
      <Form id={INFORMATION_REQUEST_FORM_ID} onSubmit={onSubmit}>
        {/* TODO: Add form fields here */}
      </Form>
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.InformationRequestForm')
  const { t } = useTranslation('Payroll.InformationRequestForm')
  const { Button } = useComponentContext()

  const handleCancel = () => {
    onEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)
  }

  return (
    <ActionsLayout>
      <Button variant="secondary" onClick={handleCancel}>
        {t('cta.cancel')}
      </Button>
      <Button variant="primary" type="submit" form={INFORMATION_REQUEST_FORM_ID}>
        {t('cta.submit')}
      </Button>
    </ActionsLayout>
  )
}

InformationRequestForm.Footer = Footer
