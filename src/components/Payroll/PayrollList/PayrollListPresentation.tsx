import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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
          title: 'Pay period',
        },
        {
          title: 'Run by',
          render: ({ payrollDeadline }) => <Text>{payrollDeadline?.toLocaleDateString()}</Text>,
        },
        {
          title: 'Status',
          render: ({ processed }) => <Badge>{processed ? 'Processed' : 'Unprocessed'}</Badge>,
        },
      ]}
      data={payrolls}
      label="Payrolls"
      itemMenu={({ payrollUuid }) => (
        <Button
          onClick={() => {
            onRunPayroll({ payrollId: payrollUuid! })
          }}
          title="Run payroll"
          variant="secondary"
        >
          Run payroll
        </Button>
      )}
    />
  )
}
