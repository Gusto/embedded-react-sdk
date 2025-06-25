import { useTranslation } from 'react-i18next'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useContractorPaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import type { PaymentMethodProps } from './types'
import { BankAccountForm } from './BankAccountForm'
import { PaymentTypeForm } from './PaymentTypeForm'
import { useI18n } from '@/i18n'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex } from '@/components/Common'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

const PaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Direct Deposit'),
    name: z.string().min(1),
    routingNumber: routingNumberValidation,
    accountNumber: z.any(), //Explicitely setting account number as most permissive
    accountType: z.enum(['Checking', 'Savings']),
  }),
  z.object({
    type: z.literal('Check'),
  }),
])

export type PaymentMethodSchemaInputs = z.input<typeof PaymentMethodSchema>
export type PaymentMethodSchemaOutputs = z.output<typeof PaymentMethodSchema>

export function PaymentMethod(props: PaymentMethodProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ contractorId, className, dictionary }: PaymentMethodProps) {
  useComponentDictionary('Contractor.PaymentMethod', dictionary)
  useI18n('Contractor.PaymentMethod')
  const { t } = useTranslation('Contractor.PaymentMethod')
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
  const bankAccount = contractorBankAccountList?.[0] || undefined

  const { mutateAsync: updatePaymentMethod, isPending: paymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: bankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  const defaultValues = useMemo(
    () => ({
      type: paymentMethod.type || PAYMENT_METHODS.check,
      name: bankAccount?.name || '',
      routingNumber: bankAccount?.routingNumber || '',
      accountNumber: bankAccount?.hiddenAccountNumber || '',
      accountType: bankAccount?.accountType || 'Checking',
    }),
    [paymentMethod, bankAccount],
  )

  const formMethods = useForm({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: defaultValues,
  })

  const watchedType = useWatch({ control: formMethods.control, name: 'type' })
  const onSubmit: SubmitHandler<PaymentMethodSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      let permitBankSubmission = true

      if (payload.type === PAYMENT_METHODS.directDeposit) {
        /** Custom validation logic for accountNumber - because masked account value is used as default value, it is only validated when any of the bank-related fields are modified*/
        const { name, accountNumber, routingNumber, accountType } = payload
        if (
          name !== bankAccount?.name ||
          routingNumber !== bankAccount.routingNumber ||
          accountType !== bankAccount.accountType ||
          accountNumber !== bankAccount.hiddenAccountNumber
        ) {
          const res = accountNumberValidation.safeParse(payload.accountNumber)
          if (!res.success) {
            formMethods.setError('accountNumber', { type: 'validate' })
            return
          }
        } else {
          //Edgecase: bank fields are untouched, but we don't want to resubmit with masked account number
          permitBankSubmission = false
        }
      }
      const paymentMethodResponse = await updatePaymentMethod({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            type: payload.type,

            version: paymentMethod.version as string,
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED, paymentMethodResponse)

      //This update has to follow payment method update because it changes version of paymentMethod
      if (payload.type === PAYMENT_METHODS.directDeposit && permitBankSubmission) {
        const bankAccountResponse = await createBankAccount({
          request: {
            contractorUuid: contractorId,
            requestBody: {
              name: payload.name,
              routingNumber: payload.routingNumber,
              accountNumber: payload.accountNumber,
              accountType: payload.accountType,
            },
          },
        })
        onEvent(componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED, bankAccountResponse)
      }
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    })
  }

  const showBankAccountForm = watchedType === PAYMENT_METHODS.directDeposit

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex gap={32} flexDirection={'column'}>
            <Components.Heading as="h2">{t('title')}</Components.Heading>
            <PaymentTypeForm />
            <hr />
            {showBankAccountForm && <BankAccountForm bankAccount={bankAccount} />}
            <ActionsLayout>
              <Components.Button
                type="submit"
                variant="primary"
                isDisabled={paymentMethodPending || bankAccountPending}
              >
                {t('continueCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
