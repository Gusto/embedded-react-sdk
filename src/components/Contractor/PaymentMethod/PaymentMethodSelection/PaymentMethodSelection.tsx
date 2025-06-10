import { useTranslation } from 'react-i18next'
import { FormProvider, useForm } from 'react-hook-form'
import { useContractorPaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PaymentMethodSelectionProps } from './types'
import { PaymentTypeForm } from './PaymentTypeForm'
import { useI18n } from '@/i18n'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { PAYMENT_METHODS } from '@/shared/constants'

export function PaymentMethodSelection(props: PaymentMethodSelectionProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const PaymentMethodSchema = z.union([
  z.object({ type: z.literal('Direct Deposit'), isSplit: z.literal(false) }),
  z.object({ type: z.literal('Check') }),
])

export type PaymentMEthodSchemaInputs = z.input<typeof PaymentMethodSchema>
export type PaymentMethodSchemaOutputs = z.output<typeof PaymentMethodSchema>

function Root({ contractorId, className, dictionary }: PaymentMethodSelectionProps) {
  useComponentDictionary('Contractor.PaymentMethod', dictionary)
  useI18n('Contractor.PaymentMethod')
  const { onEvent } = useBase()
  const { t } = useTranslation('Contractor.PaymentMethod')
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

  const onSubmit = (data: any) => {}

  //TODO:  instead of type, check value of current radio
  const showBankAccountList =
    paymentMethod.type === PAYMENT_METHODS.directDeposit && bankAccounts.length > 0

  const showBankAccountForm =
    paymentMethod.type === PAYMENT_METHODS.directDeposit && bankAccounts.length === 0

  return (
    <section className={className}>
      <Components.Heading as="h2">{t('paymentMethodSelection.title')}</Components.Heading>
      {contractorId}
      {JSON.stringify(bankAccounts)}
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <PaymentTypeForm />
          {showBankAccountList && <p>list</p>}
          {showBankAccountForm && <p>form</p>}
        </Form>
      </FormProvider>
    </section>
  )
}
