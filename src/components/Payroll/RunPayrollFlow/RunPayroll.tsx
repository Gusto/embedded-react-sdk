import { useReducer } from 'react'
import type { BaseComponentInterface } from '@/components/Base/Base'
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

interface RunPayrollProps extends Pick<BaseComponentInterface, 'onEvent'> {
  companyId: string
  Configuration: ({
    onEvent,
    payrollId,
    companyId,
  }: Pick<BaseComponentInterface, 'onEvent'> & {
    payrollId: string
    companyId: string
  }) => React.JSX.Element
  List: ({
    companyId,
    onEvent,
  }: Pick<BaseComponentInterface, 'onEvent'> & { companyId: string }) => React.JSX.Element
  Overview: ({
    companyId,
    onEvent,
    payrollId,
  }: Pick<BaseComponentInterface, 'onEvent'> & {
    companyId: string
    payrollId: string
  }) => React.JSX.Element
}

export const RunPayroll = ({
  companyId,
  Configuration,
  List,
  onEvent,
  Overview,
}: RunPayrollProps) => {
  const [{ isCalculated, currentPayrollId }, dispatch] = useReducer(
    runPayrollFlowReducer,
    createInitialPayrollFlowState(),
  )

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    dispatch({ type: event, payload } as PayrollFlowAction)
    onEvent(event as EventType, payload)
  }

  return currentPayrollId ? (
    isCalculated ? (
      <Overview companyId={companyId} onEvent={wrappedOnEvent} payrollId={currentPayrollId} />
    ) : (
      <Configuration onEvent={wrappedOnEvent} payrollId={currentPayrollId} companyId={companyId} />
    )
  ) : (
    <List companyId={companyId} onEvent={wrappedOnEvent} />
  )
}
