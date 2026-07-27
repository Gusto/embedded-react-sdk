import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useContractorBankAccountForm } from '../shared/useContractorBankAccountForm'
import styles from './PaymentMethodEditForm.module.scss'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link PaymentMethodEditForm}.
 *
 * @public
 */
export interface PaymentMethodEditFormProps extends BaseComponentInterface<'Contractor.Management.PaymentMethod'> {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Standalone bank-account form for a contractor's payment method.
 *
 * @remarks
 * Renders fields for the account nickname, routing number, account number,
 * and account type. Saving creates the bank account, which updates the
 * contractor's payment method to Direct Deposit as a server-side effect. Save
 * and Cancel both emit events so the parent can return to the read view.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/paymentMethod/bankForm/submitted` | Fired after the bank account is successfully saved | The created `ContractorBankAccount` entity |
 * | `contractor/management/paymentMethod/bankForm/cancelled` | Fired when the user clicks Cancel | — |
 *
 * @param input - See {@link PaymentMethodEditFormProps}.
 * @returns The contractor payment method bank-account form.
 * @public
 */
export function PaymentMethodEditForm({ FallbackComponent, ...props }: PaymentMethodEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.PaymentMethod"
      FallbackComponent={FallbackComponent}
    >
      <PaymentMethodEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function PaymentMethodEditFormRoot({
  contractorId,
  className,
  dictionary,
  onEvent,
}: PaymentMethodEditFormProps) {
  useI18n('Contractor.Management.PaymentMethod')
  useComponentDictionary('Contractor.Management.PaymentMethod', dictionary)
  const { t } = useTranslation('Contractor.Management.PaymentMethod')
  const Components = useComponentContext()

  const bankAccountForm = useContractorBankAccountForm({ contractorId })

  if (bankAccountForm.isLoading) {
    return <BaseLayout isLoading error={bankAccountForm.errorHandling.errors} />
  }

  const { Fields } = bankAccountForm.form

  const handleSubmit = async () => {
    const result = await bankAccountForm.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED, result.data)
  }

  const handleCancel = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED)
  }

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={bankAccountForm.errorHandling.errors}>
        <SDKFormProvider formHookResult={bankAccountForm}>
          <Form onSubmit={handleSubmit}>
            <Components.Heading as="h2">{t('form.title')}</Components.Heading>
            <Fields.Name
              label={t('form.nameLabel')}
              validationMessages={{ REQUIRED: t('form.validations.name') }}
            />
            <Fields.RoutingNumber
              label={t('form.routingNumberLabel')}
              description={t('form.routingNumberDescription')}
              validationMessages={{
                REQUIRED: t('form.validations.routingNumber'),
                INVALID_ROUTING_NUMBER: t('form.validations.routingNumber'),
              }}
            />
            <Fields.AccountNumber
              label={t('form.accountNumberLabel')}
              validationMessages={{
                REQUIRED: t('form.validations.accountNumber'),
                INVALID_ACCOUNT_NUMBER: t('form.validations.accountNumber'),
              }}
            />
            <Fields.AccountType
              label={t('form.accountTypeLabel')}
              getOptionLabel={(value: string) =>
                value === 'Checking' ? t('form.accountTypeChecking') : t('form.accountTypeSavings')
              }
            />
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel} type="button">
                {t('form.cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={bankAccountForm.status.isPending}>
                {t('form.saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
