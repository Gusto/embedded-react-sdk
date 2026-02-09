import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
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

export interface PayrollExecutionFlowProps {
  companyId: string
  payrollId: string
  onEvent: (type: string, data?: unknown) => void
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  prefixBreadcrumbs?: FlowBreadcrumb[]
  initialPayPeriod?: PayrollPayPeriodType
}

export function PayrollExecutionFlow({
  companyId,
  payrollId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  prefixBreadcrumbs = [],
  initialPayPeriod,
}: PayrollExecutionFlowProps) {
  const executionFlowMachine = useMemo(() => {
    const baseBreadcrumbs = buildBreadcrumbs(payrollExecutionBreadcrumbsNodes)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...prefixBreadcrumbs, ...trail],
      ]),
    )

    const initialBreadcrumbContext = initialPayPeriod
      ? updateBreadcrumbs(
          'configuration',
          {
            breadcrumbs,
          } as PayrollFlowContextInterface,
          {
            startDate: initialPayPeriod.startDate ?? '',
            endDate: initialPayPeriod.endDate ?? '',
          },
        )
      : updateBreadcrumbs('configuration', {
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
        payPeriod: initialPayPeriod,
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
  }, [
    companyId,
    payrollId,
    withReimbursements,
    ConfirmWireDetailsComponent,
    prefixBreadcrumbs,
    initialPayPeriod,
  ])

  return <Flow machine={executionFlowMachine} onEvent={onEvent} />
}
