import { useTranslation } from 'react-i18next'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { useContractorPaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import type { PaymentMethodSelectionProps } from './types'
import { PaymentTypeForm } from './PaymentTypeForm'
import { useI18n } from '@/i18n'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { PAYMENT_METHODS } from '@/shared/constants'
import { ActionsLayout } from '@/components/Common/ActionsLayout'

export function PaymentMethodSelection(props: PaymentMethodSelectionProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const PaymentMethodSchema = z.union([
  z.object({
    type: z.literal('Direct Deposit'),
    // splitBy: z.enum([SPLIT_BY.amount, SPLIT_BY.percentage]),
    // splits: z0
    //   .array(z.object({ uuid: z.string(), splitAmount: z.number().min(0).nullable() }))
    //   .optional(),
  }),
  z.object({ type: z.literal('Check') }),
])

export type PaymentMethodSchemaInputs = z.input<typeof PaymentMethodSchema>
export type PaymentMethodSchemaOutputs = z.output<typeof PaymentMethodSchema>

function Root({ contractorId, className, dictionary }: PaymentMethodSelectionProps) {
  useComponentDictionary('Contractor.PaymentMethod', dictionary)
  useI18n('Contractor.PaymentMethod')
  const { t } = useTranslation('Contractor.PaymentMethod', { keyPrefix: 'paymentMethodSelection' })
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()

  const {
    data: { contractorPaymentMethod },
  } = useContractorPaymentMethodGetSuspense({ contractorUuid: contractorId })
  const paymentMethod = contractorPaymentMethod!

  const {
    data: { contractorBankAccountList },
  } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractorId,
  })
  const bankAccounts = contractorBankAccountList || []

  const paymentMethodMutation = useContractorPaymentMethodUpdateMutation()

  const baseDefaultValues = useMemo(
    () => ({
      type: PAYMENT_METHODS.directDeposit,
      splitBy: null,
      splits: null,
    }),
    [],
  )
  const defaultValues = useMemo(
    () => ({ ...baseDefaultValues, type: paymentMethod.type }),
    [baseDefaultValues, paymentMethod],
  )

  const formMethods = useForm({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: defaultValues,
  })

  const onSubmit: SubmitHandler<PaymentMethodSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const paymentMethodResponse = await paymentMethodMutation.mutateAsync({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            type: payload.type,
            version: paymentMethod.version as string,
          },
        },
      })
    })
  }

  //TODO:  instead of type, check value of current radio
  const showBankAccountList =
    paymentMethod.type === PAYMENT_METHODS.directDeposit && bankAccounts.length > 0

  const showBankAccountForm =
    paymentMethod.type === PAYMENT_METHODS.directDeposit && bankAccounts.length === 0

  return (
    <section className={className}>
      <Components.Heading as="h2">{t('title')}</Components.Heading>
      {contractorId}
      {JSON.stringify(bankAccounts)}
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <PaymentTypeForm />
          {showBankAccountList && <p>list</p>}
          {showBankAccountForm && <p>form</p>}
          <ActionsLayout>
            <Components.Button type="submit" variant="primary">
              {t('continueCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </FormProvider>
    </section>
  )
}
