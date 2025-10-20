import { useTranslation } from 'react-i18next'
import styles from './PaymentHistoryPresentation.module.scss'
import { DataView, Flex, EmptyData, ActionsLayout, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface PaymentHistoryItem {
  paymentDate: string
  reimbursementTotal: number
  wageTotal: number
  contractorsCount: number
}

interface ContractorPaymentPaymentHistoryPresentationProps {
  paymentHistory: PaymentHistoryItem[]
  selectedDateRange: string
  onCreatePayment: () => void
  onDateRangeChange: (dateRange: string) => void
  onDateSelected: (date: string) => void
  showSuccessMessage: boolean
  bannerMessage?: string
  bannerType?: 'success' | 'error' | 'warning' | 'info'
}

export const PaymentHistoryPresentation = ({
  paymentHistory,
  selectedDateRange,
  onCreatePayment,
  onDateRangeChange,
  onDateSelected,
  showSuccessMessage,
  bannerMessage,
  bannerType = 'info',
}: ContractorPaymentPaymentHistoryPresentationProps) => {
  const { Button, Text, Alert, Heading, Select } = useComponentContext()
  useI18n('ContractorPayment.ContractorPaymentPaymentHistory')
  const { t } = useTranslation('ContractorPayment.ContractorPaymentPaymentHistory')

  const dateRangeOptions = [
    { value: 'Last 3 months', label: t('dateRanges.last3Months') },
    { value: 'Last 6 months', label: t('dateRanges.last6Months') },
    { value: 'Last 12 months', label: t('dateRanges.last12Months') },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const { ...dataViewProps } = useDataView({
    data: paymentHistory,
    columns: [
      {
        title: t('paymentDate'),
        render: ({ paymentDate }) => (
          <Button
            variant="tertiary"
            onClick={() => {
              onDateSelected(paymentDate)
            }}
          >
            {paymentDate}
          </Button>
        ),
      },
      {
        title: t('reimbursementTotal'),
        render: ({ reimbursementTotal }) => <Text>{formatCurrency(reimbursementTotal)}</Text>,
      },
      {
        title: t('wageTotal'),
        render: ({ wageTotal }) => <Text>{formatCurrency(wageTotal)}</Text>,
      },
      {
        title: t('contractors'),
        render: ({ contractorsCount }) => <Text>{contractorsCount}</Text>,
      },
    ],
    emptyState: () => (
      <EmptyData title={t('noPaymentsFound')} description={t('noPaymentsDescription')}>
        <ActionsLayout justifyContent="center">
          <Button variant="primary" onClick={onCreatePayment}>
            {t('createPayment')}
          </Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={16}>
        <Heading as="h1">{t('title')}</Heading>

        {showSuccessMessage && (
          <Alert status="success" label={t('title')}>
            ✓ {t('successMessage', { count: 2 })}
          </Alert>
        )}

        {bannerMessage && (
          <Alert status={bannerType} label={t('title')}>
            {bannerMessage}
          </Alert>
        )}
      </Flex>

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
            value={selectedDateRange}
            onChange={value => {
              onDateRangeChange(value)
            }}
            options={dateRangeOptions}
            isRequired
            label={t('startDate')}
            shouldVisuallyHideLabel
          />
          <Button onClick={onCreatePayment} variant="primary" className={styles.nowrap}>
            {t('createPayment')}
          </Button>
        </div>
      </Flex>

      <DataView label={t('subtitle')} {...dataViewProps} />
    </Flex>
  )
}
