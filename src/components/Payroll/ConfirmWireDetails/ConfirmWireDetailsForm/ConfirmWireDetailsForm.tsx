import { Trans, useTranslation } from 'react-i18next'
import z from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useIsMutating } from '@tanstack/react-query'
import {
  useWireInRequestsSubmitMutation,
  mutationKeyWireInRequestsSubmit,
} from '@gusto/embedded-api/react-query/wireInRequestsSubmit'
import { useWireInRequestsGetSuspense } from '@gusto/embedded-api/react-query/wireInRequestsGet'
import type { PutWireInRequestsWireInRequestUuidRequest } from '@gusto/embedded-api/models/operations/putwireinrequestswireinrequestuuid'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import styles from './ConfirmWireDetailsForm.module.scss'
import { Form as HtmlForm } from '@/components/Common/Form'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import { payrollWireEvents, type EventType } from '@/shared/constants'
import { DatePickerField, NumberInputField, TextInputField } from '@/components/Common'
import { TextAreaField } from '@/components/Common/Fields/TextAreaField'
import type { OnEventType } from '@/components/Base/useBase'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface ConfirmWireDetailsFormProps extends BaseComponentInterface<'Payroll.ConfirmWireDetailsForm'> {
  wireInId: string
  companyId: string
  modalContainerRef?: React.RefObject<HTMLDivElement | null>
}

export const ConfirmWireDetailsFormSchema = z.object({
  amountSent: z.number().positive(),
  dateSent: z.date(),
  bankName: z.string().nonempty(),
  additionalNotes: z.string().optional(),
})

export type ConfirmWireDetailsFormValues = z.infer<typeof ConfirmWireDetailsFormSchema>

const CONFIRM_WIRE_FORM_ID = 'confirm-wire-details-form'

const transformFormDataToPayload = (
  data: ConfirmWireDetailsFormValues,
): PutWireInRequestsWireInRequestUuidRequest['requestBody'] => {
  return {
    amountSent: String(data.amountSent),
    dateSent: data.dateSent.toISOString().split('T')[0] || '',
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

const Root = ({
  wireInId,
  companyId,
  dictionary,
  modalContainerRef,
}: ConfirmWireDetailsFormProps) => {
  useComponentDictionary('Payroll.ConfirmWireDetailsForm', dictionary)
  useI18n('Payroll.ConfirmWireDetailsForm')
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Payroll.ConfirmWireDetailsForm')
  const { Heading, Text } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const { data } = useWireInRequestsGetSuspense({
    wireInRequestUuid: wireInId,
  })
  const wireInRequest = data.wireInRequest!
  const { data: payroll } = usePayrollsGetSuspense({
    companyId: companyId,
    payrollId: wireInRequest.paymentUuid!,
  })
  const payrollData = payroll.payrollShow!
  const payPeriod = payrollData.payPeriod
  const payPeriodRange = dateFormatter.formatPayPeriodRange(
    payPeriod?.startDate,
    payPeriod?.endDate,
  )
  const checkDate = dateFormatter.formatShortWithYear(payrollData.checkDate)
  const formHandlers = useForm<ConfirmWireDetailsFormValues>({
    resolver: zodResolver(ConfirmWireDetailsFormSchema),
    defaultValues: {
      bankName: '',
    },
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
      onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_DONE, {
        wireInRequest: response.wireInRequest,
        confirmationAlert: {
          title: t('confirmationAlert.title', { payrollRange: payPeriodRange }),
          content: <Text>{t('confirmationAlert.content', { checkDate })}</Text>,
        },
      })
    })
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <FlexItem>
        <Heading as="h2">
          <Trans i18nKey="title" t={t} values={{ payrollRange: payPeriodRange }} />
        </Heading>
        <Text>{t('description')}</Text>
      </FlexItem>

      <FormProvider {...formHandlers}>
        <HtmlForm
          id={CONFIRM_WIRE_FORM_ID}
          onSubmit={formHandlers.handleSubmit(onSubmit)}
          className={styles.form}
        >
          <Flex flexDirection="column" gap={20}>
            <NumberInputField
              name="amountSent"
              label={t('amountLabel')}
              isRequired
              format="currency"
              errorMessage={t('validations.amount')}
            />
            <DatePickerField
              name="dateSent"
              label={t('dateLabel')}
              isRequired
              errorMessage={t('validations.date')}
              portalContainer={modalContainerRef?.current || undefined}
            />
            <TextInputField
              name="bankName"
              label={t('bankNameLabel')}
              isRequired
              description={t('bankNameDescription')}
              placeholder={t('bankNamePlaceholder')}
              errorMessage={t('validations.bankName')}
            />
            <TextAreaField name="additionalNotes" label={t('notesLabel')} rows={3} />
          </Flex>
        </HtmlForm>
      </FormProvider>
    </Flex>
  )
}

const Footer = ({ onEvent }: { onEvent: OnEventType<EventType, unknown> }) => {
  useI18n('Payroll.ConfirmWireDetailsForm')
  const { t } = useTranslation('Payroll.ConfirmWireDetailsForm')
  const { Button } = useComponentContext()
  const isMutating = useIsMutating({
    mutationKey: mutationKeyWireInRequestsSubmit(),
  })
  const isPending = isMutating > 0

  return (
    <Flex gap={12} justifyContent="space-evenly">
      <FlexItem flexGrow={1}>
        <Button
          variant="secondary"
          onClick={() => {
            onEvent(payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)
          }}
          isDisabled={isPending}
          className={styles.button}
        >
          {t('cancelCta')}
        </Button>
      </FlexItem>
      <FlexItem flexGrow={1}>
        <Button
          variant="primary"
          type="submit"
          form={CONFIRM_WIRE_FORM_ID}
          isLoading={isPending}
          className={styles.button}
        >
          {t('submitCta')}
        </Button>
      </FlexItem>
    </Flex>
  )
}
ConfirmWireDetailsForm.Footer = Footer
