import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import {
  PayrollConfigurationContextual,
  SaveAndExitCta,
  type PayrollFlowContextInterface,
} from '../PayrollFlow/PayrollFlowComponents'
import {
  payrollExecutionMachine,
  payrollExecutionBreadcrumbsNodes,
} from './payrollExecutionMachine'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface PayrollExecutionFlowProps {
  companyId: string
  payrollId: string
  onEvent: OnEventType<EventType, unknown>
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  prefixBreadcrumbs?: FlowBreadcrumb[]
}

export function PayrollExecutionFlow({
  companyId,
  payrollId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  prefixBreadcrumbs = [],
}: PayrollExecutionFlowProps) {
  const executionFlowMachine = useMemo(() => {
    const baseBreadcrumbs = buildBreadcrumbs(payrollExecutionBreadcrumbsNodes)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...prefixBreadcrumbs, ...trail],
      ]),
    )

    const initialBreadcrumbContext = updateBreadcrumbs('configuration', {
      breadcrumbs,
    } as PayrollFlowContextInterface)

    return createMachine(
      'configuration',
      payrollExecutionMachine,
      (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: PayrollConfigurationContextual,
        companyId,
        payrollUuid: payrollId,
        progressBarType: 'breadcrumbs' as const,
        currentBreadcrumbId: 'configuration',
        withReimbursements,
        ConfirmWireDetailsComponent,
        progressBarCta: SaveAndExitCta,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: 'Payroll.PayrollConfiguration' as const,
        },
      }),
    )
  }, [companyId, payrollId, withReimbursements, ConfirmWireDetailsComponent, prefixBreadcrumbs])

  return <Flow machine={executionFlowMachine} onEvent={onEvent} />
}
