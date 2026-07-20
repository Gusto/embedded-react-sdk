import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import type { PaymentMethodProps } from './types'
import {
  useContractorPaymentMethodForm,
  type ContractorPaymentMethodFormType,
} from './shared/useContractorPaymentMethodForm'
import { useContractorBankAccountForm } from './shared/useContractorBankAccountForm'
import styles from './PaymentMethod.module.scss'
import { useI18n } from '@/i18n'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex } from '@/components/Common'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

/**
 * Manages a contractor's payment method, capturing a bank account for direct deposit or recording check as the payment method.
 *
 * Displays the current payment type, lets the user switch between direct deposit and check, and
 * collects bank account details (account holder name, routing number, account number, and account
 * type) when direct deposit is selected. Direct deposit creates the bank account (which updates the
 * payment method server-side); check updates the contractor's payment method type directly.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/bankAccount/created` | Fired on the direct deposit path after the bank account is created | The created bank account at `.contractorBankAccount` |
 * | `contractor/paymentMethod/updated` | Fired on the check path after the payment method type is updated | The updated payment method at `.contractorPaymentMethod` |
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

  const paymentMethodForm = useContractorPaymentMethodForm({
    contractorId,
    shouldFocusError: false,
  })
  const bankAccountForm = useContractorBankAccountForm({
    contractorId,
    shouldFocusError: false,
  })

  if (paymentMethodForm.isLoading || bankAccountForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([paymentMethodForm, bankAccountForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const isDirectDeposit = paymentMethodForm.status.isDirectDeposit
  const { Type } = paymentMethodForm.form.Fields
  const { Name, RoutingNumber, AccountNumber, AccountType } = bankAccountForm.form.Fields

  // Direct Deposit always submits the bank account (which sets the payment
  // method server-side); Check updates the payment method type directly. The
  // account number is pre-filled with the masked token, which the API treats as
  // "keep the existing account," so an unchanged submit preserves it while a
  // newly typed number replaces it.
  const submitDirectDeposit = async () => {
    const result = await bankAccountForm.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED, {
      contractorBankAccount: result.data,
    })
    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
  }

  const submitCheck = async () => {
    const result = await paymentMethodForm.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED, {
      contractorPaymentMethod: result.data,
    })
    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
  }

  const { handleSubmit, errorHandling } = isDirectDeposit
    ? composeSubmitHandler([paymentMethodForm, bankAccountForm], submitDirectDeposit)
    : composeSubmitHandler([paymentMethodForm], submitCheck)

  const isPending = paymentMethodForm.status.isPending || bankAccountForm.status.isPending

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
    <section className={classNames(styles.root, className)}>
      <BaseLayout error={errorHandling.errors}>
        <Form onSubmit={handleSubmit}>
          <Flex gap={32} flexDirection="column">
            <Components.Heading as="h2">{t('title')}</Components.Heading>
            <Flex flexDirection="column" gap={20}>
              <Type
                label={t('paymentFieldsetLegend')}
                getOptionLabel={(value: ContractorPaymentMethodFormType) =>
                  value === PAYMENT_METHODS.directDeposit
                    ? t('directDepositLabel')
                    : t('checkLabel')
                }
                FieldComponent={TypeFieldComponent}
                formHookResult={paymentMethodForm}
              />
              {isDirectDeposit && (
                <>
                  <Name
                    label={t('bankAccountForm.nameLabel')}
                    validationMessages={{ REQUIRED: t('bankAccountForm.validations.accountName') }}
                    formHookResult={bankAccountForm}
                  />
                  <RoutingNumber
                    label={t('bankAccountForm.routingNumberLabel')}
                    description={t('bankAccountForm.routingNumberDescription')}
                    validationMessages={{
                      REQUIRED: t('bankAccountForm.validations.routingNumber'),
                      INVALID_ROUTING_NUMBER: t('bankAccountForm.validations.routingNumber'),
                    }}
                    formHookResult={bankAccountForm}
                  />
                  <AccountNumber
                    label={t('bankAccountForm.accountNumberLabel')}
                    validationMessages={{
                      REQUIRED: t('bankAccountForm.validations.accountNumber'),
                      INVALID_ACCOUNT_NUMBER: t('bankAccountForm.validations.accountNumber'),
                    }}
                    formHookResult={bankAccountForm}
                  />
                  <AccountType
                    label={t('bankAccountForm.accountTypeLabel')}
                    getOptionLabel={(value: string) =>
                      value === 'Checking'
                        ? t('bankAccountForm.accountTypeChecking')
                        : t('bankAccountForm.accountTypeSavings')
                    }
                    formHookResult={bankAccountForm}
                  />
                </>
              )}
            </Flex>
            <ActionsLayout>
              <Components.Button type="submit" variant="primary" isDisabled={isPending}>
                {isPending ? t('submittingCta') : t('continueCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </BaseLayout>
    </section>
  )
}
