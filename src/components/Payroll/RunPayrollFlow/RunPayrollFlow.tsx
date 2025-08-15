import { useReducer } from 'react'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollConfigurationBlock } from '../PayrollConfiguration/PayrollConfigurationBlock'
import { PayrollListBlock } from '../PayrollList/PayrollListBlock'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

//TODO: Use Speakeasy type
interface PayrollItem {
  payrollId: string
}

// TODO: Replace this hook with call to Speakeasy instead
const useSubmitPayrollApi = ({ payrollId }: PayrollItem) => {
  const mutate = async () => {}
  return { mutate }
}

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

  const { mutate } = useSubmitPayrollApi({ payrollId: currentPayrollId! })

  const onEdit = () => {
    dispatch({ type: 'edit_payroll' })
  }
  const onBack = () => {
    dispatch({ type: 'back_configure' })
  }
  const onSubmit = async () => {
    await mutate()
    dispatch({ type: 'submit_payroll' })
  }
  const onCalculated = () => {
    dispatch({ type: 'payroll_calculated' })
  }

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    switch (event) {
      case componentEvents.RUN_PAYROLL_SELECTED:
        dispatch({ type: 'run_payroll', payload: payload as { payrollId: string } })
        break
    }
    onEvent(event, payload)
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
    <PayrollListBlock companyId={companyId} onEvent={wrappedOnEvent} />
  )

  return <BaseComponent onEvent={onEvent}>{childComponent}</BaseComponent>
}
