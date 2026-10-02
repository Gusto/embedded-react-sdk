import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useTaxPaymentsGetTaxPaymentSuspense } from '@gusto/embedded-api/react-query/taxPaymentsGetTaxPayment'
import { buildPayrollsGetQuery } from '@gusto/embedded-api/react-query/payrollsGet'
import { deriveTaxPaymentStatus } from '../shared/taxPaymentStatus'
import { TaxPaymentDetailPresentation, type PayPeriodRange } from './TaxPaymentDetailPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link TaxPaymentDetail}.
 *
 * @alpha
 */
export interface TaxPaymentDetailProps extends BaseComponentInterface<'Payroll.TaxPaymentDetail'> {
  /** Identifier of the company the tax payment belongs to. */
  companyId: string
  /** Identifier of the tax payment to display. */
  taxPaymentId: string
}

/**
 * Displays a single tax payment: its agency, status, jurisdiction, period, due date, amounts, and
 * the payroll tax liabilities that make it up.
 *
 * @remarks
 * Requires the `taxPayments` flag in {@link UnstableFeatures}. Each liability is labeled with the
 * pay period of the payroll it came from.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `payroll/taxPayments/back` | Fired when the user clicks the back button | — |
 *
 * @param props - See {@link TaxPaymentDetailProps}.
 * @returns The rendered tax payment detail view.
 * @alpha
 */
export function TaxPaymentDetail(props: TaxPaymentDetailProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({
  companyId,
  taxPaymentId,
  className,
  dictionary,
  onEvent,
}: TaxPaymentDetailProps) => {
  useUnstableFeature('taxPayments', { throwIfDisabled: true })
  useComponentDictionary('Payroll.TaxPaymentDetail', dictionary)
  useI18n('Payroll.TaxPaymentDetail')
  const { t } = useTranslation('Payroll.TaxPaymentDetail')
  const gustoClient = useGustoEmbeddedContext()

  const {
    data: { taxPayment },
  } = useTaxPaymentsGetTaxPaymentSuspense({ companyUuid: companyId, uuid: taxPaymentId })

  if (!taxPayment) {
    throw new Error(t('errors.taxPaymentNotFound'))
  }

  const payrollIds = useMemo(
    () => [...new Set((taxPayment.lineItems ?? []).map(lineItem => lineItem.payrollUuid))],
    [taxPayment.lineItems],
  )

  const payrollResults = useSuspenseQueries({
    queries: payrollIds.map(payrollId =>
      buildPayrollsGetQuery(gustoClient, { companyId, payrollId }),
    ),
  })

  const payPeriodsByPayrollId = useMemo(
    () =>
      Object.fromEntries(
        payrollIds.map((payrollId, index): [string, PayPeriodRange | undefined] => [
          payrollId,
          payrollResults[index]?.data.payrollShow?.payPeriod,
        ]),
      ),
    [payrollIds, payrollResults],
  )

  const status = deriveTaxPaymentStatus(taxPayment, formatDateToStringDate(new Date()) ?? '')

  return (
    <TaxPaymentDetailPresentation
      className={className}
      payment={taxPayment}
      status={status}
      payPeriodsByPayrollId={payPeriodsByPayrollId}
      onBack={() => {
        onEvent(componentEvents.TAX_PAYMENT_BACK)
      }}
    />
  )
}
