import { useTranslation } from 'react-i18next'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'

export interface PayrollHistoryItem {
  id: string
  payPeriod: string
  type: 'Regular' | 'Off-cycle' | 'Dismissal'
  payDate: string
  status: 'Unprocessed' | 'Submitted' | 'Pending' | 'Paid' | 'Complete' | 'In progress'
  amount?: number
}

interface PayrollHistoryPresentationProps {
  payrollHistory: PayrollHistoryItem[]
  selectedTimeFilter: string
  onTimeFilterChange: (value: string) => void
  onViewSummary: (payrollId: string) => void
  onViewReceipt: (payrollId: string) => void
  onCancelPayroll: (payrollId: string) => void
}

const timeFilterOptions = [
  { value: '3months', label: '3 months' },
  { value: '6months', label: '6 months' },
  { value: 'year', label: 'Year' },
]

const getStatusVariant = (status: PayrollHistoryItem['status']) => {
  switch (status) {
    case 'Complete':
    case 'Paid':
      return 'success'
    case 'In progress':
    case 'Unprocessed':
      return 'warning'
    case 'Submitted':
    case 'Pending':
      return 'info'
    default:
      return 'info'
  }
}

export const PayrollHistoryPresentation = ({
  payrollHistory,
  selectedTimeFilter,
  onTimeFilterChange,
  onViewSummary,
  onViewReceipt,
  onCancelPayroll,
}: PayrollHistoryPresentationProps) => {
  const { Heading, Text, Badge, Select } = useComponentContext()
  useI18n('payroll.payrollhistory')
  const { t } = useTranslation('payroll.payrollhistory')

  const canCancelPayroll = (status: PayrollHistoryItem['status']) => {
    return status === 'Unprocessed' || status === 'Submitted'
  }

  const getMenuItems = (item: PayrollHistoryItem) => {
    const items = [
      {
        label: t('menu.viewSummary'),
        onClick: () => {
          onViewSummary(item.id)
        },
      },
      {
        label: t('menu.viewReceipt'),
        onClick: () => {
          onViewReceipt(item.id)
        },
      },
    ]

    if (canCancelPayroll(item.status)) {
      items.push({
        label: t('menu.cancelPayroll'),
        onClick: () => {
          onCancelPayroll(item.id)
        },
      })
    }

    return items
  }

  if (payrollHistory.length === 0) {
    return (
      <Flex flexDirection="column" alignItems="center" gap={24}>
        <Heading as="h3">{t('emptyState.title')}</Heading>
        <Text>{t('emptyState.description')}</Text>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={16}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h2">{t('title')}</Heading>
        <Select
          value={selectedTimeFilter}
          onChange={onTimeFilterChange}
          options={timeFilterOptions}
          label={t('timeFilter.placeholder')}
          shouldVisuallyHideLabel
          isRequired
        />
      </Flex>

      <DataView
        label={t('dataView.label')}
        columns={[
          {
            title: t('columns.payPeriod'),
            render: (item: PayrollHistoryItem) => (
              <Flex flexDirection="column" gap="xs">
                <Text weight="semibold">{item.payPeriod}</Text>
                <Text size="sm">Engineering staff</Text>
              </Flex>
            ),
          },
          {
            title: t('columns.type'),
            render: (item: PayrollHistoryItem) => <Text>{item.type}</Text>,
          },
          {
            title: t('columns.payDate'),
            render: (item: PayrollHistoryItem) => <Text>{item.payDate}</Text>,
          },
          {
            title: t('columns.status'),
            render: (item: PayrollHistoryItem) => (
              <Badge status={getStatusVariant(item.status)}>{item.status}</Badge>
            ),
          },
          {
            title: t('columns.amount'),
            render: (item: PayrollHistoryItem) => (
              <Text weight="semibold">
                {item.amount ? formatNumberAsCurrency(item.amount) : '-'}
              </Text>
            ),
          },
          {
            title: '',
            render: (item: PayrollHistoryItem) => <HamburgerMenu items={getMenuItems(item)} />,
          },
        ]}
        data={payrollHistory}
      />
    </Flex>
  )
}
