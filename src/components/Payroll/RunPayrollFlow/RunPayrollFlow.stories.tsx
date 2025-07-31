import { createContext, useContext, useReducer, type ActionDispatch, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { DataView, Flex, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { Form } from '@/components/Common/Form'

export default {
  title: 'Domain/Run Payroll/Flow',
}

interface StepState {
  step: number
}

interface StepAction {
  type: 'next' | 'back'
}

const stepReducer = (state: StepState, action: StepAction) => {
  switch (action.type) {
    case 'next':
      if (state.step < Object.keys(steps).length - 1) {
        return {
          ...state,
          step: (state.step += 1),
        }
      }
      break
    case 'back':
      if (state.step > 0) {
        return {
          ...state,
          step: (state.step -= 1),
        }
      }
  }

  return state
}

const StepContext = createContext<ActionDispatch<[action: StepAction]>>(() => {
  throw new Error(`useStepper must be used within a child of a Stepper component.`)
})

const useStepper = () => {
  const dispatch = useContext(StepContext)

  const backStep = () => {
    dispatch({ type: 'back' })
  }
  const nextStep = () => {
    dispatch({ type: 'next' })
  }

  return {
    backStep,
    nextStep,
  }
}

interface StepperProps {
  steps: { [stepName: string]: () => ReactNode }
}

// TODO: Think on name a bit. Step router? Is this a router?
export const Stepper = ({ steps }: StepperProps) => {
  const [state, dispatch] = useReducer(stepReducer, { step: 0 })
  const StepComponent = Object.values(steps)[state.step]

  if (!StepComponent) {
    throw new Error('Invalid step')
  }

  return (
    <StepContext.Provider value={dispatch}>
      <StepComponent />
    </StepContext.Provider>
  )
}

interface PayrollListProps {
  onRunPayroll: ({ uuid }: { uuid: string }) => void
}
export const PayrollList = ({ onRunPayroll }: PayrollListProps) => {
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
      data={[{ uuid: '1234' }]}
      label="Payrolls"
      itemMenu={({ uuid }) => (
        <Button
          onClick={() => {
            onRunPayroll({ uuid })
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

const PayrollListStep = () => {
  const { nextStep } = useStepper()
  return (
    <PayrollList
      onRunPayroll={() => {
        nextStep()
      }}
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

export const PayrollConfiguration = ({ onBack, onEdit, onCalculatePayroll }) => {
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
          If you miss this deadline, your employees' direct deposit will be delayed.
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
        data={[{}]}
        itemMenu={() => (
          <HamburgerMenu
            items={[{ label: 'Edit', icon: <PencilSvg aria-hidden />, onClick: onEdit }]}
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

const PayrollConfigurationContext = createContext<ReturnType<typeof useStepper>>({
  backStep: () => {},
  nextStep: () => {},
})

const PayrollConfigurationViewStep = () => {
  const { backStep: flowBackStep, nextStep: flowNextStep } = useContext(PayrollConfigurationContext)
  const { nextStep } = useStepper()

  return (
    <PayrollConfiguration
      onBack={flowBackStep}
      onCalculatePayroll={flowNextStep}
      onEdit={nextStep}
    />
  )
}

const PayrollEditEmployeeStep = () => {
  const { backStep } = useStepper()

  return <PayrollEditEmployee onDone={backStep} />
}

const configurationSteps = {
  configure: PayrollConfigurationViewStep,
  edit: PayrollEditEmployeeStep,
}

const PayrollConfigurationStep = () => {
  const { backStep, nextStep } = useStepper()

  return (
    <PayrollConfigurationContext.Provider value={{ nextStep, backStep }}>
      <Stepper steps={configurationSteps} />
    </PayrollConfigurationContext.Provider>
  )
}

const PayrollOverview = () => <h1>overview</h1>

const steps = {
  list: PayrollListStep,
  configuration: PayrollConfigurationStep,
  overview: PayrollOverview,
}

export const Default = () => {
  return <Stepper steps={steps} />
}
