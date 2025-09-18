import { useTranslation } from 'react-i18next'
import type { PayrollHistoryItem, PayrollHistoryStatus, TimeFilterOption } from './PayrollHistory'
import styles from './PayrollHistoryPresentation.module.scss'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
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
  useI18n('Payroll.PayrollHistory')
  const { t } = useTranslation('Payroll.PayrollHistory')

  const timeFilterOptions = [
    { value: '3months', label: t('timeFilter.options.3months') },
    { value: '6months', label: t('timeFilter.options.6months') },
    { value: 'year', label: t('timeFilter.options.year') },
  ]

  const canCancelPayroll = (item: PayrollHistoryItem) => {
    const { status, payroll } = item

    const hasValidStatus =
      status === 'Unprocessed' || status === 'Submitted' || status === 'In progress'
    if (!hasValidStatus) return false

    if (payroll.payrollStatusMeta?.cancellable === false) {
      return false
    }

    // If payroll is processed, check the 3:30 PM PT deadline constraint
    if (payroll.processed && payroll.payrollDeadline) {
      const now = new Date()
      const deadline = new Date(payroll.payrollDeadline)

      const ptOffset = getPacificTimeOffset(now)
      const nowInPT = new Date(now.getTime() + ptOffset * 60 * 60 * 1000)
      const deadlineInPT = new Date(
        deadline.getTime() + getPacificTimeOffset(deadline) * 60 * 60 * 1000,
      )

      const isSameDay = nowInPT.toDateString() === deadlineInPT.toDateString()
      if (isSameDay) {
        const cutoffTime = new Date(deadlineInPT)
        cutoffTime.setHours(15, 30, 0, 0)

        if (nowInPT > cutoffTime) {
          return false
        }
      }
    }

    return true
  }

  const getPacificTimeOffset = (date: Date): number => {
    const year = date.getFullYear()

    const secondSundayMarch = new Date(year, 2, 1)
    secondSundayMarch.setDate(1 + (7 - secondSundayMarch.getDay()) + 7)

    const firstSundayNovember = new Date(year, 10, 1)
    firstSundayNovember.setDate(1 + ((7 - firstSundayNovember.getDay()) % 7))

    const isDST = date >= secondSundayMarch && date < firstSundayNovember
    return isDST ? -7 : -8
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

    if (canCancelPayroll(item)) {
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
        alignItems="flex-start"
        gap={{ base: 12, medium: 24 }}
      >
        <Flex>
          <Heading as="h2">{t('title')}</Heading>
        </Flex>
        <div className={styles.timeFilterContainer}>
          <Select
            value={selectedTimeFilter}
            onChange={(value: string) => {
              onTimeFilterChange(value as TimeFilterOption)
            }}
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
