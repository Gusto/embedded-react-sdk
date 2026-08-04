import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SetPaymentAmountsDictionary } from '../shared/SetPaymentAmounts'

/**
 * Resolves `SetPaymentAmounts`'s text against `HistoricalPaymentAmounts`'s own
 * `Contractor.Payments.HistoricalPaymentAmounts` namespace, so partner
 * overrides on that namespace flow into the shared grid and edit modal.
 *
 * @internal
 */
export function useHistoricalPaymentAmountsDictionary(): SetPaymentAmountsDictionary {
  const { t } = useTranslation('Contractor.Payments.HistoricalPaymentAmounts')

  return useMemo<SetPaymentAmountsDictionary>(
    () => ({
      hoursAndPaymentsLabel: t('hoursAndPaymentsLabel'),
      contractorTableHeaders: {
        contractor: t('contractorTableHeaders.contractor'),
        wageType: t('contractorTableHeaders.wageType'),
        paymentMethod: t('contractorTableHeaders.paymentMethod'),
        hours: t('contractorTableHeaders.hours'),
        wage: t('contractorTableHeaders.wage'),
        bonus: t('contractorTableHeaders.bonus'),
        reimbursement: t('contractorTableHeaders.reimbursement'),
        total: t('contractorTableHeaders.total'),
      },
      emptyTableTitle: t('emptyTableTitle'),
      emptyTableDescription: t('emptyTableDescription'),
      na: t('na'),
      totalsLabel: t('totalsLabel'),
      editContractor: t('editContractor'),
      perHour: t('perHour'),
      editContractorPayment: {
        title: t('editContractorPayment.title'),
        subtitle: t('editContractorPayment.subtitle'),
        hoursLabel: t('editContractorPayment.hoursLabel'),
        hoursAdornment: t('editContractorPayment.hoursAdornment'),
        hoursPayDescription: (rate, total) =>
          t('editContractorPayment.hoursPayDescription', { rate, total }),
        wageLabel: t('editContractorPayment.wageLabel'),
        bonusLabel: t('editContractorPayment.bonusLabel'),
        reimbursementLabel: t('editContractorPayment.reimbursementLabel'),
        paymentMethodLabel: t('editContractorPayment.paymentMethodLabel'),
        cancelCta: t('editContractorPayment.cancelCta'),
        saveCta: t('editContractorPayment.saveCta'),
        paymentMethods: {
          check: t('editContractorPayment.paymentMethods.check'),
          directDeposit: t('editContractorPayment.paymentMethods.directDeposit'),
          historicalPayment: t('editContractorPayment.paymentMethods.historicalPayment'),
        },
        errors: {
          directDepositNotAvailable: t('editContractorPayment.errors.directDepositNotAvailable'),
          unsupportedPaymentMethod: t('editContractorPayment.errors.unsupportedPaymentMethod'),
        },
      },
    }),
    [t],
  )
}
