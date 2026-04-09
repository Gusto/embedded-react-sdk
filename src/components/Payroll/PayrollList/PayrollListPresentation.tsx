import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollStatusBadges } from '../PayrollStatusBadges'
import { getPayrollTypeLabel } from '../helpers'
import styles from './PayrollListPresentation.module.scss'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { DataView, Flex, HamburgerMenu, DateRangeFilter } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { UseDateRangeFilterResult } from '@/hooks/useDateRangeFilter/useDateRangeFilter'
import { useI18n } from '@/i18n'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import FeatureIconCheck from '@/assets/icons/feature-icon-check.svg?react'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

const CANCELLABLE_OFF_CYCLE_REASONS = new Set<string>([
  OffCycleReasonType.Bonus,
  OffCycleReasonType.Correction,
  OffCycleReasonType.DismissedEmployee,
])

function hasKebabActions(
  payroll: Payroll,
  blockers: ApiPayrollBlocker[],
  todayAtMidnight: Date | null,
): boolean {
  if (payroll.processed) return false

  const payPeriodStartDate = payroll.payPeriod?.startDate
    ? new Date(payroll.payPeriod.startDate)
    : null

  const isSkippablePayroll =
    !payroll.offCycle || payroll.offCycleReason === OffCycleReasonType.TransitionFromOldPaySchedule

  const canSkipPayroll =
    blockers.length === 0 &&
    isSkippablePayroll &&
    todayAtMidnight &&
    payPeriodStartDate &&
    todayAtMidnight >= payPeriodStartDate

  const canDeletePayroll =
    payroll.offCycle &&
    !!payroll.offCycleReason &&
    CANCELLABLE_OFF_CYCLE_REASONS.has(payroll.offCycleReason)

  return !!(canSkipPayroll || canDeletePayroll)
}

interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => void
  onSubmitPayroll: ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => void
  onSkipPayroll: ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => void
  onDeletePayroll: ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => void
  onRunOffCyclePayroll: () => void
  payrolls: Payroll[]
  pagination?: PaginationControlProps
  paySchedules: PayScheduleList[]
  showSkipSuccessAlert: boolean
  onDismissSkipSuccessAlert: () => void
  showDeleteSuccessAlert: boolean
  onDismissDeleteSuccessAlert: () => void
  skippingPayrollId: string | null
  deletingPayrollId: string | null
  blockers: ApiPayrollBlocker[]
  wireInRequests: WireInRequest[]
  dateRangeFilter: UseDateRangeFilterResult
}

