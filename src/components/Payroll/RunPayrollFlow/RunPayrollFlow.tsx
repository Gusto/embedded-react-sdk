import { useReducer } from 'react'
import { PayrollConfigurationBlock } from '../PayrollConfiguration/PayrollConfigurationBlock'
import { PayrollListBlock } from '../PayrollList/PayrollListBlock'
import { PayrollOverviewBlock } from '../PayrollOverview/PayrollOverviewBlock'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType, runPayrollEvents } from '@/shared/constants'

type PayrollFlowEvent = (typeof runPayrollEvents)[keyof typeof runPayrollEvents]
type PayrollFlowAction =
  | {
      type: Extract<
        PayrollFlowEvent,
        'runPayroll/back' | 'runPayroll/edited' | 'runPayroll/calculated' | 'runPayroll/submitted'
      >
    }
  | {
      type: Extract<PayrollFlowEvent, 'runPayroll/selected'>
      payload: { payrollId: string }
    }

interface PayrollFlowState {
  currentPayrollId?: string
  isCalculated: boolean
}
const createInitialPayrollFlowState: () => PayrollFlowState = () => ({
  currentPayrollId: undefined,
  isCalculated: false,
})

const runPayrollFlowReducer: (
  state: PayrollFlowState,
  action: PayrollFlowAction,
) => PayrollFlowState = (state, action) => {
  switch (action.type) {
    case 'runPayroll/back':
      return {
        ...state,
        currentPayrollId: undefined,
      }
    case 'runPayroll/edited':
      return {
        ...state,
        isCalculated: false,
      }
    case 'runPayroll/calculated':
      return {
        ...state,
        isCalculated: true,
      }
    case 'runPayroll/selected': {
      return {
        ...state,
        currentPayrollId: action.payload.payrollId,
      }
    }
    case 'runPayroll/submitted': {
      return {
        ...state,
        isCalculated: false,
        currentPayrollId: undefined,
      }
    }
    default:
      return state
  }
}

interface RunPayrollFlowProps extends BaseComponentInterface {
  companyId: string
}

export const RunPayrollFlow = ({ companyId, onEvent }: RunPayrollFlowProps) => {
  const [{ isCalculated, currentPayrollId }, dispatch] = useReducer(
    runPayrollFlowReducer,
    createInitialPayrollFlowState(),
  )

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    dispatch({ type: event, payload } as PayrollFlowAction)
    onEvent(event as EventType, payload)
  }

  const childComponent = currentPayrollId ? (
    isCalculated ? (
      <PayrollOverviewBlock onEvent={wrappedOnEvent} payrollId={currentPayrollId} />
    ) : (
      <PayrollConfigurationBlock onEvent={wrappedOnEvent} payrollId={currentPayrollId} />
    )
  ) : (
    <PayrollListBlock companyId={companyId} onEvent={wrappedOnEvent} />
  )

  return <BaseComponent onEvent={onEvent}>{childComponent}</BaseComponent>
}
