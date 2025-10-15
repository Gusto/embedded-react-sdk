import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollFlowBreadcrumbsNodes, payrollMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import { PayrollLandingContextual, type PayrollFlowContextInterface } from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { useComponentDictionary, useI18n } from '@/i18n/I18n'
import { buildBreadcrumbs } from '@/helpers/buildBreadcrumbs'

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
        totalSteps: 1,
        currentStep: 1,
        showProgress: false, // Landing step does not show progress bar/breadcrumbs
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumb: 'list',
      })),
    [companyId, defaultValues],
  )
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
