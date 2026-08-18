import { useTranslation } from 'react-i18next'
import type { UseContractorBankAccountFormReady } from '../useContractorBankAccountForm'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'

/** @internal */
export type ContractorBankAccountFieldsDictionary =
  ResourceDictionary<'Contractor.BankAccountFields'>

/** @internal */
export interface ContractorBankAccountFieldsProps {
  /** The `useContractorBankAccountForm` result to bind the fields to. */
  bankAccountForm: UseContractorBankAccountFormReady
  /**
   * Translation overrides for the fields' strings. Each consuming surface
   * passes the dictionary it resolved from its own namespace so a partner
   * override on one surface doesn't leak into the other.
   */
  dictionary?: ContractorBankAccountFieldsDictionary
}

/**
 * Shared bank-account field set (nickname, routing number, account number,
 * account type) used by both the onboarding `PaymentMethod` step and the
 * management `PaymentMethodEditForm`. Owns only the fields — not a `<Form>`,
 * `SDKFormProvider`, or submit actions — since onboarding renders these
 * fields inline within a combined form alongside a payment-type selector,
 * while management renders them inside its own standalone form via
 * {@link ContractorBankAccountFormBody}. Binds explicitly via
 * `formHookResult` on each field rather than relying on an ambient
 * `SDKFormProvider`, so it works in both contexts.
 *
 * @internal
 */
export function ContractorBankAccountFields({
  bankAccountForm,
  dictionary,
}: ContractorBankAccountFieldsProps) {
  useI18n('Contractor.BankAccountFields')
  useComponentDictionary('Contractor.BankAccountFields', dictionary)
  const { t } = useTranslation('Contractor.BankAccountFields')
  const { Name, RoutingNumber, AccountNumber, AccountType } = bankAccountForm.form.Fields

  return (
    <>
      <Name
        label={t('nameLabel')}
        validationMessages={{ REQUIRED: t('validations.accountName') }}
        formHookResult={bankAccountForm}
      />
      <RoutingNumber
        label={t('routingNumberLabel')}
        description={t('routingNumberDescription')}
        validationMessages={{
          REQUIRED: t('validations.routingNumber'),
          INVALID_ROUTING_NUMBER: t('validations.routingNumber'),
        }}
        formHookResult={bankAccountForm}
      />
      <AccountNumber
        label={t('accountNumberLabel')}
        validationMessages={{
          REQUIRED: t('validations.accountNumber'),
          INVALID_ACCOUNT_NUMBER: t('validations.accountNumberFormat'),
        }}
        formHookResult={bankAccountForm}
      />
      <AccountType
        label={t('accountTypeLabel')}
        getOptionLabel={(value: string) =>
          value === 'Checking' ? t('accountTypeChecking') : t('accountTypeSavings')
        }
        formHookResult={bankAccountForm}
      />
    </>
  )
}
