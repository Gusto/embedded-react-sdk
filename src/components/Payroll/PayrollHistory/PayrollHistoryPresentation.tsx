import { useTranslation } from 'react-i18next'
import type { PayrollHistoryItem, PayrollHistoryStatus, TimeFilterOption } from './types'
import styles from './PayrollHistoryPresentation.module.scss'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import ListIcon from '@/assets/icons/list.svg?react'
import TrashcanIcon from '@/assets/icons/trashcan.svg?react'

interface PayrollHistoryPresentationProps {
  payrollHistory: PayrollHistoryItem[]
  selectedTimeFilter: TimeFilterOption
  onTimeFilterChange: (value: TimeFilterOption) => void
  onViewSummary: (payrollId: string) => void
  onViewReceipt: (payrollId: string) => void
  onCancelPayroll: (payrollId: string) => void
  isLoading?: boolean
}

const getStatusVariant = (status: PayrollHistoryStatus) => {
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
  isLoading = false,
}: PayrollHistoryPresentationProps) => {
  const { Heading, Text, Badge, Select } = useComponentContext()
  const { t } = useTranslation('Payroll.PayrollHistory')

  const timeFilterOptions = [
    { value: '3months', label: t('timeFilter.options.3months') },
    { value: '6months', label: t('timeFilter.options.6months') },
    { value: 'year', label: t('timeFilter.options.year') },
  ]

  const canCancelPayroll = (status: PayrollHistoryStatus) => {
    return status === 'Unprocessed' || status === 'Submitted' || status === 'In progress'
  }

  const getMenuItems = (item: PayrollHistoryItem) => {
    const items = [
      {
        label: t('menu.viewSummary'),
        icon: <ListIcon aria-hidden />,
        onClick: () => {
          onViewSummary(item.id)
        },
      },
      {
        label: t('menu.viewReceipt'),
        icon: <ListIcon aria-hidden />,
        onClick: () => {
          onViewReceipt(item.id)
        },
      },
    ]

    if (canCancelPayroll(item.status)) {
      items.push({
        label: t('menu.cancelPayroll'),
        icon: <TrashcanIcon aria-hidden />,
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
      <Flex
        flexDirection={{ base: 'column', medium: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', medium: 'center' }}
        gap={{ base: 12, medium: 24 }}
      >
        <Heading as="h2">{t('title')}</Heading>
        <div className={styles.timeFilterContainer}>
          <Select
            value={selectedTimeFilter}
            onChange={onTimeFilterChange as (value: string) => void}
            options={timeFilterOptions}
            label={t('timeFilter.placeholder')}
            shouldVisuallyHideLabel
            isRequired
          />
        </div>
      </Flex>

      <DataView
        label={t('dataView.label')}
        columns={[
          {
            title: t('columns.payPeriod'),
            render: (item: PayrollHistoryItem) => <Text>{item.payPeriod}</Text>,
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
                {item.amount ? formatNumberAsCurrency(item.amount) : t('labels.noAmount')}
              </Text>
            ),
          },
        ]}
        data={payrollHistory}
        itemMenu={(item: PayrollHistoryItem) => <HamburgerMenu items={getMenuItems(item)} />}
      />
    </Flex>
  )
}
