import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollBlockerAlerts } from '../PayrollBlocker/components/PayrollBlockerAlerts'
import type { PayrollType } from './types'
import styles from './PayrollListPresentation.module.scss'
import { DataView, Flex, HamburgerMenu } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'
import { useLocale } from '@/contexts/LocaleProvider'
import FeatureIconCheck from '@/assets/icons/feature-icon-check.svg?react'

interface PresentationPayroll extends Payroll {
  payrollType: PayrollType
}

interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollId }: { payrollId: NonNullable<Payroll['payrollUuid']> }) => void
  onSubmitPayroll: ({ payrollId }: { payrollId: NonNullable<Payroll['payrollUuid']> }) => void
  onSkipPayroll: ({ payrollId }: { payrollId: NonNullable<Payroll['payrollUuid']> }) => void
  onViewBlockers?: () => void
  payrolls: PresentationPayroll[]
  paySchedules: PayScheduleList[]
  showSkipSuccessAlert: boolean
  onDismissSkipSuccessAlert: () => void
  skippingPayrollId: string | null
  blockers: ApiPayrollBlocker[]
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
}: PayrollListPresentationProps) => {
  const { Badge, Button, Dialog, Heading, Text, Alert } = useComponentContext()
  useI18n('Payroll.PayrollList')
  const { t } = useTranslation('Payroll.PayrollList')
  const { locale } = useLocale()
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
      onSkipPayroll({ payrollId: skipPayrollDialogState.payrollId })
      handleCloseSkipDialog()
    }
  }

  const formatPayPeriod = (startDate: string | undefined, endDate: string | undefined) => {
    const formattedStartDate = startDate
      ? parseDateStringToLocal(startDate)?.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
        })
      : null

    const formattedEndDate = endDate
      ? parseDateStringToLocal(endDate)?.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null

    return {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fullPeriod:
        formattedStartDate && formattedEndDate ? `${formattedStartDate} – ${formattedEndDate}` : '',
    }
  }

  return (
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
            <FeatureIconCheck className={styles.doneIcon} />
            <Text>{t('emptyState')}</Text>
          </Flex>
        )}
        columns={[
          {
            render: ({ payPeriod }) => {
              const { startDate, endDate } = formatPayPeriod(
                payPeriod?.startDate,
                payPeriod?.endDate,
              )

              return (
                <Flex flexDirection="column" gap={0}>
                  <Text>
                    {startDate} - {endDate}
                  </Text>
                  <Text variant="supporting">
                    {paySchedules.find(schedule => schedule.uuid === payPeriod?.payScheduleUuid)
                      ?.name ||
                      paySchedules.find(schedule => schedule.uuid === payPeriod?.payScheduleUuid)
                        ?.customName}
                  </Text>
                </Flex>
              )
            },
            title: t('tableHeaders.0'),
          },
          {
            render: ({ payrollType }) => <Text>{t(`type.${payrollType}`)}</Text>,
            title: t('tableHeaders.1'),
          },
          {
            render: ({ checkDate }) => (
              <Text>
                {checkDate
                  ? parseDateStringToLocal(checkDate)?.toLocaleDateString(locale, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : null}
              </Text>
            ),
            title: t('tableHeaders.2'),
          },
          {
            title: t('tableHeaders.3'),
            render: ({ payrollDeadline }) => (
              <Text>
                {payrollDeadline?.toLocaleDateString(locale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            ),
          },
          {
            title: t('tableHeaders.4'),
            render: ({ processed }) => (
              <Badge>{processed ? t('status.processed') : t('status.unprocessed')}</Badge>
            ),
          },
        ]}
        data={payrolls}
        label={t('payrollsListLabel')}
        itemMenu={({ payrollUuid, calculatedAt, processed, payPeriod }) => {
          if (processed) {
            return null
          }

          const isProcessingSkipPayroll = skippingPayrollId === payrollUuid

          const { fullPeriod: payPeriodString } = formatPayPeriod(
            payPeriod?.startDate,
            payPeriod?.endDate,
          )

          return (
            <div className={styles.actionsContainer}>
              {calculatedAt ? (
                <Button
                  isLoading={isProcessingSkipPayroll}
                  onClick={() => {
                    onSubmitPayroll({ payrollId: payrollUuid! })
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
                    onRunPayroll({ payrollId: payrollUuid! })
                  }}
                  title={t('runPayrollTitle')}
                  variant="secondary"
                >
                  {t('runPayrollTitle')}
                </Button>
              )}
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
        primaryActionLabel={t('skipPayrollDialog.confirmButton')}
        closeActionLabel={t('skipPayrollDialog.cancelButton')}
      >
        {t('skipPayrollDialog.body')}
      </Dialog>
    </Flex>
  )
}
