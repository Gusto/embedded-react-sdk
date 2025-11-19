import { useTranslation } from 'react-i18next'
import z from 'zod'
import { Form, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWireInRequestsSubmitMutation } from '@gusto/embedded-api/react-query/wireInRequestsSubmit'
import styles from './ConfirmWireDetailsForm.module.scss'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import { payrollWireEvents } from '@/shared/constants'
import { TextInputField } from '@/components/Common'
import { TextAreaField } from '@/components/Common/Fields/TextAreaField'

interface ConfirmWireDetailsFormProps
  extends BaseComponentInterface<'Payroll.ConfirmWireDetailsForm'> {
  wireInId: string
}

export const ConfirmWireDetailsFormSchema = z.object({
  amountSent: z.string().nonempty(),
  dateSent: z.string(),
  bankName: z.string(),
  additionalNotes: z.string().optional(),
})

export type ConfirmWireDetailsFormValues = z.infer<typeof ConfirmWireDetailsFormSchema>

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
  const { Button, Heading, Text } = useComponentContext()

  const formHandlers = useForm<ConfirmWireDetailsFormValues>({
    resolver: zodResolver(ConfirmWireDetailsFormSchema),
  })

  const { mutateAsync: submitWireInRequest, isPending: isPendingSubmit } =
    useWireInRequestsSubmitMutation()

  const onSubmit = async (data: ConfirmWireDetailsFormValues) => {
    await baseSubmitHandler(data, async innerData => {
      await submitWireInRequest({
        request: {
          wireInRequestUuid: wireInId,
          requestBody: innerData,
        },
      })
      onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_DONE, innerData)
    })
  }

  const handleCancel = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)
  }

  return (
    <div className={styles.container}>
      <Flex flexDirection="column" gap={24}>
        <FlexItem>
          <Heading as="h2">{t('title')}</Heading>
          <Text>{t('description')}</Text>
        </FlexItem>

        <FormProvider {...formHandlers}>
          <Form className={styles.form}>
            <Flex flexDirection="column" gap={20}>
              <TextInputField name="amountSent" label={t('amountLabel')} isRequired />
              <TextInputField name="dateSent" label={t('dateLabel')} isRequired />
              <TextInputField
                name="bankName"
                label={t('bankNameLabel')}
                isRequired
                description={t('bankNameDescription')}
                placeholder={t('bankNamePlaceholder')}
              />
              <TextAreaField name="additionalNotes" label={t('notesLabel')} />
            </Flex>
          </Form>
        </FormProvider>
        <Flex gap={12} justifyContent="flex-end">
          <Button variant="secondary" onClick={handleCancel} isLoading={isPendingSubmit}>
            {t('cancelCta')}
          </Button>
          <Button
            variant="primary"
            onClick={formHandlers.handleSubmit(onSubmit)}
            isLoading={isPendingSubmit}
          >
            {t('submitCta')}
          </Button>
        </Flex>
      </Flex>
    </div>
  )
}
