import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BankFormBodyDictionary } from '../shared/BankFormBody'
import type { SplitPaymentsFormBodyDictionary } from '../shared/SplitPaymentsFormBody'
import { useI18n } from '@/i18n'

/**
 * Resolves the shared `BankFormBody`'s text against onboarding's existing
 * `Employee.PaymentMethod` namespace. The cancel action maps onboarding's
 * `cancelAddCta` (the bank form's "Cancel" button) onto the body's `cancelCta`,
 * preserving backward compatibility for partners overriding the onboarding keys
 * through the block's `dictionary` prop.
 */
export function useOnboardingBankFormDictionary(): BankFormBodyDictionary {
  useI18n('Employee.PaymentMethod')
  const { t } = useTranslation('Employee.PaymentMethod')

  return useMemo<BankFormBodyDictionary>(
    () => ({
      en: {
        nameLabel: t('nameLabel'),
        routingNumberLabel: t('routingNumberLabel'),
        routingNumberDescription: t('routingNumberDescription'),
        accountNumberLabel: t('accountNumberLabel'),
        accountTypeLabel: t('accountTypeLabel'),
        accountTypeChecking: t('accountTypeChecking'),
        accountTypeSavings: t('accountTypeSavings'),
        cancelCta: t('cancelAddCta'),
        saveCta: t('saveCta'),
        validations: {
          accountName: t('validations.accountName'),
          routingNumber: t('validations.routingNumber'),
          accountNumber: t('validations.accountNumber'),
          accountNumberFormat: t('validations.accountNumberFormat'),
        },
      },
    }),
    [t],
  )
}

/**
 * Resolves the shared `SplitPaymentsFormBody`'s text against onboarding's
 * existing `Employee.PaymentMethod` namespace. Interpolated templates
 * (`splitAmountLabel`, `validations.percentageErrorWithTotal`) are passed
 * through unresolved so the body interpolates them at render time. The cancel
 * action maps onboarding's `cancelAddCta` onto the body's `cancelCta`.
 */
export function useOnboardingSplitFormDictionary(): SplitPaymentsFormBodyDictionary {
  useI18n('Employee.PaymentMethod')
  const { t } = useTranslation('Employee.PaymentMethod')

  return useMemo<SplitPaymentsFormBodyDictionary>(
    () => ({
      en: {
        title: t('title'),
        splitDescription: t('splitDescription'),
        splitByLabel: t('splitByLabel'),
        percentageLabel: t('percentageLabel'),
        amountLabel: t('amountLabel'),
        splitAmountLabel: t('splitAmountLabel'),
        draggableListLabel: t('draggableListLabel'),
        remainderLabel: t('remainderLabel'),
        cancelCta: t('cancelAddCta'),
        saveCta: t('saveCta'),
        validations: {
          percentageErrorWithTotal: t('validations.percentageErrorWithTotal'),
          amountError: t('validations.amountError'),
          percentageAmountError: t('validations.percentageAmountError'),
        },
      },
    }),
    [t],
  )
}
