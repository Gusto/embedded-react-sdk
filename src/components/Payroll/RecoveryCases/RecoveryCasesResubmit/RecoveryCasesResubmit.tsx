import { useTranslation } from 'react-i18next'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { recoveryCasesEvents, type EventType } from '@/shared/constants'

const RECOVERY_CASES_RESUBMIT_FORM_ID = 'gusto-sdk-recovery-cases-resubmit-form'

interface RecoveryCasesResubmitProps extends BaseComponentInterface<'Payroll.RecoveryCasesResubmit'> {
  recoveryCaseId: string
  onEvent: OnEventType<EventType, unknown>
}

export function RecoveryCasesResubmit(props: RecoveryCasesResubmitProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ dictionary, recoveryCaseId }: RecoveryCasesResubmitProps) {
  useComponentDictionary('Payroll.RecoveryCasesResubmit', dictionary)
  useI18n('Payroll.RecoveryCasesResubmit')
  const { Heading, Text } = useComponentContext()
  const { onEvent, baseSubmitHandler } = useBase()

  // TODO: Wire up resubmit API call
  const onSubmit = async () => {
    // TODO: remove this lint ignore once we wire this up and await the api call
    // eslint-disable-next-line @typescript-eslint/require-await
    await baseSubmitHandler({}, async () => {
      // TODO: Call API resubmit payment endpoint here
      onEvent(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE)
    })
  }

  return (
    <Flex flexDirection="column" gap={16}>
      <Heading as="h2">[Placeholder title based on R code]</Heading>
      <Text>[Placeholder subtitle based on R code]</Text>
      <Text>[Placeholder body based on R code]</Text>
      <Text>[Placeholder instruction based on R code]</Text>
      {/*
        This empty form is used to connect the Footer's submit button to the submission logic
        via the form attribute. This is semantically incorrect and hidden from assistive tech.
      */}
      <Form id={RECOVERY_CASES_RESUBMIT_FORM_ID} onSubmit={onSubmit} aria-hidden="true">
        {/* Empty form - submission triggered by footer button via form attribute */}
      </Form>
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.RecoveryCasesResubmit')
  const { t } = useTranslation('Payroll.RecoveryCasesResubmit')
  const { Button } = useComponentContext()

  const handleCancel = () => {
    onEvent(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL)
  }

  return (
    <ActionsLayout>
      <Button variant="secondary" onClick={handleCancel}>
        {t('cta.cancel')}
      </Button>
      <Button variant="primary" type="submit" form={RECOVERY_CASES_RESUBMIT_FORM_ID}>
        {t('cta.resubmit')}
      </Button>
    </ActionsLayout>
  )
}

RecoveryCasesResubmit.Footer = Footer
