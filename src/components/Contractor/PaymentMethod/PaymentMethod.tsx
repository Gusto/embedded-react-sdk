import { useTranslation } from 'react-i18next'
import type { PaymentMethodProps } from './types'
import {
  useContractorPaymentMethodForm,
  type ContractorPaymentMethodFormType,
} from './shared/useContractorPaymentMethodForm'
import { useI18n } from '@/i18n'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex } from '@/components/Common'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

/**
 * Manages a contractor's payment method, capturing a bank account for direct deposit or recording check as the payment method.
 *
 * Displays the current payment type, lets the user switch between direct deposit and check, and
 * collects bank account details (account holder name, routing number, account number, and account
 * type) when direct deposit is selected. Submitting creates the bank account if needed and then
 * updates the contractor's payment method.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/bankAccount/created` | Fired after a bank account is created for the contractor | The API response object; access the created bank account at `.contractorBankAccount` |
 * | `contractor/paymentMethod/updated` | Fired after the payment method is updated | The API response object; access the updated payment method at `.contractorPaymentMethod` |
 * | `contractor/paymentMethod/done` | Fired when the payment method step completes | — |
 *
 * @param props - Component configuration; see {@link PaymentMethodProps}.
 * @returns The rendered payment method form.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function PaymentMethodStep() {
 *   return (
 *     <ContractorOnboarding.PaymentMethod
 *       contractorId="contractor-uuid"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function PaymentMethod({ dictionary, ...props }: PaymentMethodProps) {
  useComponentDictionary('Contractor.PaymentMethod', dictionary)
  return (
    <BaseBoundaries componentName="Contractor.PaymentMethod">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ contractorId, className, onEvent }: Omit<PaymentMethodProps, 'dictionary'>) {
  useI18n('Contractor.PaymentMethod')
  const { t } = useTranslation('Contractor.PaymentMethod')
  const Components = useComponentContext()

  const paymentMethod = useContractorPaymentMethodForm({ contractorId })

  if (paymentMethod.isLoading) {
    return <BaseLayout isLoading error={paymentMethod.errorHandling.errors} />
  }

  const { Fields } = paymentMethod.form

  const handleSubmit = async () => {
    const result = await paymentMethod.actions.onSubmit({
      onBankAccountCreated: bankAccount => {
        onEvent(componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED, {
          contractorBankAccount: bankAccount,
        })
      },
    })
    if (result) {
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED, {
        contractorPaymentMethod: result.data,
      })
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    }
  }

  const TypeFieldComponent = (radioProps: RadioGroupProps) => (
    <Components.RadioGroup
      {...radioProps}
      shouldVisuallyHideLabel
      options={radioProps.options.map(option => ({
        ...option,
        description:
          option.value === PAYMENT_METHODS.directDeposit
            ? t('directDepositDescription')
            : t('checkDescription'),
      }))}
    />
  )

  return (
    <section className={className}>
      <BaseLayout error={paymentMethod.errorHandling.errors}>
        <SDKFormProvider formHookResult={paymentMethod}>
          <Form onSubmit={() => void handleSubmit()}>
            <Flex gap={32} flexDirection="column">
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Fields.Type
                label={t('paymentFieldsetLegend')}
                getOptionLabel={(value: ContractorPaymentMethodFormType) =>
                  value === PAYMENT_METHODS.directDeposit
                    ? t('directDepositLabel')
                    : t('checkLabel')
                }
                FieldComponent={TypeFieldComponent}
              />
              {Fields.Name && (
                <Fields.Name
                  label={t('bankAccountForm.nameLabel')}
                  validationMessages={{ REQUIRED: t('bankAccountForm.validations.accountName') }}
                />
              )}
              {Fields.RoutingNumber && (
                <Fields.RoutingNumber
                  label={t('bankAccountForm.routingNumberLabel')}
                  description={t('bankAccountForm.routingNumberDescription')}
                  validationMessages={{
                    REQUIRED: t('bankAccountForm.validations.routingNumber'),
                    INVALID_ROUTING_NUMBER: t('bankAccountForm.validations.routingNumber'),
                  }}
                />
              )}
              {Fields.AccountNumber && (
                <Fields.AccountNumber
                  label={t('bankAccountForm.accountNumberLabel')}
                  validationMessages={{
                    REQUIRED: t('bankAccountForm.validations.accountNumber'),
                    INVALID_ACCOUNT_NUMBER: t('bankAccountForm.validations.accountNumber'),
                  }}
                />
              )}
              {Fields.AccountType && (
                <Fields.AccountType
                  label={t('bankAccountForm.accountTypeLabel')}
                  getOptionLabel={(value: string) =>
                    value === 'Checking'
                      ? t('bankAccountForm.accountTypeChecking')
                      : t('bankAccountForm.accountTypeSavings')
                  }
                />
              )}
              <ActionsLayout>
                <Components.Button
                  type="submit"
                  variant="primary"
                  isDisabled={paymentMethod.status.isPending}
                >
                  {t('continueCta')}
                </Components.Button>
              </ActionsLayout>
            </Flex>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
