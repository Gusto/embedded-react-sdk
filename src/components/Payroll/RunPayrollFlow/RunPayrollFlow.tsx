import { useReducer } from 'react'
import { PayrollConfigurationBlock } from '../PayrollConfiguration/PayrollConfigurationBlock'
import { PayrollListBlock } from '../PayrollList/PayrollListBlock'
import { PayrollOverviewBlock } from '../PayrollOverview/PayrollOverviewBlock'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

type PayrollFlowAction =
  | {
      type: 'edit_payroll' | 'back_configure' | 'submit_payroll' | 'payroll_calculated'
    }
  | {
      type: 'run_payroll'
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
//TODO: Replace PayrollFlowAction with componentEvents or extending it?
const runPayrollFlowReducer: (
  state: PayrollFlowState,
  action: PayrollFlowAction,
) => PayrollFlowState = (state, action) => {
  switch (action.type) {
    case 'back_configure':
      return {
        ...state,
        currentPayrollId: undefined,
      }
    case 'edit_payroll':
      return {
        ...state,
        isCalculated: false,
      }
    case 'payroll_calculated':
      return {
        ...state,
        isCalculated: true,
      }
    case 'run_payroll': {
      return {
        ...state,
        currentPayrollId: action.payload.payrollId,
      }
    }
    case 'submit_payroll': {
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

  const onBack = () => {
    dispatch({ type: 'back_configure' })
  }

  const onCalculated = () => {
    dispatch({ type: 'payroll_calculated' })
  }

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    switch (event) {
      case componentEvents.RUN_PAYROLL_SELECTED:
        dispatch({ type: 'run_payroll', payload: payload as { payrollId: string } })
        break
      case componentEvents.RUN_PAYROLL_EDIT:
        dispatch({ type: 'edit_payroll' })
        break
      case componentEvents.RUN_PAYROLL_SUBMITTED:
        dispatch({ type: 'submit_payroll' })
        break
    }
    onEvent(event, payload)
  }

  const childComponent = currentPayrollId ? (
    isCalculated ? (
      <PayrollOverviewBlock onEvent={wrappedOnEvent} payrollId={currentPayrollId} />
    ) : (
      <PayrollConfigurationBlock
        onBack={onBack}
        onCalculated={onCalculated}
        onEvent={onEvent}
        payrollId={currentPayrollId}
      />
    )
  ) : (
    <PayrollListBlock companyId={companyId} onEvent={wrappedOnEvent} />
  )

  return <BaseComponent onEvent={onEvent}>{childComponent}</BaseComponent>
}
