import { useTranslation } from 'react-i18next'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { PayrollStatusBadges } from '../PayrollStatusBadges'
import { getPayrollType, calculateTotalPayroll, canCancelPayroll } from '../helpers'
import type { TimeFilterOption } from './PayrollHistory'
import styles from './PayrollHistoryPresentation.module.scss'
import type { MenuItem } from '@/components/Common/UI/Menu/MenuTypes'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import TrashcanIcon from '@/assets/icons/trashcan.svg?react'
import FileIcon from '@/assets/icons/icon-file-outline.svg?react'
import ReceiptIcon from '@/assets/icons/icon-receipt-outline.svg?react'

interface PayrollHistoryPresentationProps {
  payrollHistory: Payroll[]
  wireInRequests: WireInRequest[]
  selectedTimeFilter: TimeFilterOption
  onTimeFilterChange: (value: TimeFilterOption) => void
  onViewSummary: (payrollId: string, startDate?: string, endDate?: string) => void
  onViewReceipt: (payrollId: string, startDate?: string, endDate?: string) => void
  onCancelPayroll: (item: Payroll) => void
  cancelDialogItem: Payroll | null
  onCancelDialogOpen: (item: Payroll) => void
  onCancelDialogClose: () => void
  isLoading?: boolean
}

export const PayrollHistoryPresentation = ({
  payrollHistory,
  wireInRequests,
  selectedTimeFilter,
  onTimeFilterChange,
  onViewSummary,
  onViewReceipt,
  onCancelPayroll,
  cancelDialogItem,
  onCancelDialogOpen,
  onCancelDialogClose,
  isLoading = false,
}: PayrollHistoryPresentationProps) => {
  const { Heading, Text, Select, Dialog } = useComponentContext()
  useI18n('Payroll.PayrollHistory')
  const { t } = useTranslation('Payroll.PayrollHistory')
  const dateFormatter = useDateFormatter()

  const timeFilterOptions = [
    { value: '3months', label: t('timeFilter.options.3months') },
    { value: '6months', label: t('timeFilter.options.6months') },
    { value: 'year', label: t('timeFilter.options.year') },
  ]

  const formatDeadlineForDialog = (item: Payroll): string => {
    const deadline = item.payrollDeadline
    if (!deadline) return ''

    const deadlineDate = new Date(deadline)
    const timeZone = 'America/New_York'

    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone,
    })

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone,
    })

    const dateStr = formatter.format(deadlineDate)
    const timeStr = timeFormatter.format(deadlineDate)

    return `${timeStr} on ${dateStr}`
  }

  const handleCancelClick = (item: Payroll) => {
    onCancelDialogOpen(item)
  }

  const handleConfirmCancel = () => {
    if (cancelDialogItem) {
      onCancelPayroll(cancelDialogItem)
    }
  }

  const getMenuItems = (item: Payroll): MenuItem[] => {
    const payrollId = item.payrollUuid || item.uuid!
    const items: MenuItem[] = [
      {
        label: t('menu.viewSummary'),
        icon: <FileIcon aria-hidden />,
        onClick: () => {
          onViewSummary(payrollId, item.payPeriod?.startDate, item.payPeriod?.endDate)
        },
      },
      {
        label: t('menu.viewReceipt'),
        icon: <ReceiptIcon aria-hidden />,
        onClick: () => {
          onViewReceipt(payrollId, item.payPeriod?.startDate, item.payPeriod?.endDate)
        },
      },
    ]

    if (canCancelPayroll(item)) {
      items.push({
        label: t('menu.cancelPayroll'),
        icon: <TrashcanIcon aria-hidden />,
        onClick: () => {
          handleCancelClick(item)
        },
        'data-destructive': 'true',
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
            render: (item: Payroll) =>
              dateFormatter.formatPayPeriodRange(
                item.payPeriod?.startDate,
                item.payPeriod?.endDate,
              ),
          },
          {
            title: t('columns.type'),
            render: (item: Payroll) => getPayrollType(item),
          },
          {
            title: t('columns.payDate'),
            render: (item: Payroll) => dateFormatter.formatShortWithYear(item.checkDate),
          },
          {
            title: t('columns.status'),
            render: (item: Payroll) => {
              const wireInRequest = wireInRequests.find(
                wire => wire.paymentUuid === item.payrollUuid,
              )
              return <PayrollStatusBadges payroll={item} wireInRequest={wireInRequest} />
            },
          },
          {
            title: t('columns.totalPayroll'),
            render: (item: Payroll) => formatNumberAsCurrency(calculateTotalPayroll(item)),
          },
        ]}
        data={payrollHistory}
        itemMenu={(item: Payroll) => <HamburgerMenu items={getMenuItems(item)} />}
      />

      <Dialog
        isOpen={!!cancelDialogItem}
        onClose={onCancelDialogClose}
        onPrimaryActionClick={handleConfirmCancel}
        isDestructive
        isPrimaryActionLoading={isLoading}
        primaryActionLabel={t('cancelDialog.primaryAction')}
        closeActionLabel={t('cancelDialog.secondaryAction')}
        title={
          cancelDialogItem
            ? t('cancelDialog.title', {
                payPeriod: dateFormatter.formatPayPeriodRange(
                  cancelDialogItem.payPeriod?.startDate,
                  cancelDialogItem.payPeriod?.endDate,
                ),
              })
            : ''
        }
      >
        {cancelDialogItem && (
          <Flex flexDirection="column" gap={16}>
            <Text>{t('cancelDialog.body')}</Text>
            {cancelDialogItem.payrollDeadline && (
              <Text>
                {t('cancelDialog.deadline', {
                  deadline: formatDeadlineForDialog(cancelDialogItem),
                })}
              </Text>
            )}
          </Flex>
        )}
      </Dialog>
    </Flex>
  )
}
