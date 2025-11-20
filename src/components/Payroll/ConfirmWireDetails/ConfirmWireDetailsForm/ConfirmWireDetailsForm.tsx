import { useTranslation } from 'react-i18next'
import z from 'zod'
import { Form, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWireInRequestsSubmitMutation } from '@gusto/embedded-api/react-query/wireInRequestsSubmit'
import type { PutWireInRequestsWireInRequestUuidRequest } from '@gusto/embedded-api/models/operations/putwireinrequestswireinrequestuuid'
import styles from './ConfirmWireDetailsForm.module.scss'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import { DatePickerField, NumberInputField, TextInputField } from '@/components/Common'
import { TextAreaField } from '@/components/Common/Fields/TextAreaField'
import type { OnEventType } from '@/components/Base/useBase'

interface ConfirmWireDetailsFormProps
  extends BaseComponentInterface<'Payroll.ConfirmWireDetailsForm'> {
  wireInId: string
}

export const ConfirmWireDetailsFormSchema = z.object({
  amountSent: z.number().positive(),
  dateSent: z.date(),
  bankName: z.string(),
  additionalNotes: z.string().optional(),
})

export type ConfirmWireDetailsFormValues = z.infer<typeof ConfirmWireDetailsFormSchema>

const CONFIRM_WIRE_FORM_ID = 'confirm-wire-details-form'

const transformFormDataToPayload = (
  data: ConfirmWireDetailsFormValues,
): PutWireInRequestsWireInRequestUuidRequest['requestBody'] => {
  return {
    amountSent: String(data.amountSent),
    dateSent: data.dateSent.toISOString(),
    bankName: data.bankName,
    additionalNotes: data.additionalNotes || undefined,
  }
}

export function ConfirmWireDetailsForm(props: ConfirmWireDetailsFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ wireInId, dictionary }: ConfirmWireDetailsFormProps) => {
  useComponentDictionary('Payroll.ConfirmWireDetailsForm', dictionary)
  useI18n('Payroll.ConfirmWireDetailsForm')
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.ConfirmWireDetailsForm')
  const { Heading, Text } = useComponentContext()

  const formHandlers = useForm<ConfirmWireDetailsFormValues>({
    resolver: zodResolver(ConfirmWireDetailsFormSchema),
  })

  const { mutateAsync: submitWireInRequest } = useWireInRequestsSubmitMutation()

  const onSubmit = async (data: ConfirmWireDetailsFormValues) => {
    await baseSubmitHandler(data, async innerData => {
      const payload = transformFormDataToPayload(innerData)
      const response = await submitWireInRequest({
        request: {
          wireInRequestUuid: wireInId,
          requestBody: payload,
        },
      })
      onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_DONE, response)
    })
  }

  return (
    <div className={styles.container}>
      <Flex flexDirection="column" gap={24}>
        <FlexItem>
          <Heading as="h2">{t('title')}</Heading>
          <Text>{t('description')}</Text>
        </FlexItem>

        <FormProvider {...formHandlers}>
          <Form
            id={CONFIRM_WIRE_FORM_ID}
            onSubmit={({ data }) => onSubmit(data as ConfirmWireDetailsFormValues)}
            className={styles.form}
          >
            <Flex flexDirection="column" gap={20}>
              <NumberInputField
                name="amountSent"
                label={t('amountLabel')}
                isRequired
                format="currency"
              />
              <DatePickerField name="dateSent" label={t('dateLabel')} isRequired />
              <TextInputField
                name="bankName"
                label={t('bankNameLabel')}
                isRequired
                description={t('bankNameDescription')}
                placeholder={t('bankNamePlaceholder')}
              />
              <TextAreaField name="additionalNotes" label={t('notesLabel')} rows={3} />
            </Flex>
          </Form>
        </FormProvider>
      </Flex>
    </div>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.ConfirmWireDetailsForm')
  const { t } = useTranslation('Payroll.ConfirmWireDetailsForm')
  const { Button } = useComponentContext()
  const { isPending: isPendingSubmit } = useWireInRequestsSubmitMutation()
  return (
    <Flex gap={12} justifyContent="space-evenly">
      <Button
        variant="secondary"
        onClick={() => {
          onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)
        }}
      >
        {t('cancelCta')}
      </Button>
      <Button
        variant="primary"
        type="submit"
        form={CONFIRM_WIRE_FORM_ID}
        isLoading={isPendingSubmit}
      >
        {t('submitCta')}
      </Button>
    </Flex>
  )
}
ConfirmWireDetailsForm.Footer = Footer
