import { useTranslation } from 'react-i18next'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'
import {
  FEDERAL_JURISDICTION,
  TAX_PAYMENT_STATUS_BADGES,
  TAX_PAYMENT_STATUSES,
  isFederalTaxPayment,
  type TaxPaymentStatus,
} from '../shared/taxPaymentStatus'
import styles from './TaxPaymentsListPresentation.module.scss'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import SearchIcon from '@/assets/icons/search-lg.svg?react'

/** @internal */
export interface TaxPaymentRow {
  payment: TaxPayment
  status: TaxPaymentStatus
}

/** @internal */
export interface TaxPaymentsListPresentationProps {
  /** CSS class name applied to the root element. */
  className?: string
  /** Rows for the current page, already filtered and searched. */
  rows: TaxPaymentRow[]
  /** Number of overdue payments, regardless of the active filters. */
  overdueCount: number
  /** Distinct jurisdictions across all payments, used to build the jurisdiction filter. */
  jurisdictions: string[]
  /** Whether the company has any tax payments at all, before filtering. */
  hasPayments: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  jurisdictionFilter: string
  onJurisdictionFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  pagination: PaginationControlProps
  onViewPayment: (taxPaymentId: string) => void
}

/** @internal */
export function TaxPaymentsListPresentation({
  className,
  rows,
  overdueCount,
  jurisdictions,
  hasPayments,
  searchValue,
  onSearchChange,
  jurisdictionFilter,
  onJurisdictionFilterChange,
  statusFilter,
  onStatusFilterChange,
  pagination,
  onViewPayment,
}: TaxPaymentsListPresentationProps) {
  const { Alert, Badge, Button, Heading, Select, Text, TextInput } = useComponentContext()
  useI18n('Payroll.TaxPaymentsList')
  const { t } = useTranslation('Payroll.TaxPaymentsList')
  const currencyFormatter = useNumberFormatter('currency')
  const { formatShortWithYear } = useDateFormatter()

  const agencyLabel = (payment: TaxPayment) => payment.agencyName ?? t('unknownAgency')

  const jurisdictionLabel = (payment: TaxPayment) =>
    isFederalTaxPayment(payment)
      ? t('federal')
      : t('state', { jurisdiction: payment.jurisdiction ?? '' })

  const jurisdictionOptions = [
    { value: '', label: t('allJurisdictions') },
    ...jurisdictions.map(jurisdiction => ({
      value: jurisdiction,
      label: jurisdiction === FEDERAL_JURISDICTION ? t('federalJurisdictionOption') : jurisdiction,
    })),
  ]

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    ...TAX_PAYMENT_STATUSES.map(status => ({ value: status, label: t(`status.${status}`) })),
  ]

  const dataViewProps = useDataView<TaxPaymentRow>({
    data: rows,
    columns: [
      {
        key: 'agency',
        title: t('columns.agency'),
        render: ({ payment }) => (
          <Text as="span" weight="semibold">
            {agencyLabel(payment)}
          </Text>
        ),
      },
      {
        key: 'jurisdiction',
        title: t('columns.jurisdiction'),
        render: ({ payment }) => jurisdictionLabel(payment),
      },
      {
        key: 'period',
        title: t('columns.period'),
        render: ({ payment }) =>
          t('periodRange', {
            start: formatShortWithYear(payment.periodStart?.toString()),
            end: formatShortWithYear(payment.periodEnd.toString()),
          }),
      },
      {
        key: 'dueDate',
        title: t('columns.dueDate'),
        render: ({ payment }) => formatShortWithYear(payment.dueDate?.toString()),
      },
      {
        key: 'amount',
        title: t('columns.amount'),
        justify: 'end',
        render: ({ payment }) => currencyFormatter(Number(payment.amount)),
      },
      {
        key: 'status',
        title: t('columns.status'),
        render: ({ status }) => (
          <Badge status={TAX_PAYMENT_STATUS_BADGES[status]}>{t(`status.${status}`)}</Badge>
        ),
      },
    ],
    itemMenu: ({ payment }) => (
      <Button
        variant="secondary"
        aria-label={t('viewPaymentLabel', { agency: agencyLabel(payment) })}
        onClick={() => {
          onViewPayment(payment.uuid)
        }}
      >
        {t('viewCta')}
      </Button>
    ),
    emptyState: () =>
      hasPayments ? (
        <EmptyData title={t('noResults.title')} description={t('noResults.description')} />
      ) : (
        <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
      ),
    pagination,
  })

  return (
    <Flex className={className} flexDirection="column" gap={24}>
      <Heading as="h2">{t('title')}</Heading>

      {overdueCount > 0 && (
        <Alert status="warning" label={t('overdueAlert.label', { count: overdueCount })} />
      )}

      {hasPayments && (
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <TextInput
              name="tax-payments-search"
              type="search"
              label={t('searchLabel')}
              shouldVisuallyHideLabel
              placeholder={t('searchPlaceholder')}
              value={searchValue}
              onChange={onSearchChange}
              adornmentStart={<SearchIcon aria-hidden />}
            />
          </div>
          <div className={styles.filters}>
            <Select
              label={t('jurisdictionFilterLabel')}
              shouldVisuallyHideLabel
              placeholder={t('allJurisdictions')}
              options={jurisdictionOptions}
              value={jurisdictionFilter}
              onChange={onJurisdictionFilterChange}
            />
            <Select
              label={t('statusFilterLabel')}
              shouldVisuallyHideLabel
              placeholder={t('allStatuses')}
              options={statusOptions}
              value={statusFilter}
              onChange={onStatusFilterChange}
            />
          </div>
        </div>
      )}

      <DataView label={t('tableLabel')} {...dataViewProps} />
    </Flex>
  )
}
