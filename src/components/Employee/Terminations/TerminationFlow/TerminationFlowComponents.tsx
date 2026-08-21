import type { ReactNode } from 'react'
import { TerminateEmployee } from '../TerminateEmployee/TerminateEmployee'
import { TerminationSummary } from '../TerminationSummary/TerminationSummary'
import type { PayrollOption } from '../types'
import { DismissalFlow } from '@/components/Payroll/Dismissal'
import { PayrollLanding } from '@/components/Payroll/PayrollLanding/PayrollLanding'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link TerminationFlow}.
 *
 * @public
 */
export interface TerminationFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** The employee identifier to terminate. */
  employeeId: string
}

/**
 * Alert payload surfaced by {@link TerminationFlow} on selected events (e.g. `employee/termination/cancelled`).
 *
 * @public
 */
export type TerminationFlowAlert = {
  /** Visual severity of the alert. */
  type: 'error' | 'info' | 'success'
  /** Alert title. */
  title: string
  /** Optional alert body content. */
  content?: ReactNode
}

/** @internal */
export interface TerminationFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  payrollOption?: PayrollOption
  payrollUuid?: string
  alerts?: TerminationFlowAlert[]
}

/** @internal */
export function TerminateEmployeeContextual() {
  const { companyId, employeeId, onEvent, alerts } = useFlow<TerminationFlowContextInterface>()
  const { Alert } = useComponentContext()

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <TerminateEmployee
        onEvent={onEvent}
        companyId={ensureRequired(companyId)}
        employeeId={ensureRequired(employeeId)}
      />
    </Flex>
  )
}

/** @internal */
export function TerminationSummaryContextual() {
  const { companyId, employeeId, payrollOption, payrollUuid, onEvent } =
    useFlow<TerminationFlowContextInterface>()

  return (
    <TerminationSummary
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      payrollOption={payrollOption}
      payrollUuid={payrollUuid}
    />
  )
}

/** @internal */
export function DismissalFlowContextual() {
  const { companyId, employeeId, payrollUuid, onEvent } = useFlow<TerminationFlowContextInterface>()

  return (
    <DismissalFlow
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      payrollId={payrollUuid}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function PayrollLandingContextual() {
  const { companyId, onEvent } = useFlow<TerminationFlowContextInterface>()

  return <PayrollLanding onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
