import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import { useTranslation } from 'react-i18next'
import type { PayrollType } from './types'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'
import { useLocale } from '@/contexts/LocaleProvider'

interface PresentationPayroll extends Payroll {
  payrollType: PayrollType
}

interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollId }: { payrollId: NonNullable<Payroll['payrollUuid']> }) => void
  payrolls: PresentationPayroll[]
  paySchedules: PayScheduleList[]
}

export const PayrollListPresentation = ({
  onRunPayroll,
  payrolls,
  paySchedules,
}: PayrollListPresentationProps) => {
  const { Badge, Button, Text } = useComponentContext()
  useI18n('Payroll.PayrollList')
  const { t } = useTranslation('Payroll.PayrollList')
  const { locale } = useLocale()

  return (
    <DataView
      columns={[
        {
          render: ({ payPeriod }) => {
            const startDate = parseDateStringToLocal(payPeriod!.startDate!)?.toLocaleDateString(
              locale,
              {
                month: 'short',
                day: 'numeric',
              },
            )

            const endDate = parseDateStringToLocal(payPeriod!.endDate!)?.toLocaleDateString(
              locale,
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              },
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
              {parseDateStringToLocal(checkDate!)?.toLocaleDateString(locale, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
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
      itemMenu={({ payrollUuid }) => (
        <Button
          onClick={() => {
            onRunPayroll({ payrollId: payrollUuid! })
          }}
          title={t('runPayrollTitle')}
          variant="secondary"
        >
          {t('runPayrollTitle')}
        </Button>
      )}
    />
  )
}
