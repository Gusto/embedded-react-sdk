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
  blockers: {
    parent: 'landing',
    item: {
      id: 'blockers',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollBlocker',
    },
  },
  submittedOverview: {
    parent: 'landing',
    item: {
      id: 'submittedOverview',
      label: 'breadcrumbs.overview',
      namespace: 'Payroll.PayrollLanding',
    },
  },
  submittedReceipts: {
    parent: 'landing',
    item: {
      id: 'submittedReceipts',
      label: 'breadcrumbs.receipt',
      namespace: 'Payroll.PayrollLanding',
    },
  },
}
