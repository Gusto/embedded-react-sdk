import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'
import { useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface TransitionPayPeriodGroup {
  payScheduleUuid: string
  payScheduleName: string
  payPeriods: PayPeriod[]
}

interface TransitionPayrollAlertPresentationProps {
  groupedPayPeriods: TransitionPayPeriodGroup[]
  onRunPayroll: (payPeriod: PayPeriod) => void
  onSkipPayroll: (payPeriod: PayPeriod) => void
  showSkipSuccessAlert: boolean
  onDismissSkipSuccessAlert: () => void
  skippingPayPeriod: PayPeriod | null
}

export function TransitionPayrollAlertPresentation({
  groupedPayPeriods,
  onRunPayroll,
  onSkipPayroll,
  showSkipSuccessAlert,
  onDismissSkipSuccessAlert,
  skippingPayPeriod,
}: TransitionPayrollAlertPresentationProps) {
  useI18n('Payroll.TransitionPayrollAlert')
  const { t } = useTranslation('Payroll.TransitionPayrollAlert')
  const { Alert, Button, Text, Dialog } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const [skipDialogPayPeriod, setSkipDialogPayPeriod] = useState<PayPeriod | null>(null)

  if (groupedPayPeriods.length === 0) {
    return null
  }

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

  const hasMultipleGroups = groupedPayPeriods.length > 1

  return (
    <Flex flexDirection="column" gap={16}>
      {showSkipSuccessAlert && (
        <Alert status="info" label={t('skipSuccessAlert')} onDismiss={onDismissSkipSuccessAlert} />
      )}
      {groupedPayPeriods.map((group, groupIndex) => (
        <Flex key={group.payScheduleUuid || `group-${groupIndex}`} flexDirection="column" gap={16}>
          {hasMultipleGroups && <Text weight="semibold">{group.payScheduleName}</Text>}
          {group.payPeriods.map(payPeriod => {
            const dateRange = formatDateRange(payPeriod)
            const isSkipping = skippingPayPeriod === payPeriod

            return (
              <Alert
                key={`${payPeriod.payScheduleUuid}-${payPeriod.startDate}`}
                status="warning"
                label={t('alertTitle', { dateRange })}
              >
                <Flex flexDirection="column" gap={16}>
                  <Text>{t('alertDescription')}</Text>
                  <Flex gap={12} alignItems="center">
                    <div>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          onRunPayroll(payPeriod)
                        }}
                      >
                        {t('runPayroll')}
                      </Button>
                    </div>
                    <Button
                      variant="tertiary"
                      onClick={() => {
                        setSkipDialogPayPeriod(payPeriod)
                      }}
                      isLoading={isSkipping}
                    >
                      {t('skipPayroll')}
                    </Button>
                  </Flex>
                </Flex>
              </Alert>
            )
          })}
        </Flex>
      ))}
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
