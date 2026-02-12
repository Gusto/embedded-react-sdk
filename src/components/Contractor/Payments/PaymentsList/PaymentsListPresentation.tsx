import { useTranslation } from 'react-i18next'
import type { ContractorPaymentGroupWithBlockers } from '@gusto/embedded-api/models/components/contractorpaymentgroupwithblockers'
import type { InternalAlert } from '../types'
import styles from './PaymentsListPresentation.module.scss'
import { DataView, Flex, EmptyData, ActionsLayout, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import EyeIcon from '@/assets/icons/eye.svg?react'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { ConfirmWireDetails } from '@/components/Payroll/ConfirmWireDetails'
import type { EventType } from '@/shared/constants'

interface ContractorPaymentPaymentsListPresentationProps {
  numberOfMonths: number
  contractorPayments: ContractorPaymentGroupWithBlockers[]
  onCreatePayment: () => void
  onDateRangeChange: (numberOfMonths: number) => void
  onViewPayment: (paymentId: string) => void
  alerts?: InternalAlert[]
  companyId: string
  hasUnresolvedWireInRequests: boolean
  onEvent: (type: EventType, data?: unknown) => void
}

export const PaymentsListPresentation = ({
  contractorPayments,
  numberOfMonths,
  onCreatePayment,
  onDateRangeChange,
  onViewPayment,
  alerts = [],
  companyId,
  hasUnresolvedWireInRequests,
  onEvent,
}: ContractorPaymentPaymentsListPresentationProps) => {
  const { Button, Text, Heading, Select, ButtonIcon, Alert } = useComponentContext()
  useI18n('Contractor.Payments.PaymentsList')
  const { t } = useTranslation('Contractor.Payments.PaymentsList')
  const currencyFormatter = useNumberFormatter('currency')
  const { formatLongWithYear } = useDateFormatter()

  const dateRangeOptions = [
    { value: '3', label: t('dateRanges.last3Months') },
    { value: '6', label: t('dateRanges.last6Months') },
    { value: '12', label: t('dateRanges.last12Months') },
  ]
  const { ...dataViewProps } = useDataView({
    data: contractorPayments,
    columns: [
      {
        title: t('paymentDateColumnLabel'),
        render: ({ checkDate }) => (
          <Text weight="semibold" variant="supporting">
            {formatLongWithYear(checkDate) || 'N/A'}
          </Text>
        ),
      },
      {
        title: t('wageTotalColumnLabel'),
        render: ({ totals }) => <Text>{currencyFormatter(Number(totals?.wageAmount || 0))}</Text>,
      },
      {
        title: t('reimbursementTotalColumnLabel'),
        render: ({ totals }) => (
          <Text>{currencyFormatter(Number(totals?.reimbursementAmount) || 0)}</Text>
        ),
      },
    ],
    itemMenu: ({ uuid }) => (
      <ButtonIcon
        aria-label={t('viewPaymentCta')}
        variant="tertiary"
        onClick={() => {
          onViewPayment(uuid || '')
        }}
      >
        <EyeIcon aria-hidden />
      </ButtonIcon>
    ),
    emptyState: () => (
      <EmptyData title={t('noPaymentsFound')} description={t('noPaymentsDescription')}>
        <ActionsLayout justifyContent="center">
          <Button variant="primary" onClick={onCreatePayment}>
            {t('createPaymentCta')}
          </Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={16}>
        <Heading as="h1">{t('title')}</Heading>
      </Flex>

      {hasUnresolvedWireInRequests && (
        <ConfirmWireDetails companyId={companyId} onEvent={onEvent} />
      )}

      {alerts.length > 0 && (
        <Flex flexDirection="column" gap={16}>
          {alerts.map((alert, index) => (
            <Alert
              key={`${alert.type}-${alert.title}-${index}`}
              label={t(`alerts.${alert.title}` as never, alert.translationParams)}
              status={alert.type}
              onDismiss={alert.onDismiss}
            >
              {typeof alert.content === 'string'
                ? t(`alerts.${alert.content}` as never)
                : (alert.content ?? null)}
            </Alert>
          ))}
        </Flex>
      )}

      <Flex
        flexDirection={{
          base: 'column',
          small: 'row',
        }}
        gap={16}
        alignItems={{
          base: 'stretch',
          small: 'flex-end',
        }}
        justifyContent="space-between"
      >
        <Heading as="h2">{t('subtitle')}</Heading>
        <div className={styles.actionsContainer}>
          <Select
            id="date-range-select"
            value={numberOfMonths.toString()}
            onChange={value => {
              onDateRangeChange(Number(value))
            }}
            options={dateRangeOptions}
            isRequired
            label={t('startDate')}
            shouldVisuallyHideLabel
          />
          <Button onClick={onCreatePayment} variant="secondary" className={styles.nowrap}>
            {t('createPaymentCta')}
          </Button>
        </div>
      </Flex>

      <DataView label={t('subtitle')} {...dataViewProps} />
    </Flex>
  )
}
