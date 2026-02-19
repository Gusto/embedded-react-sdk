import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import {
  PayrollConfigurationContextual,
  PayrollOverviewContextual,
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

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

export type PayrollExecutionInitialState = 'configuration' | 'overview'

export interface PayrollExecutionFlowProps {
  companyId: string
  payrollId: string
  onEvent: OnEventType<EventType, unknown>
  initialPayPeriod?: PayrollPayPeriodType
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  prefixBreadcrumbs?: FlowBreadcrumb[]
  initialState?: PayrollExecutionInitialState
}

const INITIAL_COMPONENT_MAP = {
  configuration: PayrollConfigurationContextual,
  overview: PayrollOverviewContextual,
} as const

const INITIAL_NAMESPACE_MAP = {
  configuration: 'Payroll.PayrollConfiguration' as const,
  overview: 'Payroll.PayrollOverview' as const,
} as const

export function PayrollExecutionFlow({
  companyId,
  payrollId,
  onEvent,
  initialPayPeriod,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
  initialState = 'configuration',
}: PayrollExecutionFlowProps) {
  const executionFlowMachine = useMemo(() => {
    const baseBreadcrumbs = buildBreadcrumbs(payrollExecutionBreadcrumbsNodes)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...prefixBreadcrumbs, ...trail],
      ]),
    )

    const initialBreadcrumbContext = updateBreadcrumbs(
      initialState,
      {
        breadcrumbs,
      } as PayrollFlowContextInterface,
      {
        startDate: initialPayPeriod?.startDate ?? '',
        endDate: initialPayPeriod?.endDate ?? '',
      },
    )

    return createMachine(
      initialState,
      payrollExecutionMachine,
      (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: INITIAL_COMPONENT_MAP[initialState],
        companyId,
        payrollUuid: payrollId,
        payPeriod: initialPayPeriod,
        progressBarType: 'breadcrumbs' as const,
        currentBreadcrumbId: initialState,
        withReimbursements,
        ConfirmWireDetailsComponent,
        progressBarCta: SaveAndExitCta,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: INITIAL_NAMESPACE_MAP[initialState],
        },
      }),
    )
  }, [
    companyId,
    payrollId,
    withReimbursements,
    ConfirmWireDetailsComponent,
    prefixBreadcrumbs,
    initialState,
  ])

  return <Flow machine={executionFlowMachine} onEvent={onEvent} />
}
