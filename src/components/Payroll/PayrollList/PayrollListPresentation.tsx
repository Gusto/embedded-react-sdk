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
import { DataView, Flex, HamburgerMenu } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import FeatureIconCheck from '@/assets/icons/feature-icon-check.svg?react'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

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
  const { Button, Dialog, Heading, Text, Alert } = useComponentContext()
  useI18n('Payroll.PayrollList')
  const { t } = useTranslation('Payroll.PayrollList')
  const dateFormatter = useDateFormatter()
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')
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
            {
              title: '',
              align: 'right',
              render: ({ payrollUuid, calculatedAt, processed, payPeriod }) => {
                if (processed) {
                  return null
                }

                const isProcessingSkipPayroll = skippingPayrollId === payrollUuid

                const button = calculatedAt ? (
                  <Button
                    isLoading={isProcessingSkipPayroll}
                    onClick={() => {
                      onSubmitPayroll({ payrollUuid, payPeriod })
                    }}
                    title={t('submitPayrollCta')}
                    variant="secondary"
                  >
                    {t('submitPayrollCta')}
                  </Button>
                ) : (
                  <Button
                    isLoading={isProcessingSkipPayroll}
                    onClick={() => {
                      onRunPayroll({ payrollUuid, payPeriod })
                    }}
                    title={t('runPayrollTitle')}
                    variant="secondary"
                  >
                    {t('runPayrollTitle')}
                  </Button>
                )

                return isDesktop ? (
                  button
                ) : (
                  <Flex flexDirection="column" alignItems="stretch" gap={12}>
                    {button}
                  </Flex>
                )
              },
            },
          ]}
          label={t('payrollsListLabel')}
          itemMenu={({ payrollUuid, processed, payPeriod }) => {
            if (processed) {
              return null
            }

            const isProcessingSkipPayroll = skippingPayrollId === payrollUuid

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

            return (
              <HamburgerMenu
                isLoading={isProcessingSkipPayroll}
                menuLabel={t('payrollMenuLabel')}
                items={[
                  {
                    label: t('skipPayrollCta'),
                    onClick: () => {
                      handleOpenSkipDialog(payrollUuid!, payPeriodString)
                    },
                  },
                ]}
              />
            )
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
