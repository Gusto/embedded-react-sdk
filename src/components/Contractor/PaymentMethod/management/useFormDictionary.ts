import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ContractorBankAccountFieldsDictionary } from '../shared/ContractorBankAccountFields'
import { useI18n } from '@/i18n'

/**
 * Resolves the shared `ContractorBankAccountFields`/`ContractorBankAccountFormBody`
 * text against management's existing `Contractor.Management.PaymentMethod`
 * namespace (`form.*`). Management's `form.validations.accountNumber` covers both
 * required and invalid-format cases today, so both shared validation keys map
 * onto it here to keep the displayed message unchanged.
 *
 * @internal
 */
export function useManagementBankAccountFieldsDictionary(): ContractorBankAccountFieldsDictionary {
  useI18n('Contractor.Management.PaymentMethod')
  const { t } = useTranslation('Contractor.Management.PaymentMethod')

  return useMemo<ContractorBankAccountFieldsDictionary>(
    () => ({
      en: {
        nameLabel: t('form.nameLabel'),
        routingNumberLabel: t('form.routingNumberLabel'),
        routingNumberDescription: t('form.routingNumberDescription'),
        accountNumberLabel: t('form.accountNumberLabel'),
        accountTypeLabel: t('form.accountTypeLabel'),
        accountTypeChecking: t('form.accountTypeChecking'),
        accountTypeSavings: t('form.accountTypeSavings'),
        cancelCta: t('form.cancelCta'),
        saveCta: t('form.saveCta'),
        validations: {
          accountName: t('form.validations.name'),
          routingNumber: t('form.validations.routingNumber'),
          accountNumber: t('form.validations.accountNumber'),
          accountNumberFormat: t('form.validations.accountNumber'),
        },
      },
    }),
    [t],
  )
}
