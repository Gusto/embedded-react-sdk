import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { PaymentSummaryBlockDictionary } from '../shared/PaymentSummaryBlock'

/**
 * Resolves `PaymentSummaryBlock`'s text against `HistoricalPaymentSummary`'s own
 * `Contractor.Payments.HistoricalPaymentSummary` namespace, so partner overrides on that
 * namespace flow into the shared block.
 *
 * @internal
 */
export function useHistoricalPaymentSummaryDictionary(): PaymentSummaryBlockDictionary {
  const { t } = useTranslation('Contractor.Payments.HistoricalPaymentSummary')

  return useMemo<PaymentSummaryBlockDictionary>(
    () => ({
      paymentSummaryTitle: t('paymentSummaryTitle'),
      totalAmount: t('totalAmount'),
      contractorPayDate: t('contractorPayDate'),
      contractorPaymentsTitle: t('contractorPaymentsTitle'),
      contractor: t('contractor'),
      wageType: t('wageType'),
      paymentMethod: t('paymentMethod'),
      paymentMethods: {
        directDeposit: t('paymentMethods.directDeposit'),
        check: t('paymentMethods.check'),
        historicalPayment: t('paymentMethods.historicalPayment'),
      },
      hours: t('hours'),
      wage: t('wage'),
      bonus: t('bonus'),
      reimbursement: t('reimbursement'),
      total: t('total'),
      totalsLabel: t('totalsLabel'),
      notAvailable: t('notAvailable'),
    }),
    [t],
  )
}
