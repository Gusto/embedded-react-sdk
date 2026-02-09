import { createMachine, state, transition } from 'robot3'
import { useState, useMemo, useCallback } from 'react'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import { PayrollExecutionFlow } from '../PayrollExecutionFlow'
import { payrollFlowBreadcrumbsNodes } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import {
  SaveAndExitCta,
  PayrollLandingContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { componentEvents, type EventType } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

type ActiveFlow = 'landing' | 'execution'

const landingMachine = {
  landing: state<MachineTransition>(
    transition(componentEvents.RUN_PAYROLL_SELECTED, 'landing'),
    transition(componentEvents.REVIEW_PAYROLL, 'landing'),
    transition(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL, 'landing'),
  ),
}

export const PayrollFlow = ({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('landing')
  const [payrollId, setPayrollId] = useState<string | null>(null)
  const [payPeriod, setPayPeriod] = useState<PayrollPayPeriodType | undefined>(undefined)
  const [showPayrollCancelledAlert, setShowPayrollCancelledAlert] = useState(false)

  const handleLandingEvent = useCallback(
    (type: string, data?: unknown) => {
      if (
        (type === componentEvents.RUN_PAYROLL_SELECTED ||
          type === componentEvents.REVIEW_PAYROLL) &&
        data !== null &&
        typeof data === 'object'
      ) {
        const payload = data as { payrollUuid?: string; payPeriod?: PayrollPayPeriodType }
        if (payload.payrollUuid) {
          setPayrollId(payload.payrollUuid)
          setPayPeriod(payload.payPeriod)
          setActiveFlow('execution')
          setShowPayrollCancelledAlert(false)
        }
      }

      onEvent(type as EventType, data)
    },
    [onEvent],
  )

  const handleExecutionEvent = useCallback(
    (type: string, data?: unknown) => {
      if (type === componentEvents.PAYROLL_EXIT_FLOW) {
        setActiveFlow('landing')
        setPayrollId(null)
        setPayPeriod(undefined)
      }

      if (type === componentEvents.RUN_PAYROLL_CANCELLED) {
        setActiveFlow('landing')
        setPayrollId(null)
        setPayPeriod(undefined)
        setShowPayrollCancelledAlert(true)
      }

      onEvent(type as EventType, data)
    },
    [onEvent],
  )

  const landingFlow = useMemo(
    () =>
      createMachine('landing', landingMachine, (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        component: PayrollLandingContextual,
        companyId,
        progressBarType: null,
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumbId: 'landing',
        progressBarCta: SaveAndExitCta,
        withReimbursements,
        ConfirmWireDetailsComponent,
        showPayrollCancelledAlert,
      })),
    [companyId, withReimbursements, ConfirmWireDetailsComponent, showPayrollCancelledAlert],
  )

  if (activeFlow === 'execution' && payrollId) {
    return (
      <PayrollExecutionFlow
        companyId={companyId}
        payrollId={payrollId}
        onEvent={handleExecutionEvent}
        withReimbursements={withReimbursements}
        ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
        initialPayPeriod={payPeriod}
      />
    )
  }

  return <Flow machine={landingFlow} onEvent={handleLandingEvent} />
}
