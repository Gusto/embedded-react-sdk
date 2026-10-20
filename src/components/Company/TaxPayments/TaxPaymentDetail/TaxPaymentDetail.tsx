import { useTranslation } from 'react-i18next'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useTaxPaymentsGetTaxPaymentSuspense } from '@gusto/embedded-api/react-query/taxPaymentsGetTaxPayment'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { buildPayrollsGetQuery } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import { deriveTaxPaymentStatus } from '../shared/taxPaymentStatus'
import { buildPayrollLookupWindow } from '../shared/payrollLookupWindow'
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
export interface TaxPaymentDetailProps extends BaseComponentInterface<'Company.Management.TaxPaymentDetail'> {
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
 * pay period of the payroll it came from, resolved through a single payroll lookup windowed around
 * the payment's tax period rather than one request per payroll.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/taxPayments/back` | Fired when the user clicks the back button | — |
 *
 * @param props - See {@link TaxPaymentDetailProps}.
 * @returns The rendered tax payment detail view.
 * @alpha
 */
export function TaxPaymentDetail(props: TaxPaymentDetailProps) {
  useUnstableFeature('taxPayments', { throwIfDisabled: true })

  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

/** Maximum payrolls fetched per windowed lookup; matches the endpoint's page-size ceiling. */
const PAYROLL_LOOKUP_PER_PAGE = 100

const Root = ({
  companyId,
  taxPaymentId,
  className,
  dictionary,
  onEvent,
}: TaxPaymentDetailProps) => {
  useComponentDictionary('Company.Management.TaxPaymentDetail', dictionary)
  useI18n('Company.Management.TaxPaymentDetail')
  const { t } = useTranslation('Company.Management.TaxPaymentDetail')
  const gustoClient = useGustoEmbeddedContext()

  const {
    data: { taxPayment },
  } = useTaxPaymentsGetTaxPaymentSuspense({ companyUuid: companyId, uuid: taxPaymentId })

  const payrollIds = [...new Set((taxPayment?.lineItems ?? []).map(item => item.payrollUuid))]

  // One windowed list request resolves the pay period for every liability, instead of a GET per
  // payroll. `payrollsList` filters on pay period when `dateFilterBy` is omitted, which is what the
  // liabilities are keyed by.
  const lookupWindow = buildPayrollLookupWindow(
    taxPayment?.periodStart?.toString(),
    taxPayment?.periodEnd.toString(),
    formatDateToStringDate(new Date()) ?? '',
  )

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Processed, ProcessingStatuses.Unprocessed],
    payrollTypes: [
      QueryParamPayrollTypes.Regular,
      QueryParamPayrollTypes.OffCycle,
      QueryParamPayrollTypes.External,
    ],
    startDate: lookupWindow?.startDate,
    endDate: lookupWindow?.endDate,
    per: PAYROLL_LOOKUP_PER_PAGE,
  })

  const windowedPayPeriods = new Map<string, PayPeriodRange | undefined>()
  for (const payroll of payrollsData.payrollList ?? []) {
    if (payroll.payrollUuid) windowedPayPeriods.set(payroll.payrollUuid, payroll.payPeriod)
  }

  // Safety net for liabilities whose payroll fell outside the padded window, so correctness does
  // not depend on the padding being wide enough. Normally resolves to zero extra requests.
  const unresolvedPayrollIds = payrollIds.filter(id => !windowedPayPeriods.has(id))

  const fallbackResults = useSuspenseQueries({
    queries: unresolvedPayrollIds.map(payrollId =>
      buildPayrollsGetQuery(gustoClient, { companyId, payrollId }),
    ),
  })

  const payPeriodsByPayrollId: Record<string, PayPeriodRange | undefined> = {}
  for (const payrollId of payrollIds) {
    payPeriodsByPayrollId[payrollId] = windowedPayPeriods.get(payrollId)
  }
  unresolvedPayrollIds.forEach((payrollId, index) => {
    payPeriodsByPayrollId[payrollId] = fallbackResults[index]?.data.payrollShow?.payPeriod
  })

  if (!taxPayment) {
    throw new Error(t('errors.taxPaymentNotFound'))
  }

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
