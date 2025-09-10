import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface PayrollOverviewProps {
  onEdit: () => void
  onSubmit: () => void
}

export const PayrollOverviewPresentation = ({ onEdit, onSubmit }: PayrollOverviewProps) => {
  const { Alert, Button, Heading, Text } = useComponentContext()

  return (
    <Flex flexDirection="column" alignItems="stretch">
      <Flex justifyContent="space-between">
        <Heading as="h1">Review payroll for Jul 5 - Jul 18, 2025</Heading>
        <Flex justifyContent="flex-end">
          <Button title="Edit" onClick={onEdit} variant="secondary">
            Edit
          </Button>
          <Button title="Submit" onClick={onSubmit}>
            Submit
          </Button>
        </Flex>
      </Flex>
      <Alert label="Progress saved" status="success"></Alert>
      <Alert label="Direct deposit deadline: Fri, Jul 25" status="warning">
        You missed the deadline to make changes for this payroll. Any changes you make will be
        applied to the next payroll.
      </Alert>
      <Heading as="h3">Payroll Summary</Heading>
      <DataView
        label="Summary"
        columns={[
          {
            title: 'Total payroll',
            render: () => <Text>$32,161.22</Text>,
          },
          {
            title: 'Debit amount',
            render: () => <Text>$28,896.27</Text>,
          },
        ]}
        data={[{}]}
      />
      <DataView
        label="Configuration"
        columns={[
          {
            title: 'Employees',
            render: () => <Text>John Smith</Text>,
          },
          {
            title: 'Gross pay',
            render: () => <Text>$2,345.16</Text>,
          },
          {
            title: 'Reimbursements',
            render: () => <Text>$0.00</Text>,
          },
        ]}
        data={[{}]}
      />
    </Flex>
  )
}
