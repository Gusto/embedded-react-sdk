import { useTranslation } from 'react-i18next'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'
import type { TaxPaymentLineItem } from '@gusto/embedded-api/models/components/taxpaymentlineitem'
import {
  TAX_PAYMENT_STATUS_BADGES,
  isFederalTaxPayment,
  type TaxPaymentStatus,
} from '../shared/taxPaymentStatus'
import styles from './TaxPaymentDetailPresentation.module.scss'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'

/** @internal */
export interface PayPeriodRange {
  startDate?: string | null
  endDate?: string | null
}

/** @internal */
export interface TaxPaymentDetailPresentationProps {
  /** CSS class name applied to the root element. */
  className?: string
  payment: TaxPayment
  status: TaxPaymentStatus
  /** Pay period of each payroll referenced by the payment's line items, keyed by payroll UUID. */
  payPeriodsByPayrollId: Record<string, PayPeriodRange | undefined>
  onBack: () => void
}

/** @internal */
export function TaxPaymentDetailPresentation({
  className,
  payment,
  status,
  payPeriodsByPayrollId,
  onBack,
}: TaxPaymentDetailPresentationProps) {
  const { Alert, Badge, Box, BoxHeader, Button, DescriptionList, Heading, Text } =
    useComponentContext()
  useI18n('Payroll.TaxPaymentDetail')
  const { t } = useTranslation('Payroll.TaxPaymentDetail')
  const currencyFormatter = useNumberFormatter('currency')
  const { formatShort, formatShortWithYear, formatLongWithYear } = useDateFormatter()

  const jurisdictionLabel = isFederalTaxPayment(payment)
    ? t('federal')
    : t('state', { jurisdiction: payment.jurisdiction ?? '' })

  const formatTaxPeriod = (start?: string | null, end?: string | null) =>
    start && end
      ? t('periodRange', { start: formatLongWithYear(start), end: formatLongWithYear(end) })
      : t('notAvailable')

  const formatPayPeriod = (payPeriod?: PayPeriodRange) =>
    payPeriod?.startDate && payPeriod.endDate
      ? t('periodRange', {
          start: formatShort(payPeriod.startDate),
          end: formatShortWithYear(payPeriod.endDate),
        })
      : t('notAvailable')

  const liabilitiesDataView = useDataView<TaxPaymentLineItem>({
    data: payment.lineItems ?? [],
    columns: [
      {
        key: 'uniqueTaxId',
        title: t('liabilities.taxIdColumn'),
      },
      {
        key: 'payrollUuid',
        title: t('liabilities.payrollColumn'),
        render: ({ payrollUuid }) => formatPayPeriod(payPeriodsByPayrollId[payrollUuid]),
      },
      {
        key: 'amount',
        title: t('liabilities.amountColumn'),
        justify: 'end',
        render: ({ amount }) => currencyFormatter(Number(amount)),
      },
    ],
    emptyState: () => <EmptyData title={t('liabilities.emptyState')} />,
  })

  return (
    <Flex className={className} flexDirection="column" gap={24}>
      <div>
        <Button variant="secondary" onClick={onBack}>
          {t('backCta')}
        </Button>
      </div>

      <Flex flexDirection="column" gap={4}>
        <div className={styles.header}>
          <Heading as="h2">{payment.agencyName ?? t('unknownAgency')}</Heading>
          <Badge status={TAX_PAYMENT_STATUS_BADGES[status]}>{t(`status.${status}`)}</Badge>
        </div>
        <Text variant="supporting">{jurisdictionLabel}</Text>
      </Flex>

      {status === 'overdue' && (
        <Alert status="warning" label={t('overdueAlert.label')}>
          <Text size="sm">
            {t('overdueAlert.description', {
              dueDate: formatLongWithYear(payment.dueDate?.toString()),
            })}
          </Text>
        </Alert>
      )}

      <Flex flexDirection="column" gap={32}>
        <Box header={<BoxHeader title={t('details.title')} headingLevel="h4" />}>
          <DescriptionList
            layout="horizontal"
            items={[
              { term: t('details.jurisdiction'), description: jurisdictionLabel },
              {
                term: t('details.period'),
                description: formatTaxPeriod(
                  payment.periodStart?.toString(),
                  payment.periodEnd.toString(),
                ),
              },
              {
                term: t('details.dueDate'),
                description: payment.dueDate
                  ? formatLongWithYear(payment.dueDate.toString())
                  : t('notAvailable'),
              },
              {
                term: t('details.paymentSentOn'),
                description: payment.paymentSentOn
                  ? formatLongWithYear(payment.paymentSentOn.toString())
                  : t('notAvailable'),
              },
              {
                term: t('details.amount'),
                description: currencyFormatter(Number(payment.amount)),
              },
              {
                term: t('details.amountPaid'),
                description: currencyFormatter(Number(payment.amountPaid)),
              },
            ]}
          />
        </Box>

        <Box
          header={<BoxHeader title={t('liabilities.title')} headingLevel="h4" />}
          withPadding={false}
        >
          <DataView label={t('liabilities.tableLabel')} isWithinBox {...liabilitiesDataView} />
        </Box>
      </Flex>
    </Flex>
  )
}
