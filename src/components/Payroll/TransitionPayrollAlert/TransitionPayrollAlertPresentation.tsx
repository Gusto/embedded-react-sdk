import { Fragment, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import styles from './TransitionPayrollAlertPresentation.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, FlexItem } from '@/components/Common/Flex/Flex'
import { useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'

/** @internal */
export interface TransitionPayPeriodGroup {
  /** UUID of the pay schedule these transition pay periods belong to. */
  payScheduleUuid: string
  /** Display name of the pay schedule, shown under each pay period's dates when several are listed. */
  payScheduleName: string
  /** Unprocessed transition pay periods for this pay schedule. */
  payPeriods: PayPeriod[]
}

interface TransitionPayrollAlertPresentationProps {
  groupedPayPeriods: TransitionPayPeriodGroup[]
  /** UUIDs of transition payrolls that are already calculated. Their rows offer Review and submit instead of Run. */
  calculatedPayrollUuids?: string[]
  /** Called when the user clicks Run, or Review and submit, on a row. */
  onRunPayroll: (payPeriod: PayPeriod) => void
  onSkipPayroll: (payPeriod: PayPeriod) => void
  showSkipSuccessAlert: boolean
  onDismissSkipSuccessAlert: () => void
  skippingPayPeriod: PayPeriod | null
  /**
   * When true, a payroll blocker is present. Running or skipping the
   * transition payroll would dead-end, so both actions are disabled. The
   * blocker itself is surfaced separately by `PayrollBlockerAlerts`.
   */
  hasBlockers?: boolean
}

interface TransitionPayrollActionsProps {
  onRun: () => void
  isCalculated: boolean
  onSkip: () => void
  isSkipping: boolean
  isDisabled: boolean
  describedBy?: string
}

function TransitionPayrollActions({
  onRun,
  isCalculated,
  onSkip,
  isSkipping,
  isDisabled,
  describedBy,
}: TransitionPayrollActionsProps) {
  const { t } = useTranslation('Payroll.TransitionPayrollAlert')
  const { Button } = useComponentContext()

  return (
    <>
      <div>
        <Button
          variant="secondary"
          onClick={onRun}
          isDisabled={isDisabled}
          aria-describedby={describedBy}
        >
          {isCalculated ? t('reviewPayroll') : t('runPayroll')}
        </Button>
      </div>
      <Button
        variant="tertiary"
        onClick={onSkip}
        isLoading={isSkipping}
        isDisabled={isDisabled}
        aria-describedby={describedBy}
      >
        {t('skipPayroll')}
      </Button>
    </>
  )
}

interface TransitionPayrollRowProps extends Omit<TransitionPayrollActionsProps, 'describedBy'> {
  dateRange: string
  payScheduleName: string
}

function TransitionPayrollRow({
  dateRange,
  payScheduleName,
  ...actionProps
}: TransitionPayrollRowProps) {
  const { Text } = useComponentContext()
  const dateRangeId = useId()
  const payScheduleNameId = useId()

  return (
    <Flex alignItems="center" flexWrap="wrap" gap={12}>
      <FlexItem flexGrow={1}>
        <Flex flexDirection="column" gap={4}>
          <Text id={dateRangeId} weight="medium">
            {dateRange}
          </Text>
          <Text id={payScheduleNameId} variant="supporting" size="sm">
            {payScheduleName}
          </Text>
        </Flex>
      </FlexItem>
      <TransitionPayrollActions
        {...actionProps}
        describedBy={`${dateRangeId} ${payScheduleNameId}`}
      />
    </Flex>
  )
}

/** @internal */
export function TransitionPayrollAlertPresentation({
  groupedPayPeriods,
  calculatedPayrollUuids = [],
  onRunPayroll,
  onSkipPayroll,
  showSkipSuccessAlert,
  onDismissSkipSuccessAlert,
  skippingPayPeriod,
  hasBlockers = false,
}: TransitionPayrollAlertPresentationProps) {
  useI18n('Payroll.TransitionPayrollAlert')
  const { t } = useTranslation('Payroll.TransitionPayrollAlert')
  const { Alert, Text, Dialog } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const [skipDialogPayPeriod, setSkipDialogPayPeriod] = useState<PayPeriod | null>(null)

  const listedPayPeriods = groupedPayPeriods.flatMap(group =>
    group.payPeriods.map(payPeriod => ({ payPeriod, payScheduleName: group.payScheduleName })),
  )
  const [firstListedPayPeriod] = listedPayPeriods

  if (!firstListedPayPeriod) {
    return null
  }

  const firstPayPeriod = firstListedPayPeriod.payPeriod

  const formatDateRange = (payPeriod: PayPeriod) =>
    dateFormatter.formatPayPeriodRange(payPeriod.startDate, payPeriod.endDate, {
      useShortMonth: true,
    })

  const handleConfirmSkip = () => {
    if (skipDialogPayPeriod) {
      onSkipPayroll(skipDialogPayPeriod)
      setSkipDialogPayPeriod(null)
    }
  }

  const getActionProps = (payPeriod: PayPeriod) => {
    const payrollUuid = payPeriod.payroll?.payrollUuid

    return {
      onRun: () => {
        onRunPayroll(payPeriod)
      },
      isCalculated: !!payrollUuid && calculatedPayrollUuids.includes(payrollUuid),
      onSkip: () => {
        setSkipDialogPayPeriod(payPeriod)
      },
      isSkipping: skippingPayPeriod === payPeriod,
      isDisabled: hasBlockers,
    }
  }

  const getPayPeriodKey = (payPeriod: PayPeriod) =>
    payPeriod.payroll?.payrollUuid ?? `${payPeriod.payScheduleUuid}-${payPeriod.startDate}`

  const hasMultiplePayPeriods = listedPayPeriods.length > 1

  return (
    <Flex flexDirection="column" gap={16}>
      {showSkipSuccessAlert && (
        <Alert status="info" label={t('skipSuccessAlert')} onDismiss={onDismissSkipSuccessAlert} />
      )}
      <Alert
        status="warning"
        label={
          hasMultiplePayPeriods
            ? t('multipleAlertTitle', { count: listedPayPeriods.length })
            : t('alertTitle', { dateRange: formatDateRange(firstPayPeriod) })
        }
      >
        <Flex flexDirection="column" gap={16}>
          <Text>{t('alertDescription')}</Text>
          {hasMultiplePayPeriods ? (
            <Flex flexDirection="column" gap={16}>
              {listedPayPeriods.map(({ payPeriod, payScheduleName }, index) => (
                <Fragment key={getPayPeriodKey(payPeriod)}>
                  {index > 0 && <hr className={styles.divider} />}
                  <TransitionPayrollRow
                    dateRange={formatDateRange(payPeriod)}
                    payScheduleName={payScheduleName}
                    {...getActionProps(payPeriod)}
                  />
                </Fragment>
              ))}
            </Flex>
          ) : (
            <Flex gap={12} alignItems="center">
              <TransitionPayrollActions {...getActionProps(firstPayPeriod)} />
            </Flex>
          )}
        </Flex>
      </Alert>
      <Dialog
        isOpen={skipDialogPayPeriod !== null}
        onClose={() => {
          setSkipDialogPayPeriod(null)
        }}
        onPrimaryActionClick={handleConfirmSkip}
        isDestructive
        title={t('skipDialog.title', {
          dateRange: skipDialogPayPeriod ? formatDateRange(skipDialogPayPeriod) : '',
        })}
        primaryActionLabel={t('skipDialog.confirmCta')}
        closeActionLabel={t('skipDialog.cancelCta')}
      >
        {t('skipDialog.body')}
      </Dialog>
    </Flex>
  )
}
