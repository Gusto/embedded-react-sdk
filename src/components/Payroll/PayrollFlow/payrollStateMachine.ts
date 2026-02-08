import { type PayrollFlowContextInterface, PayrollLandingContextual } from './PayrollFlowComponents'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

export const payrollFlowBreadcrumbsNodes: BreadcrumbNodes = {
  landing: {
    parent: null,
    item: {
      id: 'landing',
      label: 'breadcrumbs.landing',
      namespace: 'Payroll.PayrollLanding',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...ctx,
        currentBreadcrumbId: 'landing',
        progressBarType: null,
        component: PayrollLandingContextual,
      })) as (context: unknown) => unknown,
    },
  },
}
