import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollBlockerAlerts } from '../PayrollBlocker/components/PayrollBlockerAlerts'
import { PayrollStatusBadges } from '../PayrollStatusBadges'
import { getPayrollType } from '../helpers'
import styles from './PayrollListPresentation.module.scss'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import FeatureIconCheck from '@/assets/icons/feature-icon-check.svg?react'
import type { DataViewMenuAction } from '@/components/Common/DataView/useDataView'

interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => void
  onSubmitPayroll: ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => void
  onSkipPayroll: ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => void
  onViewBlockers?: () => void
  payrolls: Payroll[]
  paySchedules: PayScheduleList[]
  showSkipSuccessAlert: boolean
  onDismissSkipSuccessAlert: () => void
  skippingPayrollId: string | null
  blockers: ApiPayrollBlocker[]
  wireInRequests: WireInRequest[]
}

export const PayrollListPresentation = ({
  onRunPayroll,
  onSubmitPayroll,
  onSkipPayroll,
  onViewBlockers,
  payrolls,
  paySchedules,
  showSkipSuccessAlert,
  onDismissSkipSuccessAlert,
  skippingPayrollId,
  blockers,
  wireInRequests,
}: PayrollListPresentationProps) => {
  const { Dialog, Heading, Text, Alert } = useComponentContext()
  useI18n('Payroll.PayrollList')
  const { t } = useTranslation('Payroll.PayrollList')
  const dateFormatter = useDateFormatter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [skipPayrollDialogState, setSkipPayrollDialogState] = useState<{
    isOpen: boolean
    payrollId: string | null
    payPeriod: string | null
  }>({
    isOpen: false,
    payrollId: null,
    payPeriod: null,
  })

  const handleOpenSkipDialog = (payrollId: string, payPeriod: string) => {
    setSkipPayrollDialogState({
      isOpen: true,
      payrollId,
      payPeriod,
    })
  }

  const handleCloseSkipDialog = () => {
    setSkipPayrollDialogState({
      isOpen: false,
      payrollId: null,
      payPeriod: null,
    })
  }

  const handleConfirmSkipPayroll = () => {
    if (skipPayrollDialogState.payrollId) {
      onSkipPayroll({ payrollUuid: skipPayrollDialogState.payrollId })
      handleCloseSkipDialog()
    }
  }

  const formatPayPeriod = (startDate: string | undefined, endDate: string | undefined) => {
    const formattedStartDate = dateFormatter.formatShort(startDate)
    const formattedEndDate = dateFormatter.formatShortWithYear(endDate)

    return {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fullPeriod: dateFormatter.formatPayPeriodRange(startDate, endDate, { useShortMonth: true }),
    }
  }

  const buildSkipPayrollMenuAction = (
    payrollUuid: string,
    payPeriod: PresentationPayroll['payPeriod'],
    isProcessingSkipPayroll: boolean,
  ): DataViewMenuAction | null => {
    const { fullPeriod: payPeriodString } = formatPayPeriod(
      payPeriod?.startDate,
      payPeriod?.endDate,
    )

    const todayDateString = formatDateToStringDate(new Date())
    const todayAtMidnight = todayDateString ? new Date(todayDateString) : null
    const payPeriodStartDate = payPeriod?.startDate ? new Date(payPeriod.startDate) : null

    const canSkipPayroll =
      blockers.length === 0 &&
      todayAtMidnight &&
      payPeriodStartDate &&
      todayAtMidnight >= payPeriodStartDate

    if (!canSkipPayroll) {
      return null
    }

    return {
      type: 'menu',
      items: [
        {
          label: t('skipPayrollCta'),
          onClick: () => {
            handleOpenSkipDialog(payrollUuid, payPeriodString)
          },
        },
      ],
      menuLabel: t('payrollMenuLabel'),
      isLoading: isProcessingSkipPayroll,
    }
  }

  const payScheduleNames = useMemo(() => {
    return paySchedules.reduce<Record<string, string>>((acc, schedule) => {
      acc[schedule.uuid] = schedule.name || schedule.customName || ''
      return acc
    }, {})
  }, [paySchedules])

  const getPayScheduleDisplayName = (payScheduleUuid: string | null | undefined) => {
    if (!payScheduleUuid) return ''
    return payScheduleNames[payScheduleUuid] || ''
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <Flex flexDirection="column" gap={16}>
        {showSkipSuccessAlert && (
          <div className={styles.alertContainer}>
            <Alert
              status="info"
              label={t('skipSuccessAlert')}
              onDismiss={onDismissSkipSuccessAlert}
            />
          </div>
        )}
        <PayrollBlockerAlerts blockers={blockers} onMultipleViewClick={onViewBlockers} />
        <Flex
          flexDirection={{ base: 'column', medium: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
          gap={{ base: 12, medium: 24 }}
        >
          <Flex>
            <Heading as="h2">{t('title')}</Heading>
          </Flex>
        </Flex>

        <DataView
          emptyState={() => (
            <Flex flexDirection="column" alignItems="center" gap={24}>
              <FeatureIconCheck />
              <Text>{t('emptyState')}</Text>
            </Flex>
          )}
          data={payrolls}
          columns={[
            {
              render: ({ payPeriod }) => {
                const { startDate, endDate } = formatPayPeriod(
                  payPeriod?.startDate,
                  payPeriod?.endDate,
                )

                return `${startDate} - ${endDate}`
              },
              title: t('tableHeaders.0'),
              secondaryRender: ({ payPeriod }) =>
                getPayScheduleDisplayName(payPeriod?.payScheduleUuid),
            },
            {
              render: payroll => t(`type.${getPayrollType(payroll)}`),
              title: t('tableHeaders.1'),
            },
            {
              render: ({ checkDate }) => dateFormatter.formatShortWithWeekdayAndYear(checkDate),
              title: t('tableHeaders.2'),
            },
            {
              title: t('tableHeaders.3'),
              render: ({ payrollDeadline }) =>
                dateFormatter.formatShortWithWeekdayAndYear(payrollDeadline),
            },
            {
              title: t('tableHeaders.4'),
              render: payroll => {
                const wireInRequest = wireInRequests.find(
                  wire => wire.paymentUuid === payroll.payrollUuid,
                )
                return <PayrollStatusBadges payroll={payroll} wireInRequest={wireInRequest} />
              },
            },
          ]}
          label={t('payrollsListLabel')}
          rowActions={{
            header: '',
            align: 'right',
            buttons: (item: PresentationPayroll) => {
              if (item.processed || !item.payrollUuid) {
                return []
              }

              const isProcessingSkipPayroll = skippingPayrollId === item.payrollUuid
              return [
                {
                  type: 'button',
                  label: item.calculatedAt ? t('submitPayrollCta') : t('runPayrollTitle'),
                  onClick: () => {
                    if (item.calculatedAt) {
                      onSubmitPayroll({ payrollUuid: item.payrollUuid!, payPeriod: item.payPeriod })
                    } else {
                      onRunPayroll({ payrollUuid: item.payrollUuid!, payPeriod: item.payPeriod })
                    }
                  },
                  buttonProps: {
                    variant: 'secondary' as const,
                    isLoading: isProcessingSkipPayroll,
                  },
                },
              ]
            },
            menuItems: (item: PresentationPayroll) => {
              if (item.processed || !item.payrollUuid) {
                return null
              }

              return buildSkipPayrollMenuAction(
                item.payrollUuid,
                item.payPeriod,
                skippingPayrollId === item.payrollUuid,
              )
            },
          }}
        />
        <Dialog
          isOpen={skipPayrollDialogState.isOpen}
          onClose={handleCloseSkipDialog}
          onPrimaryActionClick={handleConfirmSkipPayroll}
          isDestructive={true}
          title={t('skipPayrollDialog.title', { payPeriod: skipPayrollDialogState.payPeriod })}
          primaryActionLabel={t('skipPayrollDialog.confirmCta')}
          closeActionLabel={t('skipPayrollDialog.cancelCta')}
        >
          {t('skipPayrollDialog.body')}
        </Dialog>
      </Flex>
    </div>
  )
}
