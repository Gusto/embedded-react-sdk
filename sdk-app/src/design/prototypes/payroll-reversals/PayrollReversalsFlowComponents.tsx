import { payrollReversalEvents } from './events'
import { mockPayrolls, mockEmployees } from './mockData'
import { WarningStep } from './WarningStep'
import { SelectPayrollStep } from './SelectPayrollStep'
import { SelectEmployeesStep } from './SelectEmployeesStep'
import { ReviewStep } from './ReviewStep'
import { DoneStep } from './DoneStep'
import type { PayrollOption } from './types'
import type { BaseComponentInterface } from '@/components/Base'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { EventType } from '@/shared/constants'

export interface PayrollReversalsFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface PayrollReversalsFlowContextInterface extends FlowContextInterface {
  companyId?: string
  selectedPayroll: PayrollOption | null
  selectedEmployeeUuids: string[]
}

export function WarningContextual() {
  const { onEvent } = useFlow<PayrollReversalsFlowContextInterface>()

  return (
    <WarningStep
      onContinue={() => {
        onEvent(payrollReversalEvents.REVERSAL_CONTINUE_TO_PAYROLL_SELECT as EventType)
      }}
      onCancel={() => {
        onEvent(payrollReversalEvents.REVERSAL_CANCEL as EventType)
      }}
    />
  )
}

export function SelectPayrollContextual() {
  const { onEvent } = useFlow<PayrollReversalsFlowContextInterface>()

  return (
    <SelectPayrollStep
      payrolls={mockPayrolls}
      onSelectPayroll={payroll => {
        onEvent(payrollReversalEvents.REVERSAL_PAYROLL_SELECTED as EventType, payroll)
      }}
      onCancel={() => {
        onEvent(payrollReversalEvents.REVERSAL_CANCEL as EventType)
      }}
    />
  )
}

export function SelectEmployeesContextual() {
  const { onEvent, selectedPayroll } = useFlow<PayrollReversalsFlowContextInterface>()
  const payroll = ensureRequired(selectedPayroll ?? undefined)

  return (
    <SelectEmployeesStep
      payroll={payroll}
      employees={mockEmployees}
      onContinue={uuids => {
        onEvent(payrollReversalEvents.REVERSAL_CONTINUE_TO_REVIEW as EventType, uuids)
      }}
      onBack={() => {
        onEvent(payrollReversalEvents.REVERSAL_BACK_TO_PAYROLL as EventType)
      }}
    />
  )
}

export function ReviewContextual() {
  const { onEvent, selectedPayroll, selectedEmployeeUuids } =
    useFlow<PayrollReversalsFlowContextInterface>()
  const payroll = ensureRequired(selectedPayroll ?? undefined)

  return (
    <ReviewStep
      payroll={payroll}
      selectedEmployeeUuids={selectedEmployeeUuids}
      allEmployees={mockEmployees}
      onSubmit={() => {
        onEvent(payrollReversalEvents.REVERSAL_SUBMIT as EventType)
      }}
      onBack={() => {
        onEvent(payrollReversalEvents.REVERSAL_BACK_TO_EMPLOYEES as EventType)
      }}
      onCancel={() => {
        onEvent(payrollReversalEvents.REVERSAL_CANCEL as EventType)
      }}
    />
  )
}

export function DoneContextual() {
  const { onEvent } = useFlow<PayrollReversalsFlowContextInterface>()

  return (
    <DoneStep
      onStartOver={() => {
        onEvent(payrollReversalEvents.REVERSAL_CONTINUE_TO_PAYROLL_SELECT as EventType)
      }}
    />
  )
}
