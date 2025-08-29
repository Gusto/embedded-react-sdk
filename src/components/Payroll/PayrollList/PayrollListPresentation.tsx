import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollId }: { payrollId: NonNullable<Payroll['payrollUuid']> }) => void
  payrolls: Payroll[]
}
export const PayrollListPresentation = ({
  onRunPayroll,
  payrolls,
}: PayrollListPresentationProps) => {
  const { Button, Text } = useComponentContext()
  return (
    <DataView
      columns={[
        {
          render: ({ payPeriod }) => (
            <Flex flexDirection="column">
              <Text>
                {payPeriod?.startDate} - {payPeriod?.endDate}
              </Text>
              <Text>{payPeriod?.payScheduleUuid}</Text>
            </Flex>
          ),
          title: 'Pay period',
        },
        {
          title: 'Run by',
          render: ({ payrollStatusMeta }) => (
            <Text>{payrollStatusMeta?.initialDebitCutoffTime}</Text>
          ),
        },
        // {
        //   title: 'Status',
        //   render: () => <Badge>UNKNOWN</Badge>,
        // },
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
