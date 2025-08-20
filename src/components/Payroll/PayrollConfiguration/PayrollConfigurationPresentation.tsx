import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'

//TODO: Use Speakeasy type
interface Employee {
  employeeId: string
}

interface PayrollConfigurationPresentationProps {
  employees: Employee[]
  onBack: () => void
  onCalculatePayroll: () => void
  onEdit: (employee: Employee) => void
}

export const PayrollConfigurationPresentation = ({
  employees,
  onBack,
  onEdit,
  onCalculatePayroll,
}: PayrollConfigurationPresentationProps) => {
  const { Alert, Button, Heading, Text } = useComponentContext()

  return (
    <Flex flexDirection="column">
      <Flex justifyContent="space-between">
        <Heading as="h1">Run payroll for Jul 5 - Jul 18, 2025</Heading>
        <Button title="Calculate payroll" onClick={onCalculatePayroll}>
          Calculate payroll
        </Button>
      </Flex>
      <Text>Regular payroll</Text>
      <Flex flexDirection="column" alignItems="stretch">
        <Alert
          label="To pay your employees with direct deposit on Fri, Jul 25, you'll need to run payroll by 7:00 PM EDT on Wed, Jul 23"
          status="info"
        >
          {"If you miss this deadline, your employees' direct deposit will be delayed."}
        </Alert>
        <Alert label="2 employees will be skipped this payroll" status="warning">
          <ul>
            <li>John Smith - Employee address not verified</li>
            <li>Jensen Cooper - Employee address not verified</li>
          </ul>
        </Alert>
      </Flex>

      <Heading as="h3">Hours and additional earnings</Heading>
      <Text>Review and update...</Text>
      <DataView
        label="Configuration"
        columns={[
          {
            title: 'Employees',
            render: () => (
              <Flex flexDirection="column">
                <Text>John Smith</Text>
                <Text>$22.00/hr</Text>
              </Flex>
            ),
          },
          {
            title: 'Hours',
            render: () => <Text>40</Text>,
          },
        ]}
        data={employees}
        itemMenu={({ employeeId }) => (
          <HamburgerMenu
            items={[
              {
                label: 'Edit',
                icon: <PencilSvg aria-hidden />,
                onClick: () => {
                  onEdit({ employeeId })
                },
              },
            ]}
            triggerLabel="Edit"
            isLoading={false}
          />
        )}
      />
      <Button title="Back" onClick={onBack}>
        Back
      </Button>
    </Flex>
  )
}