export const PayrollListPresentation = ({
  onRunPayroll,
  onSubmitPayroll,
  onSkipPayroll,
  onDeletePayroll,
  onRunOffCyclePayroll,
  payrolls,
  pagination,
  paySchedules,
  showSkipSuccessAlert,
  onDismissSkipSuccessAlert,
  showDeleteSuccessAlert,
  onDismissDeleteSuccessAlert,
  skippingPayrollId,
  deletingPayrollId,
  blockers,
  wireInRequests,
  dateRangeFilter,
}: PayrollListPresentationProps) => {
  const { Box, Button, ButtonIcon, Dialog, Heading, Text, Alert } = useComponentContext()
  useI18n('Payroll.PayrollList')
  const { t } = useTranslation('Payroll.PayrollList')
  const dateFormatter = useDateFormatter()
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('large')

  const todayAtMidnight = useMemo(() => {
    const todayDateString = formatDateToStringDate(new Date())
    return todayDateString ? new Date(todayDateString) : null
  }, [])

  const anyPayrollHasKebabActions = useMemo(
    () => payrolls.some(payroll => hasKebabActions(payroll, blockers, todayAtMidnight)),
    [payrolls, blockers, todayAtMidnight],
  )

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

  const [deletePayrollDialogState, setDeletePayrollDialogState] = useState<{
    isOpen: boolean
    payrollId: string | null
    payPeriod: string | null
  }>({
    isOpen: false,
    payrollId: null,
    payPeriod: null,
  })

  const handleOpenDeleteDialog = (payrollId: string, payPeriod: string) => {
    setDeletePayrollDialogState({
      isOpen: true,
      payrollId,
      payPeriod,
    })
  }

  const handleCloseDeleteDialog = () => {
    setDeletePayrollDialogState({
      isOpen: false,
      payrollId: null,
      payPeriod: null,
    })
  }

  const handleConfirmDeletePayroll = () => {
    if (deletePayrollDialogState.payrollId) {
      onDeletePayroll({ payrollUuid: deletePayrollDialogState.payrollId })
      handleCloseDeleteDialog()
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

  const renderActionButton = (payroll: Payroll) => {
    const { payrollUuid, calculatedAt, processed, payPeriod } = payroll

    if (processed) {
      return null
    }

    const isProcessingSkipPayroll = skippingPayrollId === payrollUuid

    return calculatedAt ? (
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
        {showDeleteSuccessAlert && (
          <div className={styles.alertContainer}>
            <Alert
              status="info"
              label={t('deleteSuccessAlert')}
              onDismiss={onDismissDeleteSuccessAlert}
            />
          </div>
        )}
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h2">{t('title')}</Heading>
          <DateRangeFilter
            startDate={dateRangeFilter.filterStartDate}
            endDate={dateRangeFilter.filterEndDate}
            onStartDateChange={dateRangeFilter.handleStartDateChange}
            onEndDateChange={dateRangeFilter.handleEndDateChange}
            onClear={dateRangeFilter.handleClearFilter}
            startDateLabel={t('dateFilter.startDate')}
            endDateLabel={t('dateFilter.endDate')}
            applyLabel={t('dateFilter.apply')}
            cancelLabel={t('dateFilter.cancel')}
            resetLabel={t('dateFilter.reset')}
            selectDatesLabel={t('dateFilter.selectDates')}
            triggerLabel={t('dateFilter.trigger')}
            isFilterActive={dateRangeFilter.isFilterActive}
            maxEndDate={dateRangeFilter.getMaxEndDate()}
            minStartDate={dateRangeFilter.getMinStartDate()}
          />
        </Flex>

        <DataView
          breakAt="large"
          pagination={pagination}
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

                return (
                  <div className={styles.payPeriodCell}>
                    {startDate} - {endDate}
                    <Text variant="supporting" size="sm">
                      {paySchedules.find(schedule => schedule.uuid === payPeriod?.payScheduleUuid)
                        ?.name ||
                        paySchedules.find(schedule => schedule.uuid === payPeriod?.payScheduleUuid)
                          ?.customName}
                    </Text>
                  </div>
                )
              },
              title: t('tableHeaders.0'),
            },
            {
              render: payroll => <Text>{getPayrollTypeLabel(payroll)}</Text>,
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
            ...(!isDesktop
              ? [
                  {
                    title: '',
                    render: (payroll: Payroll) => {
                      const button = renderActionButton(payroll)
                      if (!button) return null
                      return (
                        <Flex flexDirection="column" alignItems="stretch" gap={12}>
                          {button}
                        </Flex>
                      )
                    },
                  },
                ]
              : []),
          ]}
          label={t('payrollsListLabel')}
          itemMenu={payroll => {
            const { payrollUuid, processed, payPeriod } = payroll

            const isProcessingSkipPayroll = skippingPayrollId === payrollUuid
            const isProcessingDeletePayroll = deletingPayrollId === payrollUuid

            const button = isDesktop ? renderActionButton(payroll) : null

            if (processed) {
              return (
                <div className={styles.actionsContainer}>
                  {anyPayrollHasKebabActions && (
                    <ButtonIcon
                      aria-label=""
                      aria-hidden={true}
                      tabIndex={-1}
                      isDisabled={true}
                      className={styles.menuPlaceholder}
                    />
                  )}
                </div>
              )
            }

            const { fullPeriod: payPeriodString } = formatPayPeriod(
              payPeriod?.startDate,
              payPeriod?.endDate,
            )

            const payPeriodStartDate = payPeriod?.startDate ? new Date(payPeriod.startDate) : null

            const isSkippablePayroll =
              !payroll.offCycle ||
              payroll.offCycleReason === OffCycleReasonType.TransitionFromOldPaySchedule

            const canSkipPayroll =
              blockers.length === 0 &&
              isSkippablePayroll &&
              todayAtMidnight &&
              payPeriodStartDate &&
              todayAtMidnight >= payPeriodStartDate

            const canDeletePayroll =
              payroll.offCycle &&
              !!payroll.offCycleReason &&
              CANCELLABLE_OFF_CYCLE_REASONS.has(payroll.offCycleReason)

            const menuItems = canSkipPayroll
              ? [
                  {
                    label: t('skipPayrollCta'),
                    onClick: () => {
                      handleOpenSkipDialog(payrollUuid!, payPeriodString)
                    },
                  },
                ]
              : canDeletePayroll
                ? [
                    {
                      label: t('deletePayrollCta'),
                      onClick: () => {
                        handleOpenDeleteDialog(payrollUuid!, payPeriodString)
                      },
                    },
                  ]
                : null

            const hasMenuActions = menuItems !== null

            return (
              <div className={styles.actionsContainer}>
                {button}
                {hasMenuActions ? (
                  <HamburgerMenu
                    isLoading={canSkipPayroll ? isProcessingSkipPayroll : isProcessingDeletePayroll}
                    menuLabel={t('payrollMenuLabel')}
                    items={menuItems}
                  />
                ) : (
                  anyPayrollHasKebabActions && (
                    <ButtonIcon
                      aria-label=""
                      aria-hidden={true}
                      tabIndex={-1}
                      isDisabled={true}
                      className={styles.menuPlaceholder}
                    />
                  )
                )}
              </div>
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
        <Dialog
          isOpen={deletePayrollDialogState.isOpen}
          onClose={handleCloseDeleteDialog}
          onPrimaryActionClick={handleConfirmDeletePayroll}
          isDestructive={true}
          title={t('deletePayrollDialog.title', {
            payPeriod: deletePayrollDialogState.payPeriod,
          })}
          primaryActionLabel={t('deletePayrollDialog.confirmCta')}
          closeActionLabel={t('deletePayrollDialog.cancelCta')}
        >
          {t('deletePayrollDialog.body')}
        </Dialog>
        <Box className={styles.offCycleCta}>
          <Flex
            flexDirection={{ base: 'column', medium: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'stretch', medium: 'center' }}
            gap={16}
          >
            <Flex flexDirection="column" gap={4}>
              <Text weight="bold">{t('offCycleCta.title')}</Text>
              <Text variant="supporting" size="sm">
                {t('offCycleCta.description')}
              </Text>
            </Flex>
            <div className={styles.offCycleCtaButton}>
              <Button variant="secondary" onClick={onRunOffCyclePayroll}>
                {t('offCycleCta.button')}
              </Button>
            </div>
          </Flex>
        </Box>
      </Flex>
    </div>
  )
}
