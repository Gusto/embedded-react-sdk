import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollFlowBreadcrumbsNodes, payrollMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import { PayrollLandingContextual, type PayrollFlowContextInterface } from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { useComponentDictionary, useI18n } from '@/i18n/I18n'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export const PayrollFlow = ({
  companyId,
  onEvent,
  defaultValues,
  dictionary,
}: PayrollFlowProps) => {
  useComponentDictionary('Payroll.Flow', dictionary)
  useI18n('Payroll.Flow')
  const payrollFlow = useMemo(
    () =>
      createMachine('landing', payrollMachine, (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        component: PayrollLandingContextual,
        companyId,
        defaultValues,
        progressBarType: null, //landing step does not show progress bar/breadcrumbs
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumb: 'landing',
      })),
    [companyId, defaultValues],
  )
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
