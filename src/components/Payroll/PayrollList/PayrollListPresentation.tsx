import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

//TODO: Use Speakeasy type
interface PayrollItem {
  payrollId: string
}
interface PayrollListPresentationProps {
  onRunPayroll: ({ payrollId }: PayrollItem) => void
  payrolls: PayrollItem[]
}
export const PayrollListPresentation = ({
  onRunPayroll,
  payrolls,
}: PayrollListPresentationProps) => {
  const { Badge, Button, Text } = useComponentContext()
  return (
    <DataView
      columns={[
        {
          render: () => (
            <Flex flexDirection="column">
              <Text>Jul 5 - Jul 18, 2025</Text>
              <Text>Regular Payroll</Text>
            </Flex>
          ),
          title: 'Pay period',
        },
        {
          title: 'Run by',
          render: () => <Text>Wed Jul 23, 2025</Text>,
        },
        {
          title: 'Status',
          render: () => <Badge>Ready to submit</Badge>,
        },
      ]}
      data={payrolls}
      label="Payrolls"
      itemMenu={({ payrollId }) => (
        <Button
          onClick={() => {
            onRunPayroll({ payrollId })
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
