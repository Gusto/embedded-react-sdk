import { createContext, useContext, useReducer, type ActionDispatch, type ReactNode } from 'react'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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
    ></DataView>
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

const PayrollConfiguration = () => <></>
const PayrollOverview = () => <></>
const PayrollSummary = () => <></>

const steps = {
  list: PayrollListStep,
  configuration: PayrollConfiguration,
  overview: PayrollOverview,
  summary: PayrollSummary,
}

export const Default = () => {
  return <Stepper steps={steps} />
}
