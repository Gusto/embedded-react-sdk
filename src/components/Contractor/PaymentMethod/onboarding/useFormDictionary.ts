import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ContractorBankAccountFieldsDictionary } from '../shared/ContractorBankAccountFields'
import { useI18n } from '@/i18n'

/**
 * Resolves the shared `ContractorBankAccountFields`' text against onboarding's
 * existing `Contractor.PaymentMethod` namespace (`bankAccountForm.*`), preserving
 * backward compatibility for partners overriding the onboarding keys through the
 * block's `dictionary` prop. Onboarding's `bankAccountForm.validations.accountNumber`
 * covers both required and invalid-format cases today, so both shared validation
 * keys map onto it here to keep the displayed message unchanged.
 *
 * @internal
 */
export function useOnboardingBankAccountFieldsDictionary(): ContractorBankAccountFieldsDictionary {
  useI18n('Contractor.PaymentMethod')
  const { t } = useTranslation('Contractor.PaymentMethod')

  return useMemo<ContractorBankAccountFieldsDictionary>(
    () => ({
      en: {
        nameLabel: t('bankAccountForm.nameLabel'),
        routingNumberLabel: t('bankAccountForm.routingNumberLabel'),
        routingNumberDescription: t('bankAccountForm.routingNumberDescription'),
        accountNumberLabel: t('bankAccountForm.accountNumberLabel'),
        accountTypeLabel: t('bankAccountForm.accountTypeLabel'),
        accountTypeChecking: t('bankAccountForm.accountTypeChecking'),
        accountTypeSavings: t('bankAccountForm.accountTypeSavings'),
        validations: {
          accountName: t('bankAccountForm.validations.accountName'),
          routingNumber: t('bankAccountForm.validations.routingNumber'),
          accountNumber: t('bankAccountForm.validations.accountNumber'),
          accountNumberFormat: t('bankAccountForm.validations.accountNumber'),
        },
      },
    }),
    [t],
  )
}
