import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import { useTranslation } from 'react-i18next'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollId }: { payrollId: NonNullable<Payroll['payrollUuid']> }) => void
  payrolls: Payroll[]
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

  return (
    <DataView
      columns={[
        {
          render: ({ payPeriod }) => (
            <Flex flexDirection="column">
              <Text>
                {payPeriod?.startDate} - {payPeriod?.endDate}
              </Text>
              <Text>
                {paySchedules.find(schedule => schedule.uuid === payPeriod?.payScheduleUuid)
                  ?.name ||
                  paySchedules.find(schedule => schedule.uuid === payPeriod?.payScheduleUuid)
                    ?.customName}
              </Text>
            </Flex>
          ),
          title: t('tableHeaders.0'),
        },
        {
          title: t('tableHeaders.1'),
          render: ({ payrollDeadline }) => <Text>{payrollDeadline?.toLocaleDateString()}</Text>,
        },
        {
          title: t('tableHeaders.2'),
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
