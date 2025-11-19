import { useTranslation } from 'react-i18next'
import z from 'zod'
import { Form, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import { payrollWireEvents } from '@/shared/constants'

interface ConfirmWireDetailsFormProps
  extends BaseComponentInterface<'Payroll.ConfirmWireDetailsForm'> {
  companyId: string
  wireInId?: string
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

const Root = ({ companyId, wireInId, dictionary }: ConfirmWireDetailsFormProps) => {
  useComponentDictionary('Payroll.ConfirmWireDetailsForm', dictionary)
  useI18n('Payroll.ConfirmWireDetailsForm')
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.ConfirmWireDetailsForm')
  const { Button, Heading, Text, F } = useComponentContext()

  const formHandlers = useForm<ConfirmWireDetailsFormValues>({
    resolver: zodResolver(ConfirmWireDetailsFormSchema),
  })

  const onSubmit = async (data: ConfirmWireDetailsFormValues) => {
    await baseSubmitHandler(data, async innerData => {
      onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_DONE, innerData)
    })
  }

  // const handleSubmit = () => {
  //   onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_DONE)
  // }

  const handleCancel = () => {
    onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <FlexItem>
        <Heading as="h2">{t('title')}</Heading>
        <Text>{t('description')}</Text>
      </FlexItem>

      {/* TODO: Form fields will be implemented in subsequent ticket */}
      <FormProvider {...formHandlers}>
        <Form>
          <Flex flexDirection="column" gap={20}>
            <TextInputField name="amountSent" label={t('amountLabel')} />
            <TextInputField name="dateSent" label={t('dateLabel')} />
            <TextInputField name="bankName" label={t('bankNameLabel')} />
            <TextAreaField name="additionalNotes" label={t('notesLabel')} />
          </Flex>
        </Form>
      </FormProvider>
      <Flex gap={12} justifyContent="flex-end">
        <Button variant="secondary" onClick={handleCancel}>
          {t('cancelCta')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('submitCta')}
        </Button>
      </Flex>
    </Flex>
  )
}
