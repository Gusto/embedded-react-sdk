import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BankFormBodyDictionary } from '../shared/BankFormBody'
import type { SplitPaymentsFormBodyDictionary } from '../shared/SplitPaymentsFormBody'
import { useI18n } from '@/i18n'

/**
 * Resolves the shared `BankFormBody`'s text against management's dedicated
 * `Employee.Management.PaymentMethodBankForm` namespace, so partner overrides on
 * the management bank form don't leak into the onboarding form.
 *
 * @internal
 */
export function useManagementBankFormDictionary(): BankFormBodyDictionary {
  useI18n('Employee.Management.PaymentMethodBankForm')
  const { t } = useTranslation('Employee.Management.PaymentMethodBankForm')

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
        cancelCta: t('cancelCta'),
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
 * Resolves the shared `SplitPaymentsFormBody`'s text against management's
 * dedicated `Employee.Management.PaymentMethodSplitForm` namespace, so partner
 * overrides on the management split form don't leak into the onboarding form.
 * Interpolated templates (`splitAmountLabel`,
 * `validations.percentageErrorWithTotal`) are passed through unresolved so the
 * body interpolates them at render time.
 *
 * @internal
 */
export function useManagementSplitFormDictionary(): SplitPaymentsFormBodyDictionary {
  useI18n('Employee.Management.PaymentMethodSplitForm')
  const { t } = useTranslation('Employee.Management.PaymentMethodSplitForm')

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
        cancelCta: t('cancelCta'),
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
