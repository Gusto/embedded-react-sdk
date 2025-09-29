import { useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import type { BaseComponentInterface } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType, runPayrollEvents } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { firstLastName } from '@/helpers/formattedStrings'
import { useI18n } from '@/i18n'
type PayrollFlowEvent = (typeof runPayrollEvents)[keyof typeof runPayrollEvents]
type PayrollFlowAction =
  | {
      type: Extract<
        PayrollFlowEvent,
        'runPayroll/back' | 'runPayroll/edit' | 'runPayroll/calculated' | 'runPayroll/submitted'
      >
    }
  | {
      type: Extract<PayrollFlowEvent, 'runPayroll/selected'>
      payload: { payrollId: string }
    }
  | {
      type: Extract<PayrollFlowEvent, 'runPayroll/employee/edit'>
      payload: { employeeId: string }
    }
  | {
      type: Extract<PayrollFlowEvent, 'runPayroll/employee/saved' | 'runPayroll/employee/cancelled'>
    }
  | {
      type: Extract<PayrollFlowEvent, 'runPayroll/cancelled'>
    }
  | {
      type: Extract<PayrollFlowEvent, 'runPayroll/receipt/get'>
      payload: { payrollId: string }
    }

interface PayrollFlowState {
  currentPayrollId?: string
  isCalculated: boolean
  editedEmployeeId?: string
  showReceipt: boolean
}
const createInitialPayrollFlowState: () => PayrollFlowState = () => ({
  currentPayrollId: undefined,
  isCalculated: false,
  editedEmployeeId: undefined,
  showReceipt: false,
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
    case 'runPayroll/edit':
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
    case 'runPayroll/employee/edit': {
      return {
        ...state,
        editedEmployeeId: action.payload.employeeId,
      }
    }
    case 'runPayroll/employee/saved':
    case 'runPayroll/employee/cancelled': {
      return {
        ...state,
        editedEmployeeId: undefined,
      }
    }
    case componentEvents.RUN_PAYROLL_CANCELLED: {
      return {
        ...state,
        isCalculated: false,
        currentPayrollId: undefined,
      }
    }
    case componentEvents.RUN_PAYROLL_RECEIPT_GET: {
      return {
        ...state,
        isCalculated: true,
        showReceipt: true,
        currentPayrollId: action.payload.payrollId,
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
    alerts,
  }: Pick<BaseComponentInterface, 'onEvent'> & {
    payrollId: string
    companyId: string
    alerts?: React.ReactNode
  }) => React.JSX.Element
  Landing: ({
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
  EditEmployee: ({
    onEvent,
    employeeId,
    companyId,
    payrollId,
  }: Pick<BaseComponentInterface, 'onEvent'> & {
    employeeId: string
    companyId: string
    payrollId: string
  }) => React.JSX.Element
}

export const RunPayroll = ({
  companyId,
  Configuration,
  Landing,
  onEvent,
  Overview,
  EditEmployee,
}: RunPayrollProps) => {
  useI18n('Payroll.RunPayroll')
  const { t } = useTranslation('Payroll.RunPayroll')

  const [{ isCalculated, currentPayrollId, editedEmployeeId, showReceipt }, dispatch] = useReducer(
    runPayrollFlowReducer,
    createInitialPayrollFlowState(),
  )
  const [employeeSavedAlert, setEmployeeSavedAlert] = useState<{ employeeName: string } | null>(
    null,
  )

  const Components = useComponentContext()

  const handleDismissEmployeeSavedAlert = () => {
    setEmployeeSavedAlert(null)
  }

  const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
    if (event === componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED) {
      const employee = (payload as { employee?: Employee }).employee
      if (employee) {
        const employeeName = firstLastName({
          first_name: employee.firstName,
          last_name: employee.lastName,
        })
        setEmployeeSavedAlert({ employeeName })
      }
    }

    dispatch({ type: event, payload } as PayrollFlowAction)
    onEvent(event as EventType, payload)
  }

  const alerts = employeeSavedAlert ? (
    <Components.Alert
      status="success"
      label={t('alerts.employeeUpdated.label', { name: employeeSavedAlert.employeeName })}
      onDismiss={handleDismissEmployeeSavedAlert}
    />
  ) : undefined

  if (editedEmployeeId && currentPayrollId) {
    return (
      <EditEmployee
        onEvent={wrappedOnEvent}
        employeeId={editedEmployeeId}
        companyId={companyId}
        payrollId={currentPayrollId}
      />
    )
  }

  if (showReceipt && currentPayrollId) {
    return <PayrollReceipts onEvent={wrappedOnEvent} payrollId={currentPayrollId} />
  }

  return currentPayrollId ? (
    isCalculated ? (
      <Overview companyId={companyId} onEvent={wrappedOnEvent} payrollId={currentPayrollId} />
    ) : (
      <Configuration
        onEvent={wrappedOnEvent}
        payrollId={currentPayrollId}
        companyId={companyId}
        alerts={alerts}
      />
    )
  ) : (
    <Landing companyId={companyId} onEvent={wrappedOnEvent} />
  )
}
