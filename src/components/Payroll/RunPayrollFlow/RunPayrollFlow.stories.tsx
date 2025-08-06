import {
  createContext,
  use,
  useContext,
  useReducer,
  useState,
  type ActionDispatch,
  type ReactNode,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { action } from '@ladle/react'
import { DataView, Flex, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { Form } from '@/components/Common/Form'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/Run Payroll/Flow',
}

// **** PRESENTATIONAL ****
// **** PRESENTATIONAL ****
// **** PRESENTATIONAL ****

interface PayrollListProps {
  onRunPayroll: ({ payrollId }: { payrollId: string }) => void
  payrolls: any[]
}
const PayrollList = ({ onRunPayroll, payrolls }: PayrollListProps) => {
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
export const PayrollListStory = () => {
  return <PayrollList payrolls={[{ payrollId: 'abcd' }]} onRunPayroll={action('run_payroll')} />
}

const PayrollConfiguration = ({ employees, onBack, onEdit, onCalculatePayroll }) => {
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
export const PayrollConfigurationStory = () => {
  return (
    <PayrollConfiguration
      employees={[{ employeeId: 'cdef' }]}
      onBack={action('on_back')}
      onCalculatePayroll={action('on_calculate')}
      onEdit={action('on_edit')}
    />
  )
}

export const PayrollEditEmployee = ({ onDone }) => {
  const { Button, Heading, Text } = useComponentContext()
  const formHandlers = useForm()
  return (
    <Flex flexDirection="column" gap={20}>
      <Heading as="h2">Edit Hannah Arendt's payroll</Heading>
      <Heading as="h1">$1,173.08</Heading>
      <Text>Gross pay</Text>
      <Heading as="h3">Regular hours</Heading>
      <FormProvider {...formHandlers}>
        <Form>
          <NumberInputField defaultValue={40} isRequired label="Hours" name="hours" />
        </Form>
      </FormProvider>

      <Button onClick={onDone} title="Done">
        Done
      </Button>
    </Flex>
  )
}

export const PayrollOverview = ({ onEdit, onSubmit }) => {
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
      <Alert label="Your progress has been saved" status="success"></Alert>
      <Alert
        label="To pay your employees with direct deposit on Fri, Jul 25, you'll need to run payroll by 7:00 PM EDT on Wed, Jul 23"
        status="warning"
      >
        {"If you miss this deadline, your employees' direct deposit will be delayed."}
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
            title: 'Gross Pay',
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

// **** BLOCKS ****
// **** BLOCKS ****
// **** BLOCKS ****

// TODO: Replace this hook with call to Speakeasy instead
const useEditEmployeeApi = ({ employeeId }) => {
  const mutate = async () => {}
  return { mutate }
}
const PayrollEditEmployeeBlock = ({ employeeId, onEvent, onSaved }) => {
  const { mutate } = useEditEmployeeApi({ employeeId })
  const onDone = async () => {
    await mutate()
    onSaved()
  }
  return (
    <BaseComponent onEvent={onEvent}>
      <PayrollEditEmployee onDone={onDone} />
    </BaseComponent>
  )
}

// TODO: Replace this hook with call to Speakeasy instead
const usePayrollApi = ({ payrollId }) => {
  return {
    data: {
      employees: [{ employeeId: 'cdef' }],
    },
  }
}
// TODO: Replace this hook with call to Speakeasy instead
const useCalculatePayrollApi = ({ payrollId }) => {
  const mutate = async () => {}
  return { mutate }
}
const PayrollConfigurationBlock = ({ onBack, onEvent, onCalculated, payrollId }) => {
  const {
    data: { employees },
  } = usePayrollApi({ payrollId })
  const { mutate } = useCalculatePayrollApi({ payrollId })
  const [editedEmployeeId, setEditedEmployeeId] = useState(undefined)
  const onCalculatePayroll = async () => {
    await mutate({ payrollId })
    onCalculated()
  }
  const onEdit = ({ employeeId }) => {
    setEditedEmployeeId(employeeId)
  }
  const onSaved = () => {
    setEditedEmployeeId(undefined)
  }

  const childComponent = editedEmployeeId ? (
    <PayrollEditEmployeeBlock onEvent={onEvent} employeeId={editedEmployeeId} onSaved={onSaved} />
  ) : (
    <PayrollConfiguration
      employees={employees}
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
    />
  )

  return <BaseComponent onEvent={onEvent}>{childComponent}</BaseComponent>
}

// TODO: Replace this hook with call to Speakeasy instead
const useSubmitPayrollApi = ({ payrollId }) => {
  const mutate = async () => {}
  return { mutate }
}
const useListCompanyPayrollsApi = ({ companyId }) => {
  return {
    data: [{ payrollId: 'abcd' }],
  }
}
export const DemoRunPayrollFlow = ({ companyId, onEvent }) => {
  const [currentPayrollId, setCurrentPayrollId] = useState(undefined)
  const [isCalculated, setIsCalculated] = useState(false)
  const { data: payrolls } = useListCompanyPayrollsApi({ companyId })
  const { mutate } = useSubmitPayrollApi({ payrollId: currentPayrollId })

  const onEdit = () => {
    setIsCalculated(false)
  }
  const onBack = () => {
    setCurrentPayrollId(undefined)
  }
  const onSubmit = async () => {
    await mutate()
    setIsCalculated(false)
    setCurrentPayrollId(undefined)
  }
  const onRunPayroll = ({ payrollId }) => {
    setCurrentPayrollId(payrollId)
  }
  const onCalculated = () => {
    setIsCalculated(true)
  }

  const childComponent = currentPayrollId ? (
    isCalculated ? (
      <PayrollOverview onEdit={onEdit} onSubmit={onSubmit} />
    ) : (
      <PayrollConfigurationBlock
        onBack={onBack}
        onCalculated={onCalculated}
        onEvent={onEvent}
        payrollId={currentPayrollId}
      />
    )
  ) : (
    <PayrollList payrolls={payrolls} onRunPayroll={onRunPayroll} />
  )

  return <BaseComponent onEvent={onEvent}>{childComponent}</BaseComponent>
}
