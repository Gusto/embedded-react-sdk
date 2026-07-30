import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { ContractorBankAccountFormBody } from '../shared/ContractorBankAccountFormBody'
import { useManagementBankAccountFieldsDictionary } from './useFormDictionary'
import styles from './PaymentMethodEditForm.module.scss'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
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
export function PaymentMethodEditForm({
  FallbackComponent,
  LoaderComponent,
  ...props
}: PaymentMethodEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.PaymentMethod"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <PaymentMethodEditFormRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function PaymentMethodEditFormRoot({
  contractorId,
  className,
  dictionary,
  onEvent,
  LoaderComponent,
}: PaymentMethodEditFormProps) {
  useI18n('Contractor.Management.PaymentMethod')
  useComponentDictionary('Contractor.Management.PaymentMethod', dictionary)
  const { t } = useTranslation('Contractor.Management.PaymentMethod')
  const Components = useComponentContext()
  const bankAccountFieldsDictionary = useManagementBankAccountFieldsDictionary()

  return (
    <section className={classNames(styles.container, className)}>
      <Components.Heading as="h2">{t('form.title')}</Components.Heading>
      <ContractorBankAccountFormBody
        contractorId={contractorId}
        dictionary={bankAccountFieldsDictionary}
        LoaderComponent={LoaderComponent}
        onSaved={data => {
          onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED, data)
        }}
        onCancel={() => {
          onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED)
        }}
      />
    </section>
  )
}
